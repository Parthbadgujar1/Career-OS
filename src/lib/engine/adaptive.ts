import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Computes the student's per-category proficiency (0-100) and overall level band.
 * Data sources: assessments, quiz results, coding submissions, self-ratings,
 * progress tests, and projects.
 */
export interface CategoryProficiency {
  coreSkills: number; // assessment scores (TECHNICAL, BUSINESS, MARKETING, FINANCE, DATA)
  coding: number; // coding submissions solved % + progress test scores
  projects: number; // project completion ratio
  profiles: number; // resume score + LinkedIn/GitHub review scores
  aptitude: number; // APTITUDE + COMMUNICATION assessment scores
  interview: number; // mock interview scores
  consistency: number; // streak + task completion rate
  careerActivities: number; // quiz results + event participations
  roleReadiness: number; // blended average of coreSkills + coding + projects (role-specific)
}

export type LevelBand = "beginner" | "developing" | "intermediate" | "advanced" | "expert";

export function levelBand(score: number): LevelBand {
  if (score < 10) return "beginner";
  if (score < 40) return "developing";
  if (score < 70) return "intermediate";
  if (score < 90) return "advanced";
  return "expert";
}

/**
 * Task mix ratios per level band.
 * Keys = categories, values = fraction of weekly tasks (must sum to ~1.0).
 */
export const MIX_RATIOS: Record<LevelBand, Record<string, number>> = {
  beginner:    { LEARNING: 0.50, CODING: 0.25, PROJECT: 0.10, PROFILE: 0.10, INTERVIEW: 0.00, OPPORTUNITY: 0.05 },
  developing:  { LEARNING: 0.35, CODING: 0.30, PROJECT: 0.15, PROFILE: 0.05, INTERVIEW: 0.05, OPPORTUNITY: 0.10 },
  intermediate:{ LEARNING: 0.15, CODING: 0.25, PROJECT: 0.25, PROFILE: 0.10, INTERVIEW: 0.15, OPPORTUNITY: 0.10 },
  advanced:    { LEARNING: 0.10, CODING: 0.20, PROJECT: 0.30, PROFILE: 0.10, INTERVIEW: 0.15, OPPORTUNITY: 0.15 },
  expert:      { LEARNING: 0.05, CODING: 0.15, PROJECT: 0.35, PROFILE: 0.05, INTERVIEW: 0.20, OPPORTUNITY: 0.20 },
};

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/**
 * Distributes task counts across the week, filling the weakest categories first.
 */
export function distributeTasksAcrossWeek(totalTasks: number, mix: Record<string, number>): { category: string; day: string }[] {
  // Compute raw counts
  const raw = Object.entries(mix)
    .map(([cat, ratio]) => ({ category: cat, count: totalTasks * ratio }))
    .sort((a, b) => b.count - a.count);

  // Round to integers ensuring total = totalTasks
  const rounded = raw.map((r) => ({ ...r, count: Math.floor(r.count) }));
  let remaining = totalTasks - rounded.reduce((s, r) => s + r.count, 0);
  for (const r of rounded) {
    if (remaining <= 0) break;
    r.count++;
    remaining--;
  }

  // Flatten into (category, day) pairs, rotating days
  const pairs: { category: string; day: string }[] = [];
  let dayIdx = 0;
  for (const r of rounded) {
    for (let i = 0; i < r.count; i++) {
      pairs.push({ category: r.category, day: DAYS_OF_WEEK[dayIdx % 7] });
      dayIdx++;
    }
  }

  return pairs;
}

export interface ComputeResult {
  proficiency: CategoryProficiency;
  overall: number; // 0-100 weighted average
  band: LevelBand;
}

/**
 * Computes proficiency scores from the student's actual activity data.
 */
