import "server-only";
import { createGoogle } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { rateLimit, RATE_POLICIES } from "@/lib/rate-limit";
import { auth } from "@/auth";

// ── Provider registry ──────────────────────────────────────────────────────

export type AIProviderName = "gemini" | "groq" | "openai";

interface ProviderEntry {
  name: AIProviderName;
  modelId: string;
  modelName: string; // human-readable for logs
  costPer1kInput: number;
  costPer1kOutput: number;
  create: () => ReturnType<ReturnType<typeof createGoogle>>;
}

const PROVIDERS: ProviderEntry[] = [
  {
    name: "gemini",
    modelId: "gemini-2.5-flash",
    modelName: "Gemini 2.5 Flash",
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    create: () => createGoogle({ apiKey: process.env.GEMINI_API_KEY })("gemini-2.5-flash"),
  },
  {
    name: "groq",
    modelId: "llama-3.1-70b-versatile",
    modelName: "Groq Llama 3.1 70B",
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
    create: () =>
      createOpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      })("llama-3.1-70b-versatile"),
  },
  {
    name: "openai",
    modelId: "gpt-4o-mini",
    modelName: "GPT-4o Mini",
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    create: () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o-mini"),
  },
];

/**
 * Returns the ordered list of providers whose API keys are configured.
 * At least one provider must be available or calls fail deterministically.
 */
function availableProviders(): ProviderEntry[] {
  const gemini = Boolean(process.env.GEMINI_API_KEY);
  const groq = Boolean(process.env.GROQ_API_KEY);
  const openai = Boolean(process.env.OPENAI_API_KEY);

  return PROVIDERS.filter((p) => {
    if (p.name === "gemini") return gemini;
    if (p.name === "groq") return groq;
    return openai;
  });
}

/**
 * True when at least one AI provider is configured. Use this instead of
 * checking a single provider env var so Groq/OpenAI-only deployments work.
 */
export function aiConfigured(): boolean {
  return availableProviders().length > 0;
}

// ── Single-provider access (backward-compatible) ───────────────────────────

/**
 * Returns a model instance from the first available provider.
 * Call sites that just need `getModel()` continue to work unchanged.
 */
export function getModel(modelId?: string) {
  const providers = availableProviders();
  if (providers.length === 0) {
    // Deterministic stub: callers that never hit the network (seed, build-time
    // metadata) keep working. Callers that do hit the network will fail with
    // a clear error from the provider.
    return PROVIDERS[0].create();
  }
  if (modelId) {
    const match = providers.find((p) => p.modelId === modelId);
    if (match) return match.create();
    return providers[0].create();
  }
  return providers[0].create();
}

// ── Failover wrapper ──────────────────────────────────────────────────────

interface FailoverOpts {
  maxRetries?: number;
  userId?: string;
  timeoutMs?: number;
}

/** Thrown when a user has exhausted their per-user AI quota for the window. */
export class AiQuotaError extends Error {
  readonly retryAfterSec: number;
  constructor(retryAfterSec: number, feature: string) {
    super(`AI request limit reached for ${feature}. Try again in ${Math.ceil(retryAfterSec / 60)} minutes.`);
    this.name = "AiQuotaError";
    this.retryAfterSec = retryAfterSec;
  }
}

/**
 * Bounds a single AI call so a hanging provider cannot pin the request
 * indefinitely. The underlying work is abandoned once the deadline passes.
 */
const AI_CALL_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60000);

function withTimeout<T>(promise: Promise<T>, feature: string, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`AI call timed out for "${feature}" after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

/** Resolve the acting user's id from the current session (best effort). */
async function currentUserId(): Promise<string | undefined> {
  try {
    const session = await auth();
    return session?.user?.id ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Executes `generateFn(provider)` trying providers in priority order.
 * On any non-rate-limit error, the next provider is tried.
 * Usage is logged to the AiUsageLog table (with the acting user id).
 * Every call counts against the user's per-user AI quota.
 *
 * @example
 * const { object } = await generateWithFailover(
 *   (model) => generateObject({ model, schema: mySchema, prompt }),
 *   "ROADMAP",
 *   { userId: profile.id },
 * );
 */
export async function generateWithFailover<T>(
  generateFn: (model: ReturnType<ProviderEntry["create"]>) => Promise<T>,
  feature: string,
  opts: FailoverOpts = {},
): Promise<T> {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new Error(`No AI providers configured. Set at least one of: GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY`);
  }

  const userId = opts.userId ?? (await currentUserId());

  // Per-user quota: fail fast and loudly instead of silently burning tokens.
  if (userId) {
    const quota = rateLimit(`ai:${userId}`, RATE_POLICIES.ai);
    if (!quota.ok) throw new AiQuotaError(quota.retryAfterSec, feature);
  }

  let lastError: Error | null = null;
  const maxRetries = Math.max(0, opts.maxRetries ?? 0);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    for (const provider of providers) {
      const t0 = Date.now();
      try {
        const model = provider.create();
        const result = await withTimeout(generateFn(model), feature, opts.timeoutMs ?? AI_CALL_TIMEOUT_MS);
        const latencyMs = Date.now() - t0;

        logUsage({ feature, provider: provider.name, model: provider.modelId, latencyMs, success: true, userId }).catch(() => {});
        return result;
      } catch (err: unknown) {
        const latencyMs = Date.now() - t0;
        const errorType = classifyError(err);
        logUsage({
          feature,
          provider: provider.name,
          model: provider.modelId,
          latencyMs,
          success: false,
          errorType,
          userId,
        }).catch(() => {});
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof AiQuotaError) throw err;
      }
    }
  }

  throw lastError ?? new Error(`AI generation failed for feature="${feature}" after trying all providers`);
}

// ── AI logging ─────────────────────────────────────────────────────────────

function classifyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("429") || msg.includes("rate") || msg.includes("quota")) return "RATE_LIMIT";
  if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) return "TIMEOUT";
  if (msg.includes("500") || msg.includes("502") || msg.includes("503")) return "SERVER_ERROR";
  if (msg.includes("validation") || msg.includes("schema") || msg.includes("parse")) return "VALIDATION";
  return "UNKNOWN";
}

async function logUsage(entry: {
  feature: string;
  provider: string;
  model: string;
  latencyMs: number;
  success: boolean;
  errorType?: string;
  userId?: string;
}): Promise<void> {
  const level = entry.success ? "info" : "warn";
  logger[level](`ai.${entry.success ? "success" : "failure"}`, {
    feature: entry.feature,
    provider: entry.provider,
    model: entry.model,
    latencyMs: entry.latencyMs,
    errorType: entry.errorType,
  });
  try {
    await prisma.aiUsageLog.create({ data: entry });
  } catch {
    // Best-effort: never block the caller for logging failures.
  }
}
