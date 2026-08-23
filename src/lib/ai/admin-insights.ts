import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

const adminInsightsSchema = z.object({
  healthAssessment: z.string(),
  bottlenecks: z.array(
    z.object({
      area: z.string(),
      impact: z.string(),
      resolution: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
});

type AdminInsights = z.infer<typeof adminInsightsSchema>;

export interface AdminAnalyticsData {
  totalStudents: number;
  onboardedStudents: number;
  avgReadiness: number;
  avgTaskCompletion: number;
  codingSolved: number;
  mockInterviewsCount: number;
  applicationsCount: number;
  topSkillsGaps: { name: string; count: number }[];
  pipeline: {
    viewed: number;
    saved: number;
    applied: number;
    completed: number;
  };
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_CACHE_TTL_MS = 60 * 1000;
const insightsCache = new Map<string, { expiresAt: number; value: AdminInsights }>();

function cacheKey(metrics: AdminAnalyticsData): string {
  return JSON.stringify({
    total: metrics.totalStudents,
    onboarded: metrics.onboardedStudents,
    readiness: metrics.avgReadiness,
    completion: metrics.avgTaskCompletion,
    coding: metrics.codingSolved,
    interviews: metrics.mockInterviewsCount,
    applications: metrics.applicationsCount,
    gaps: metrics.topSkillsGaps,
    pipeline: metrics.pipeline,
  });
}

function fallbackInsights(metrics: AdminAnalyticsData): AdminInsights {
  const bottlenecks: AdminInsights["bottlenecks"] = [];

  if (metrics.avgTaskCompletion < 50) {
    bottlenecks.push({
      area: "Task completion",
      impact: `Only ${metrics.avgTaskCompletion}% of weekly tasks are completed on average, which slows readiness growth for most students.`,
      resolution: "Reinforce daily task streaks, surface rollovers, and have mentors follow up with inactive students.",
    });
  }
  if (metrics.mockInterviewsCount < metrics.totalStudents) {
    bottlenecks.push({
      area: "Mock interviews",
      impact: `${metrics.mockInterviewsCount} interviews across ${metrics.totalStudents} students means interview readiness is under-tested.`,
      resolution: "Schedule interview marathons and make mock interviews a recurring weekly milestone.",
    });
  }
  if (metrics.applicationsCount < metrics.totalStudents) {
    bottlenecks.push({
      area: "Opportunity applications",
      impact: `${metrics.applicationsCount} applications for ${metrics.totalStudents} students — low volume limits real placement outcomes.`,
      resolution: "Push the opportunity gateway and track view-to-apply conversion each week.",
    });
  }
  if (metrics.topSkillsGaps.length > 0) {
    const names = metrics.topSkillsGaps.slice(0, 3).map((g) => g.name).join(", ");
    bottlenecks.push({
      area: "Shared skill gaps",
      impact: `${names} are the most common gaps and block progress across multiple tracks.`,
      resolution: "Run targeted workshops covering the top shared gaps before the next placement cycle.",
    });
  }
  if (bottlenecks.length === 0) {
    bottlenecks.push({
      area: "Platform health",
      impact: "Core engagement metrics look healthy across the board.",
      resolution: "Maintain the current cadence and focus on moving average readiness above 70.",
    });
  }

  const gapMention =
    metrics.topSkillsGaps.length > 0
      ? `The most common skill gaps are ${metrics.topSkillsGaps.slice(0, 3).map((g) => g.name).join(", ")}.`
      : "No significant skill gaps have been recorded yet.";
  const healthAssessment =
    `Across ${metrics.totalStudents} students (${metrics.onboardedStudents} onboarded), average readiness is ${metrics.avgReadiness}/100 with an average task completion of ${metrics.avgTaskCompletion}%. ` +
    (metrics.avgReadiness >= 70
      ? "This indicates strong momentum toward placement readiness."
      : metrics.avgReadiness >= 50
        ? "This indicates moderate progress with clear room to accelerate."
        : "This indicates early-stage progress; most students still need a push into consistent activity.") +
    ` ${gapMention}`;

  const recommendations: string[] = [
    metrics.topSkillsGaps.length > 0
      ? `Run a workshop on "${metrics.topSkillsGaps[0].name}" — the top shared gap among students.`
      : "Focus on moving students from onboarding into active daily task completion.",
    metrics.mockInterviewsCount < metrics.totalStudents
      ? "Organize a mock interview marathon to raise interview readiness across the batch."
      : "Continue the interview cadence and push top scorers into advanced, role-specific practice.",
    metrics.applicationsCount < metrics.totalStudents
      ? "Strengthen opportunity-gateway follow-up so more students convert views into applications."
      : "Shift focus from application volume to application quality and interview conversion.",
  ];

  return { healthAssessment, bottlenecks, recommendations };
}

export async function generateAdminAiInsights(metrics: AdminAnalyticsData) {
  if (metrics.totalStudents === 0) {
    return {
      healthAssessment: "The platform currently has no registered students.",
      bottlenecks: [],
      recommendations: ["Encourage students to register and complete onboarding."],
    };
  }

  const key = cacheKey(metrics);
  const cached = insightsCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (insightsCache.size > 100) insightsCache.clear();

  const model = getModel();

  const gapsFormatted = metrics.topSkillsGaps
    .map((g) => `${g.name} (${g.count} students)`)
    .join(", ");

  const prompt = `You are an AI Platform Analytics Consultant for Career OS. Analyze the platform-wide performance and engagement metrics for the administrator:

METRICS:
- Total Students: ${metrics.totalStudents} (${metrics.onboardedStudents} onboarded)
- Average Placement Readiness Score: ${metrics.avgReadiness}/100
- Average Task Completion Rate: ${metrics.avgTaskCompletion}%
- Coding Problems Solved: ${metrics.codingSolved}
- Mock Interviews Conducted: ${metrics.mockInterviewsCount}
- Applications Submitted (Opportunity Pipeline): ${metrics.applicationsCount}
- Top Platform Skill Gaps: ${gapsFormatted || "None"}
- Opportunity Pipeline States: ${JSON.stringify(metrics.pipeline)}

Generate platform analytics insights for the admin dashboard:
1. healthAssessment: A 2-3 sentence overview of how well students are progressing towards placement readiness, commenting on activity levels and readiness.
2. bottlenecks: Identify 2-3 main bottlenecks in the pipeline (e.g. low mock interview count, common coding skill gaps, low application counts) along with their estimated impact and a clear programmatic resolution.
3. recommendations: 3 strategic recommendations for the platform administrator to improve outcomes (e.g. sourcing specific job tracks, organizing specialized skills workshops, or running interview marathons).

Keep your language professional, strategic, and highly actionable.`;

  try {
    const { object } = await generateObject({
      model,
      schema: adminInsightsSchema,
      schemaName: "admin_insights",
      schemaDescription: "AI platform health insights for administrators",
      prompt,
      maxRetries: 0,
    });
    insightsCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: object });
    return object;
  } catch (e) {
    console.error("[AdminAiInsights] AI generation failed, using computed fallback", e);
    const fallback = fallbackInsights(metrics);
    insightsCache.set(key, { expiresAt: Date.now() + FALLBACK_CACHE_TTL_MS, value: fallback });
    return fallback;
  }
}
