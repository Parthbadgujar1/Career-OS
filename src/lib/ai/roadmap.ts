import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { generateWithFailover } from "@/lib/ai/client";

// Full-year roadmaps produce large structured outputs (one milestone per week,
// each with up to 4 resources), which can take Gemini/OpenAI a while to emit.
// Give generation a generous budget so it doesn't hit the default 60s timeout.
const ROADMAP_TIMEOUT_MS = Number(process.env.ROADMAP_TIMEOUT_MS ?? 180000);

const resourceSchema = z.object({
  name: z.string().max(80),
  url: z.url().refine((u) => u.startsWith("https://") || u.startsWith("http://"), "Only http(s) URLs"),
  kind: z.enum(["roadmap", "course", "practice", "docs", "community"]).default("course"),
});

const milestoneSchema = z.object({
  week: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
  category: z.enum(["LEARNING", "CODING", "PROJECT", "PROFILE", "INTERVIEW", "OPPORTUNITY"]),
  resources: z.array(resourceSchema).max(4).optional(),
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

export interface CompletedWork {
  previousRole?: string;
  items: { title: string; category: string }[];
}

function completedWorkBlock(completed?: CompletedWork): string {
  if (!completed || completed.items.length === 0) return "";
  const uniqueTopics = [...new Set(completed.items.map((i) => i.title))];
  const byCategory = completed.items.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  const categorySummary = Object.entries(byCategory)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(", ");
  return `
PREVIOUSLY COMPLETED WORK (the student has already done the following — do NOT重复 these topics; instead, build on them or skip to the next logical step):
${completed.previousRole ? `- Previous target role: ${completed.previousRole}` : ""}
- Completed milestones (${completed.items.length} total): ${categorySummary}
- Topics covered: ${uniqueTopics.slice(0, 30).join("; ")}${uniqueTopics.length > 30 ? ` ...and ${uniqueTopics.length - 30} more` : ""}
- RULE: Start the new roadmap from where the student left off. Do not repeat foundational topics already covered. If the role changed, bridge the gap between what was learned and what the new role needs.`;
}

const RESOURCE_RULES = `RESOURCES (include in EVERY milestone):
- Add 2-4 resources per milestone: { "name": short label e.g. "roadmap.sh backend path", "url": "https://...", "kind": "roadmap|course|practice|docs|community" }.
- Prefer the official roadmap.sh path for the target role (roadmap.sh/<path>), free YouTube courses or playlists (freeCodeCamp, CS50, StatQuest, freeCodeCamp.org full courses), and free practice/docs sites (freeCodeCamp, MDN, W3Schools, LeetCode, GeeksforGeeks, Kaggle Learn, The Odin Project, SQLZoo, tryhackme, official docs).
- Every URL must be real, stable and start with https://. Never invent or shorten URLs. When unsure of a course URL, use a search URL like https://www.youtube.com/results?search_query=<topic>+course or the site's homepage.`;

function profileBlock(input: RoadmapInput) {
  return `STUDENT PROFILE
- Degree: ${input.degree} (${input.specialization || "no specialization"})
- Current college year: ${input.year}
- Target role: ${input.targetRole}
- Interests: ${input.interests.join(", ") || "not specified"}
- Weekly hours available: ${input.weeklyHours}
- Current skills (name: self-rating 1-5): ${input.skills.map((s) => `${s.name}:${s.rating}`).join(", ") || "none"}
- Weak areas: ${input.weakSkills.join(", ") || "none"}`;
}

/** Deterministic headline for what a given academic year of the degree should focus on. */
export function yearFocusContext(absoluteYear: number, totalYears: number, role: string): string {
  if (totalYears <= 2) {
    if (absoluteYear >= totalYears) {
      return `This is the FINAL year. Emphasize interview prep, resume/LinkedIn polish, internships and applying to jobs for ${role}, while finalizing a standout portfolio.`;
    }
    return `Emphasize strong fundamentals and skill-building for ${role}, plus completing a first solid project.`;
  }
  if (absoluteYear === 1) {
    return `FIRST YEAR - focus on foundations: core concepts, a first programming/tool skill for ${role}, study habits, and a tiny first project. Keep it beginner-friendly.`;
  }
  if (absoluteYear === totalYears) {
    return `FINAL YEAR - the placement season: resume/LinkedIn polish, mock interviews, DSA/aptitude drills, internship/full-time applications for ${role}, and portfolio finalization. Bias every week toward being interview-ready.`;
  }
  return `MID-COLLEGE YEAR - go deeper on the core skills of ${role}, build 1-2 solid projects, attempt certifications, and start hunting summer internships + networking.`;
}

export async function generateRoadmap(
  input: RoadmapInput,
  totalWeeks: number,
  context?: { yearFocus: string; yearLabel?: string; completedWork?: CompletedWork }
) {
  const { object } = await generateWithFailover(
    (model) => generateObject({ model, schema: roadmapSchema, schemaName: "career_roadmap", schemaDescription: "A personalized career roadmap for a student", prompt: `You are the Career OS engine. Build a personalized ${totalWeeks}-week roadmap for a student targeting a career role.

${profileBlock(input)}${context ? `\nCURRENT YEAR CONTEXT: ${context.yearFocus}` : ""}${context?.completedWork ? completedWorkBlock(context.completedWork) : ""}

RULES
1. The roadmap must be beginner → intermediate → advanced, prerequisite-aware.
2. Prioritize the student's weak skills FIRST (e.g. if SQL is weak and role is Data Analyst, SQL comes before advanced ML).
3. Every week must include a mix across categories: LEARNING (a topic to study), CODING (practice), PROJECT (build/progress), and at least one PROFILE, INTERVIEW or OPPORTUNITY task spread through the roadmap.
4. Return exactly one milestone per week for the full ${totalWeeks} weeks (1..${totalWeeks}).
5. Each milestone description must be a brief, actionable spec of WHAT to study/practice/build that week and HOW (e.g. a specific chapter, topic list, exercise count, or project step).
6. Use only the provided category values.
7. ${RESOURCE_RULES}` }),
    "ROADMAP",
    { maxRetries: 1, timeoutMs: ROADMAP_TIMEOUT_MS },
  );

  return object;
}

/**
 * Generates one academic year's worth of weekly milestones (weeks 1..weeksInYear).
 * The engine slices a long roadmap into these per-year plans so every year gets
 * its own focus (foundations → depth → placement season).
 */
export async function generateYearRoadmap(
  input: RoadmapInput,
  opts: { yearIndex: number; absoluteYear: number; totalYears: number; weeksInYear: number; yearFocus: string; role: string; completedWork?: CompletedWork }
) {
  const { object } = await generateWithFailover(
    (model) => generateObject({ model, schema: roadmapSchema, schemaName: "career_roadmap_year", schemaDescription: "A personalized academic-year roadmap for a student", prompt: `You are the Career OS engine. Build the weekly plan for ONE academic year (weeks 1..${opts.weeksInYear}) of a longer college roadmap. This is academic Year ${opts.absoluteYear} of ${opts.totalYears} for a student targeting "${opts.role}".

${profileBlock(input)}

YEAR FOCUS (must shape every week of this slice): ${opts.yearFocus}${opts.completedWork ? completedWorkBlock(opts.completedWork) : ""}

RULES
1. Return exactly one milestone per week for weeks 1..${opts.weeksInYear} in this year's plan.
2. Order beginner → intermediate → advanced for this year only, and front-load the student's weak skills.
3. Vary categories each week across LEARNING, CODING, PROJECT, PROFILE, INTERVIEW, OPPORTUNITY. Include several PROJECT weeks and at least one PROFILE, INTERVIEW and OPPORTUNITY milestone through the year.
4. Each milestone description must be a brief, actionable spec of WHAT to study/practice/build that week and HOW (specific topics, exercise counts, project steps).
5. ${RESOURCE_RULES}` }),
    "ROADMAP",
    { maxRetries: 1, timeoutMs: ROADMAP_TIMEOUT_MS },
  );

  return object;
}