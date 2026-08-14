import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

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
  const { object } = await generateObject({
    model: getModel(),
    schema: roadmapSchema,
    schemaName: "career_roadmap",
    schemaDescription: "A personalized career roadmap for a student",
    prompt: `You are the Career OS engine. Build a personalized ${totalWeeks}-week roadmap for a student targeting a career role.

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
7. Do not invent certifications that cost money unless widely free (e.g. free courses on YouTube, freeCodeCamp, Kaggle, roadmap.sh).`,
  });

  return object;
}
