"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { suggestOpportunities } from "@/lib/ai/opportunities";

type OpportunityInput = Parameters<typeof suggestOpportunities>[0];
type OpportunityData = Awaited<ReturnType<typeof suggestOpportunities>>;

export type OpportunityLoadResult =
  | { status: "ready"; data: OpportunityData; generatedAt: string }
  | { status: "pending" };

// A PENDING row older than this is considered stale (the generator process
// died or the server restarted), so another request may take over.
const STALE_GENERATION_MS = 120_000;

async function buildProfileInput() {
  const { profile } = await requireStudentProfile();

  const [skills, projects, guest] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
    }),
    prisma.project.findMany({ where: { studentId: profile.id } }),
    prisma.studentProfile.findUnique({
      where: { id: profile.id },
      select: { githubUrl: true, linkedinUrl: true },
    }),
  ]);

  const input: OpportunityInput = {
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole ?? "",
    year: profile.year ?? "",
    skills: skills.map((s) => s.skill.name).sort(),
    weakSkills: skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name),
    githubUrl: guest?.githubUrl,
    linkedinUrl: guest?.linkedinUrl,
    projectsCount: projects.length,
  };
  return { profile, input };
}

function versionKeyFor(input: OpportunityInput) {
  const fingerprint = [
    input.degree,
    input.specialization,
    input.targetRole,
    input.year,
    input.skills.join(","),
    input.weakSkills.join(","),
    input.githubUrl ?? "",
    input.linkedinUrl ?? "",
    input.projectsCount,
  ].join("|");
  return createHash("sha1").update(fingerprint).digest("hex").slice(0, 16);
}

async function generateAndCache(profileId: string, versionKey: string, input: OpportunityInput) {
  const result = await suggestOpportunities(input);
  await prisma.opportunitySuggestion.upsert({
    where: { studentId: profileId },
    create: { studentId: profileId, data: JSON.stringify(result), versionKey, status: "READY" },
    update: { data: JSON.stringify(result), versionKey, status: "READY" },
  });
  return result;
}

async function markFailed(profileId: string) {
  await prisma.opportunitySuggestion
    .updateMany({ where: { studentId: profileId }, data: { status: "FAILED" } })
    .catch(() => {});
}

/**
 * Claim the right to generate suggestions for this profile, or report the
 * current state. Returns "ready" when an up-to-date cache exists, "running"
 * when another request is already generating, or "claimed" when this request
 * owns generation.
 */
async function claimOrRead(profileId: string, versionKey: string): Promise<"ready" | "running" | "claimed"> {
  const existing = await prisma.opportunitySuggestion.findUnique({ where: { studentId: profileId } });

  if (existing?.status === "READY" && existing.versionKey === versionKey) return "ready";

  const isFreshPending = existing?.status === "PENDING" && Date.now() - existing.updatedAt.getTime() <= STALE_GENERATION_MS;
  if (isFreshPending) return "running";

  // Missing, failed, stale or version-drifted → claim (idempotent upsert).
  await prisma.opportunitySuggestion.upsert({
    where: { studentId: profileId },
    create: { studentId: profileId, data: "{}", versionKey, status: "PENDING" },
    update: { data: "{}", versionKey, status: "PENDING" },
  });
  return "claimed";
}

/**
 * Loads opportunity suggestions without blocking on AI when they are already
 * available. On a cache miss it claims generation and runs it in the
 * background, so the page renders instantly with a status indicator; the
 * client polls getOpportunitySuggestionsStatusAction until it is ready.
 */
export async function getOpportunitySuggestionsAction(): Promise<OpportunityLoadResult> {
  const { profile } = await requireStudentProfile();
  const { input } = await buildProfileInput();
  const versionKey = versionKeyFor(input);

  const state = await claimOrRead(profile.id, versionKey);
  if (state === "ready") {
    const row = await prisma.opportunitySuggestion.findUnique({ where: { studentId: profile.id } });
    if (row) {
      return {
        status: "ready",
        data: JSON.parse(row.data) as OpportunityData,
        generatedAt: row.updatedAt.toISOString(),
      };
    }
  }

  if (state === "claimed") {
    void generateAndCache(profile.id, versionKey, input).catch((e) => {
      console.error("[opportunities] background generation failed", e);
      markFailed(profile.id);
    });
  }

  return { status: "pending" };
}

/** Poll target for the client — returns the generation status only. */
export async function getOpportunitySuggestionsStatusAction(): Promise<{ status: "pending" | "ready" | "failed" }> {
  const { profile } = await requireStudentProfile();
  const row = await prisma.opportunitySuggestion.findUnique({ where: { studentId: profile.id } });
  if (row?.status === "READY") return { status: "ready" };
  if (row?.status === "FAILED") return { status: "failed" };
  return { status: "pending" };
}

/** Explicit refresh: always regenerate immediately and return the result. */
export async function refreshOpportunitySuggestionsAction(): Promise<OpportunityLoadResult> {
  const { profile } = await requireStudentProfile();
  const { input } = await buildProfileInput();
  const versionKey = versionKeyFor(input);

  const result = await generateAndCache(profile.id, versionKey, input);
  revalidatePath("/app/opportunities");
  return { status: "ready", data: result, generatedAt: new Date().toISOString() };
}