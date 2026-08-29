import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { fromJson } from "@/lib/utils";

/**
 * Opportunity Gateway (Section 6.11 / 7): rank external opportunities by how
 * well they match the student's degree, target role and skills, then redirect.
 */
export async function matchOpportunities(prisma: PrismaClient, studentId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      opportunityActions: true,
      skills: { include: { skill: true } },
    },
  });
  if (!profile) return [];

  const role = (profile.targetRole ?? "").toLowerCase();
  const degree = (profile.degree ?? "").toLowerCase();
  const skillNames = profile.skills.map((s) => s.skill.name.toLowerCase());
  const saved = new Set(profile.opportunityActions.filter((a) => a.action !== "VIEWED").map((a) => a.opportunityId));

  const opportunities = await prisma.opportunity.findMany({
    where: { active: true },
    orderBy: { deadline: "asc" },
  });

  const scored = opportunities
    .map((op) => {
      const tags = fromJson<string[]>(op.tags, []);
      const elig = fromJson<string[]>(op.eligibility, []);
      let score = 0;
      for (const tag of tags) {
        const t = tag.toLowerCase();
        if (role && (role.includes(t) || t.includes(role))) score += 3;
        if (skillNames.some((s) => t.includes(s) || s.includes(t))) score += 2;
      }
      for (const e of elig) {
        const el = e.toLowerCase();
        if (degree && el.includes(degree)) score += 2;
      }
      return { opportunity: op, score, saved: saved.has(op.id) };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}
