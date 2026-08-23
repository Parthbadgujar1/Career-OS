import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

const cohortInsightsSchema = z.object({
  summary: z.string(),
  needsAttention: z.array(
    z.object({
      name: z.string(),
      reason: z.string(),
      actionableTip: z.string(),
    })
  ),
  commonGaps: z.array(
    z.object({
      skill: z.string(),
      studentCount: z.number(),
      recommendedResource: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
});

type CohortInsights = z.infer<typeof cohortInsightsSchema>;

export interface CohortStudentData {
  name: string;
  targetRole: string | null;
  readinessScore: number;
  weakSkills: string[];
  completionRate: number | null;
  currentStreak: number;
  pendingTasks: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_CACHE_TTL_MS = 60 * 1000;
const insightsCache = new Map<string, { expiresAt: number; value: CohortInsights }>();

function cacheKey(students: CohortStudentData[]): string {
  return JSON.stringify(students);
}

function fallbackInsights(students: CohortStudentData[]): CohortInsights {
  const needsAttention: CohortInsights["needsAttention"] = [];
  const gapCounts = new Map<string, number>();

  for (const s of students) {
    for (const skill of s.weakSkills) {
      gapCounts.set(skill, (gapCounts.get(skill) ?? 0) + 1);
    }

    const completion = s.completionRate ?? 0;
    const lagging =
      s.readinessScore < 40 || completion < 40 || s.pendingTasks > 5;

    if (lagging) {
      const reasons: string[] = [];
      if (s.readinessScore < 40) reasons.push(`readiness is only ${s.readinessScore}/100`);
      if (completion < 40) reasons.push(`weekly task completion is ${completion}%`);
      if (s.pendingTasks > 5) reasons.push(`${s.pendingTasks} tasks are pending`);
      needsAttention.push({
        name: s.name,
        reason: reasons.join(" and ") || "progress has slowed",
        actionableTip: `Schedule a 1:1 check-in, review the pending backlog together, and set one achievable goal for this week.`,
      });
    }
  }

  const commonGaps: CohortInsights["commonGaps"] = [...gapCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill, count]) => ({
      skill,
      studentCount: count,
      recommendedResource: `Assign a short learning path and a guided practice problem set for ${skill}, then track completion in the weekly report.`,
    }));

  const avgReadiness =
    Math.round((students.reduce((sum, s) => sum + s.readinessScore, 0) / students.length) * 10) / 10;
  const avgCompletion =
    students.filter((s) => s.completionRate != null).length > 0
      ? Math.round(
          (students.reduce((sum, s) => sum + (s.completionRate ?? 0), 0) /
            students.filter((s) => s.completionRate != null).length) *
            10
        ) / 10
      : null;
  const summary =
    `Across ${students.length} mentees, average readiness is ${avgReadiness}/100` +
    (avgCompletion != null ? ` with average weekly task completion of ${avgCompletion}%.` : " with limited weekly report data yet.") +
    ` ${needsAttention.length > 0 ? `${needsAttention.length} student(s) need proactive support.` : "No students are currently falling behind."} ` +
    (commonGaps.length > 0 ? `Top shared skill gaps: ${commonGaps.map((g) => g.skill).join(", ")}.` : "");

  const recommendations: string[] = [
    needsAttention.length > 0
      ? `Prioritize 1:1s with the ${needsAttention.length} student(s) flagged for support and set weekly micro-goals.`
      : "Run a group goal-setting session to keep the whole cohort moving together.",
    commonGaps.length > 0
      ? `Assign a structured learning sprint on "${commonGaps[0].skill}" for the affected students.`
      : "Encourage students to diversify their practice across new skill areas.",
    avgReadiness < 50
      ? "Push the cohort to close at least one weak skill per week before the next placement cycle."
      : "Maintain current momentum and start advanced, role-specific mock interviews.",
  ];

  return { summary, needsAttention, commonGaps, recommendations };
}

export async function generateMentorAiInsights(students: CohortStudentData[]) {
  if (students.length === 0) {
    return {
      summary: "You currently have no mentees assigned or onboarded.",
      needsAttention: [],
      commonGaps: [],
      recommendations: ["Assign or encourage students to onboard to view cohort statistics."],
    };
  }

  const key = cacheKey(students);
  const cached = insightsCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (insightsCache.size > 100) insightsCache.clear();

  const model = getModel();

  const cohortDataFormatted = students
    .map((s) => {
      return `- Student: ${s.name}
  Target Role: ${s.targetRole || "Not specified"}
  Readiness Score: ${s.readinessScore}/100
  Weak Skills: ${s.weakSkills.join(", ") || "None"}
  Weekly Task Completion Rate: ${s.completionRate !== null ? `${s.completionRate}%` : "No weekly report yet"}
  Current Streak: ${s.currentStreak} days
  Pending Tasks: ${s.pendingTasks}`;
    })
    .join("\n\n");

  const prompt = `You are an AI Mentor Co-Pilot for Career OS. Analyze the cohort of students assigned to this mentor:

COHORT DATA:
${cohortDataFormatted}

Evaluate the cohort data and generate structured insights for the mentor:
1. summary: A 2-3 sentence executive summary of overall readiness, performance, and general trends.
2. needsAttention: A list of students who are lagging behind (e.g. low readiness score, low completion rate, high pending tasks) with a brief, specific reason why and a recommended action for the mentor to take.
3. commonGaps: Identify the top 2-3 skill gaps that multiple students share, including the number of students having this gap and a recommended way/resource to address it.
4. recommendations: 3-4 concrete, actionable weekly recommendations for the mentor to guide their students.

Keep your tone professional, supportive, and data-driven.`;

  try {
    const { object } = await generateObject({
      model,
      schema: cohortInsightsSchema,
      schemaName: "cohort_insights",
      schemaDescription: "AI insights on student cohort performance",
      prompt,
      maxRetries: 0,
    });
    insightsCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: object });
    return object;
  } catch (e) {
    console.error("[MentorAiInsights] AI generation failed, using computed fallback", e);
    const fallback = fallbackInsights(students);
    insightsCache.set(key, { expiresAt: Date.now() + FALLBACK_CACHE_TTL_MS, value: fallback });
    return fallback;
  }
}
