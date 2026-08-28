import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Database check — use a simple model query instead of $queryRaw (works with driver adapters)
  try {
    await prisma.user.findFirst({ select: { id: true } });
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Environment variables check
  const requiredEnvVars = ["DATABASE_URL", "AUTH_SECRET"];
  const optionalEnvVars = ["GEMINI_API_KEY", "GROQ_API_KEY", "OPENAI_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "RESEND_API_KEY"];
  const envStatus: Record<string, string> = {};
  for (const key of requiredEnvVars) {
    envStatus[key] = process.env[key] ? "set" : "MISSING";
    if (!process.env[key]) {
      healthy = false;
    }
  }
  for (const key of optionalEnvVars) {
    envStatus[key] = process.env[key] ? "set" : "not set";
  }
  checks.env = JSON.stringify(envStatus);

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
