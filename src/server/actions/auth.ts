"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { rateLimit, clientIpFrom, RATE_POLICIES } from "@/lib/rate-limit";
import { generateToken } from "@/lib/tokens";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { audit } from "@/lib/audit";
import { safeCallbackUrl } from "@/lib/utils";

// ── Register ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "MENTOR"]).default("STUDENT"),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid mobile number (10–15 digits)")
    .optional()
    .or(z.literal("")),
  college: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
});

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "STUDENT",
    mobile: formData.get("mobile"),
    college: formData.get("college"),
    city: formData.get("city"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { name, email, password, role, mobile, college, city } = parsed.data;
  const emailLower = email.toLowerCase();

  // Rate-limit per IP
  const headers = new Headers();
  const ip = clientIpFrom(headers);
  const rl = rateLimit(`register:${ip}`, RATE_POLICIES.register);
  if (!rl.ok) return { error: `Too many registrations — try again in ${rl.retryAfterSec}s` };

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email: emailLower, passwordHash, role },
  });

  if (role === "STUDENT") {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        mobile: mobile || null,
        college: college || null,
        city: city || null,
        targetRoles: "[]",
        interests: "[]",
        preferredIndustries: "[]",
        preferences: "{}",
      },
    });
  }

  // Email verification token
  const { raw, hashed } = generateToken();
  await prisma.verificationToken.create({
    data: { identifier: emailLower, token: hashed, type: "EMAIL_VERIFY", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  try {
    await sendVerificationEmail(emailLower, raw);
  } catch (e) {
    console.error("[auth] verification email could not be sent", e);
    return { error: "Account created, but the verification email could not be sent. Please contact support." };
  }

  // Welcome email (non-blocking)
  sendWelcomeEmail(emailLower, name).catch((e) => console.error("[auth] welcome email failed", e));

  audit({ actorId: user.id, actorRole: role, action: "REGISTER", metadata: { email: emailLower } });

  const redirectTo = role === "MENTOR" ? "/mentor" : "/app/assessment";
  try {
    await signIn("credentials", { email: emailLower, password, redirectTo });
    return { success: true, redirectTo };
  } catch (error) {
    if (error instanceof Error && "digest" in error && (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      return { success: true, redirectTo };
    }
    return { error: "Account created but login failed. Please log in manually." };
  }
}

// ── Login ─────────────────────────────────────────────────────────────────

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  // Server-side enforcement of the open-redirect guard (client input is untrusted).
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl") as string | null);

  // Server-side rate-limit (also enforced in authorize() callback)
  const headers = new Headers();
  const ip = clientIpFrom(headers);
  const rl = rateLimit(`login:${email.toLowerCase()}:${ip}`, RATE_POLICIES.login);
  if (!rl.ok) return { error: `Too many attempts — try again in ${rl.retryAfterSec}s` };

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
    return { success: true, redirectTo: callbackUrl };
  } catch (error) {
    if (error instanceof Error && "digest" in error && (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      return { success: true, redirectTo: callbackUrl };
    }
    return { error: "Invalid email or password" };
  }
}

// ── Request password reset ────────────────────────────────────────────────

export async function requestPasswordResetAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string) ?? "";
  if (!email) return { error: "Enter your email" };

  const headers = new Headers();
  const ip = clientIpFrom(headers);
  const rl = rateLimit(`pwdreset:${ip}`, RATE_POLICIES.passwordReset);
  if (!rl.ok) return { error: `Too many requests — try again in ${rl.retryAfterSec}s` };

  // Always return success to prevent user enumeration.
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user) {
    const { raw, hashed } = generateToken();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: hashed, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendPasswordResetEmail(user.email, user.name, raw).catch((e) => {
      // Preserve anti-enumeration behavior (always return success) but make a
      // broken email config loud in the server logs.
      console.error("[auth] password reset email could not be sent", e);
    });
    audit({ actorId: user.id, action: "REQUEST_PASSWORD_RESET" });
  }
  return { success: true };
}

// ── Reset password (with token) ───────────────────────────────────────────

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const token = (formData.get("token") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  if (!token || !password) return { error: "Missing token or password" };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };

  const record = await prisma.passwordResetToken.findFirst({
    where: { token, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!record) return { error: "This link has expired or is invalid." };

  const passwordHash = await hash(password, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  audit({ actorId: record.userId, action: "RESET_PASSWORD" });
  return { success: true };
}

// ── Verify email ──────────────────────────────────────────────────────────

export async function verifyEmailAction(token: string) {
  if (!token) return { error: "Missing token" };
  const record = await prisma.verificationToken.findFirst({
    where: { token, type: "EMAIL_VERIFY", expiresAt: { gt: new Date() } },
  });
  if (!record) return { error: "This link is invalid or has expired." };

  await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { id: record.id } });
  audit({ action: "EMAIL_VERIFIED", entityType: "User", metadata: { email: record.identifier } });
  return { success: true };
}

// ── Resend verification email ─────────────────────────────────────────────

export async function resendVerificationAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string) ?? "";
  if (!email) return { error: "Enter your email" };

  const headers = new Headers();
  const ip = clientIpFrom(headers);
  const rl = rateLimit(`verify:${ip}`, RATE_POLICIES.register);
  if (!rl.ok) return { error: "Too many requests — wait a moment" };

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user && !user.emailVerified) {
    const { raw, hashed } = generateToken();
    await prisma.verificationToken.deleteMany({ where: { identifier: email.toLowerCase(), type: "EMAIL_VERIFY" } });
    await prisma.verificationToken.create({
      data: { identifier: email.toLowerCase(), token: hashed, type: "EMAIL_VERIFY", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    await sendVerificationEmail(email.toLowerCase(), raw).catch((e) => {
      console.error("[auth] resend verification email could not be sent", e);
    });
  }
  return { success: true };
}