export async function computeProficiency(prisma: PrismaClient, studentId: string): Promise<ComputeResult> {
  const [assessments, quizResults, codingSubs, projects, projectRecs, interviews, snapshots, progressTests, profile] =
    await Promise.all([
      prisma.assessment.findMany({ where: { studentId } }),
      prisma.quizResult.findMany({ where: { studentId } }),
      prisma.codingSubmission.findMany({ where: { studentId } }),
      prisma.project.findMany({ where: { studentId } }),
      prisma.projectRecommendation.findMany({ where: { studentId } }),
      prisma.mockInterview.findMany({ where: { studentId } }),
      prisma.readinessSnapshot.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 1 }),
      prisma.progressTestAttempt.findMany({ where: { studentId } }),
      prisma.studentProfile.findUnique({ where: { id: studentId }, select: { currentStreak: true, weeklyHours: true, onboardedAt: true } }),
    ]);

  // Core skills: latest assessment per type, averaged
  const latestByType = new Map<string, { score: number; maxScore: number }>();
  for (const a of assessments) {
    const existing = latestByType.get(a.type);
    if (!existing || a.takenAt > new Date(0)) {
      latestByType.set(a.type, { score: a.score, maxScore: a.maxScore });
    }
  }
  const coreTypes = ["TECHNICAL", "BUSINESS", "MARKETING", "FINANCE", "DATA"];
  const coreScores = coreTypes
    .map((t) => latestByType.get(t))
    .filter(Boolean)
    .map((v) => ((v?.score ?? 0) / (v?.maxScore ?? 1)) * 100);
  const coreSkills = coreScores.length > 0 ? Math.round(coreScores.reduce((s, v) => s + v, 0) / coreScores.length) : 0;

  // Coding: submissions solved % + progress test coding scores
  const solved = codingSubs.filter((s) => s.status === "SOLVED").length;
  const totalCodingSubs = codingSubs.length;
  const codingFromSubs = totalCodingSubs > 0 ? (solved / totalCodingSubs) * 100 : 0;
  const codingTests = progressTests.filter((t) => t.difficulty !== "EASY");
  const codingFromTests = codingTests.length > 0
    ? (codingTests.reduce((s, t) => s + t.score, 0) / codingTests.reduce((s, t) => s + t.maxScore, 0)) * 100
    : 0;
  const coding = Math.round(Math.max(codingFromSubs, codingFromTests, (codingFromSubs + codingFromTests) / 2));

  // Projects: completion ratio
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const totalProjects = projects.length + projectRecs.length;
  const projectsScore = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Profiles: latest resume ATS score + LinkedIn/GitHub review scores
  const profileReview = snapshots[0]?.dimensions ? JSON.parse(snapshots[0].dimensions as string) : null;
  const profiles = Math.round(profileReview?.profiles ?? (latestByType.has("APTITUDE") ? 30 : 0));

  // Aptitude + Communication
  const aptTypes = ["APTITUDE", "COMMUNICATION"];
  const aptScores = aptTypes
    .map((t) => latestByType.get(t))
    .filter(Boolean)
    .map((v) => ((v?.score ?? 0) / (v?.maxScore ?? 1)) * 100);
  const aptitude = aptScores.length > 0 ? Math.round(aptScores.reduce((s, v) => s + v, 0) / aptScores.length) : 0;

  // Interview: mock interview scores
  const interviewScores = interviews.filter((i) => i.score != null && i.maxScore != null);
  const interview = interviewScores.length > 0
    ? Math.round(interviewScores.reduce((s, i) => s + ((i.score ?? 0) / (i.maxScore ?? 1)) * 100, 0) / interviewScores.length)
    : 0;

  // Consistency: streak + task completion
  const weekTasks = await prisma.task.findMany({
    where: { studentId, status: { in: ["COMPLETED", "SKIPPED"] }, weekStart: { not: null } },
    select: { status: true },
  });
  const completed = weekTasks.filter((t) => t.status === "COMPLETED").length;
  const consistency = Math.min(100, Math.round(
    ((profile?.currentStreak ?? 0) / 7) * 50 + // streak contributes up to 50%
    (weekTasks.length > 0 ? (completed / weekTasks.length) * 50 : 25) // completion rate up to 50%
  ));

  // Career activities: quizzes + events
  const quizScore = quizResults.length > 0
    ? (quizResults.reduce((s, q) => s + q.score, 0) / quizResults.reduce((s, q) => s + q.maxScore, 0)) * 100
    : 0;
  const careerActivities = Math.round(Math.min(100, quizScore + (interviews.length * 5)));

  // Role readiness: weighted blend of core + coding + projects
  const roleReadiness = Math.round(coreSkills * 0.4 + coding * 0.3 + projectsScore * 0.3);

  const proficiency: CategoryProficiency = {
    coreSkills,
    coding,
    projects: projectsScore,
    profiles,
    aptitude,
    interview,
    consistency,
    careerActivities,
    roleReadiness,
  };

  // Overall weighted average (mirrors READINESS_DIMENSIONS weights from constants.ts)
  const overall = Math.round(
    coreSkills * 0.20 +
    coding * 0.15 +
    projectsScore * 0.15 +
    profiles * 0.10 +
    aptitude * 0.10 +
    interview * 0.15 +
    consistency * 0.05 +
    careerActivities * 0.05 +
    roleReadiness * 0.05
  );

  return { proficiency, overall: Math.min(100, Math.max(0, overall)), band: levelBand(overall) };
}
