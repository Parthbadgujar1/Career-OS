"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

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
  college: z.string().trim().max(200, "College name is too long").optional().or(z.literal("")),
  city: z.string().trim().max(100, "City name is too long").optional().or(z.literal("")),
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

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role, mobile, college, city } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    },
  });

  if (role === "STUDENT") {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        mobile: mobile || null,
        college: college || null,
        city: city || null,
      },
    });
  }

  const redirectTo = role === "MENTOR" ? "/mentor" : "/app/assessment";
  try {
    await signIn("credentials", { email: email.toLowerCase(), password, redirectTo });
    return { success: true, redirectTo };
  } catch (error) {
    if (error instanceof Error && "digest" in error && (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      return { success: true, redirectTo };
    }
    return { error: "Account created but login failed. Please log in manually." };
  }
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/app";

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
