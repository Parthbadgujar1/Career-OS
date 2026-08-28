import "server-only";

/**
 * Transactional email via Resend's REST API (no SDK dependency).
 * When RESEND_API_KEY is not configured, emails are logged to the console
 * instead so local development and staging keep working end-to-end.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function appUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Career OS <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[email:not-configured] to=${to} subject="${subject}"`);
    console.info(`[email:body] ${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400)}`);
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[email:error] status=${res.status} body=${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email:error]", err);
    return false;
  }
}

function layout(title: string, body: string, ctaText?: string, ctaHref?: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
    <h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#334155;">${body}</div>
    ${
      ctaText && ctaHref
        ? `<p style="margin:24px 0 8px;"><a href="${ctaHref}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">${ctaText}</a></p>
           <p style="font-size:13px;color:#64748b;word-break:break-all;">Or copy this link: ${ctaHref}</p>`
        : ""
    }
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;margin:0;">NaukriSaathi Career OS · You received this because an account was created with this email.</p>
  </div>
</body></html>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const url = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    "Verify your email — Career OS",
    layout(
      "Verify your email",
      `<p>Welcome to <strong>Career OS</strong>! Confirm your email address to activate your account and unlock your personalised career roadmap.</p>
       <p>This link expires in <strong>24 hours</strong>.</p>`,
      "Verify Email",
      url,
    ),
  );
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
  const url = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    "Reset your password — Career OS",
    layout(
      "Reset your password",
      `<p>Hi ${name},</p>
       <p>We received a request to reset your password. Click below to choose a new one. The link expires in <strong>1 hour</strong>.</p>
       <p>If you didn't request this, you can safely ignore this email — your password will not change.</p>`,
      "Reset Password",
      url,
    ),
  );
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return sendEmail(
    to,
    "Welcome to Career OS 🎯",
    layout(
      `Welcome, ${name}!`,
      `<p>Your account is ready. Here's how to get started:</p>
       <ol style="padding-left:20px;margin:8px 0;">
         <li>Complete your onboarding assessment</li>
         <li>Get your AI-generated career roadmap</li>
         <li>Start completing weekly tasks to raise your readiness score</li>
       </ol>`,
      "Open Dashboard",
      `${appUrl()}/app`,
    ),
  );
}
