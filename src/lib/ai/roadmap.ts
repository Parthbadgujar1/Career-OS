import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { generateWithFailover } from "@/lib/ai/client";

const milestoneSchema = z.object({
  week: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
  category: z.enum(["LEARNING", "CODING", "PROJECT", "PROFILE", "INTERVIEW", "OPPORTUNITY"]),
});

const roadmapSchema = z.object({
  title: z.string(),
  summary: z.string(),
  milestones: z.array(milestoneSchema).min(4),
});

export interface RoadmapInput {
  degree: string;
  specialization: string;
  year: string;
  targetRole: string;
  interests: string[];
  weeklyHours: number;
  skills: { name: string; rating: number }[];
  weakSkills: string[];
}

export async function generateRoadmap(input: RoadmapInput, totalWeeks = 12) {
  const { object } = await generateWithFailover(
    (model) => generateObject({ model, schema: roadmapSchema, schemaName: "career_roadmap", schemaDescription: "A personalized career roadmap for a student", prompt: `You are the Career OS engine. Build a personalized ${totalWeeks}-week roadmap for a student targeting a career role.

STUDENT PROFILE
- Degree: ${input.degree} (${input.specialization || "no specialization"})
- Year: ${input.year}
- Target role: ${input.targetRole}
- Interests: ${input.interests.join(", ") || "not specified"}
- Weekly hours available: ${input.weeklyHours}
- Current skills (name: self-rating 1-5): ${input.skills.map((s) => `${s.name}:${s.rating}`).join(", ") || "none"}
- Weak areas: ${input.weakSkills.join(", ") || "none"}

RULES
1. The roadmap must be beginner → intermediate → advanced, prerequisite-aware.
2. Prioritize the student's weak skills FIRST (e.g. if SQL is weak and role is Data Analyst, SQL comes before advanced ML).
3. Every week must include a mix across categories: LEARNING (a topic to study), CODING (practice), PROJECT (build/progress), and at least one PROFILE, INTERVIEW or OPPORTUNITY task spread through the roadmap.
4. Return exactly one milestone per week for the full ${totalWeeks} weeks.
5. Keep descriptions actionable (what to learn/build/practice) and measurable.
6. Use only the provided category values.
7. Do not invent certifications that cost money unless widely free (e.g. free courses on YouTube, freeCodeCamp, Kaggle, roadmap.sh).` }),
    "ROADMAP",
  );

  return object;
}

const phaseSchema = z.object({
  phase: z.number().int().min(1),
  weekStart: z.number().int().min(1),
  weekEnd: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
  focus: z.enum(["LEARNING", "CODING", "PROJECT", "PROFILE", "INTERVIEW", "OPPORTUNITY"]),
});

const longPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  phases: z.array(phaseSchema).min(4).max(24),
});

export interface LongTermPhase {
  phase: number;
  weekStart: number;
  weekEnd: number;
  title: string;
  description: string;
  focus: "LEARNING" | "CODING" | "PROJECT" | "PROFILE" | "INTERVIEW" | "OPPORTUNITY";
}

/**
 * Generates a phase-based plan for long horizons (1/2/4 years). Each phase spans
 * multiple weeks; the engine expands phases into weekly milestones so the
 * roadmap page works identically for every duration.
 */
export async function generateLongTermPlan(
  input: RoadmapInput,
  totalWeeks: number
): Promise<{ title: string; summary: string; phases: LongTermPhase[] }> {
  const { object } = await generateWithFailover(
    (model) => generateObject({ model, schema: longPlanSchema, schemaName: "career_long_term_plan", schemaDescription: "A phased long-term career plan for a student", prompt: `You are the Career OS engine. Build a personalized long-term plan of ${totalWeeks} weeks (about ${Math.round(totalWeeks / 52 * 10) / 10} year(s)) for a student targeting a career role.

STUDENT PROFILE
- Degree: ${input.degree} (${input.specialization || "no specialization"})
- Year: ${input.year}
- Target role: ${input.targetRole}
- Interests: ${input.interests.join(", ") || "not specified"}
- Weekly hours available: ${input.weeklyHours}
- Current skills (name: self-rating 1-5): ${input.skills.map((s) => `${s.name}:${s.rating}`).join(", ") || "none"}
- Weak areas: ${input.weakSkills.join(", ") || "none"}

RULES
1. Divide the ${totalWeeks} weeks into 4 to 24 phases. Each phase must have a weekStart and weekEnd covering 1..${totalWeeks} with no gaps or overlaps (phase N must start right after phase N-1 ends).
2. Order is beginner → intermediate → advanced, prerequisite-aware. Build weak skills first.
3. Vary the focus across LEARNING, CODING, PROJECT, PROFILE, INTERVIEW and OPPORTUNITY so the plan is well rounded.
4. Every phase title and description must be actionable and measurable for the given role.
5. Keep phases coarse for long horizons (a phase can span many weeks) but every week from 1 to ${totalWeeks} must be covered by exactly one phase.` }),
    "ROADMAP",
  );

  return object;
}
