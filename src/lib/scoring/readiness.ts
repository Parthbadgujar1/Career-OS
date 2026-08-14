import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  READINESS_DIMENSIONS,
  type DimensionKey,
  type DimensionScores,
} from "@/lib/constants";

export interface ReadinessEvidence {
  coreSkills: number; // 0..100 avg self rating mapped
  coding: number; // 0..100
  projects: number; // 0..100
  profiles: number; // 0..100
  aptitude: number; // 0..100
  interview: number; // 0..100
  consistency: number; // 0..100
  careerActivities: number; // 0..100
  roleReadiness: number; // 0..100
  explain: Record<DimensionKey, string>;
}

const DEFAULT_EXPLAIN: Record<DimensionKey, string> = {
  coreSkills: "No skill self-assessment recorded yet.",
  coding: "No coding submissions yet. Solve problems daily to grow this.",
  projects: "No completed projects yet.",
  profiles: "No resume or profile review yet.",
  aptitude: "No aptitude assessment taken yet.",
  interview: "No mock interviews taken yet.",
  consistency: "No weekly task data yet.",
  careerActivities: "No quiz / event participation yet.",
  roleReadiness: "No role-specific evidence yet.",
};

export function emptyEvidence(): ReadinessEvidence {
  return {
    coreSkills: 0,
    coding: 0,
    projects: 0,
    profiles: 0,
    aptitude: 0,
    interview: 0,
    consistency: 0,
    careerActivities: 0,
    roleReadiness: 0,
    explain: { ...DEFAULT_EXPLAIN },
  };
}

/**
 * Gathers evidence from the database and computes a weighted, explainable
 * readiness score (Section 9 of the blueprint). Every point is traceable.
 */
export async function computeReadiness(
  prisma: PrismaClient,
  studentId: string
): Promise<{ total: number; dimensions: DimensionScores; explain: Record<DimensionKey, string> }> {
  const ev = emptyEvidence();
  const explain = { ...DEFAULT_EXPLAIN };

  const [
    skills,
    assessmentScores,
    submissions,
    projects,
    resumes,
    profileReviews,
    reports,
    quizResults,
    participations,
    interviews,
    roadmap,
    opportunityActions,
  ] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { studentId },
      include: { skill: true },
    }),
    prisma.assessment.findMany({ where: { studentId } }),
    prisma.codingSubmission.findMany({ where: { studentId } }),
    prisma.project.findMany({ where: { studentId } }),
    prisma.resume.findMany({
      where: { studentId },
      include: { review: true },
      orderBy: { version: "desc" },
    }),
    prisma.profileReview.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
    prisma.weeklyReport.findMany({ where: { studentId }, orderBy: { weekEnd: "desc" } }),
    prisma.quizResult.findMany({ where: { studentId } }),
    prisma.eventParticipation.findMany({ where: { studentId } }),
    prisma.mockInterview.findMany({ where: { studentId } }),
    prisma.roadmap.findUnique({ where: { studentId }, include: { items: true } }),
    prisma.opportunityAction.findMany({
      where: { studentId, action: { in: ["SAVED", "APPLIED", "COMPLETED"] } },
    }),
  ]);

  // 1. Core technical skills (self rating 1..5 -> 0..100)
  if (skills.length > 0) {
    ev.coreSkills = Math.round(
      (skills.reduce((s, sk) => s + sk.selfRating, 0) / (skills.length * 5)) * 100
    );
    const weak = skills.filter((sk) => sk.selfRating <= 2).map((sk) => sk.skill.name);
    explain.coreSkills = weak.length
      ? `Weakest skills: ${weak.slice(0, 3).join(", ")}. Raise self-ratings by completing learning tasks.`
      : `You rated ${skills.length} skills. Keep leveling them up.`;
  }

  // 2. Coding / DSA
  const solved = submissions.filter((s) => s.status === "SOLVED").length;
  if (submissions.length > 0) {
    const ratio = solved / submissions.length;
    ev.coding = Math.min(100, Math.round((ratio * 0.7 + Math.min(solved, 30) / 30 * 0.3) * 100));
    explain.coding = `${solved} of ${submissions.length} problems solved. Aim for daily consistency.`;
  }

  // 3. Projects
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  if (projects.length > 0) {
    const ratio = completedProjects / projects.length;
    ev.projects = Math.min(100, Math.round((ratio * 0.6 + Math.min(completedProjects, 3) / 3 * 0.4) * 100));
    explain.projects = `${completedProjects} completed of ${projects.length} started.`;
  } else {
    explain.projects = "No projects yet. Follow your roadmap's project milestones.";
  }

  // 4. Resume + LinkedIn + GitHub
  const reviews = [
    ...resumes.flatMap((r) => (r.review ? [{ score: r.review.atsScore }] : [])),
    ...profileReviews.map((p) => ({ score: p.score })),
  ];
  if (reviews.length > 0) {
    ev.profiles = Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length);
    explain.profiles = `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""} (resume/ATS + LinkedIn/GitHub).`;
  }

  // 5. Aptitude / assessments
  const techAssessments = assessmentScores.filter((a) => a.type !== "CODING");
  if (techAssessments.length > 0) {
    ev.aptitude = Math.round(
      (techAssessments.reduce((s, a) => s + a.score / a.maxScore, 0) / techAssessments.length) * 100
    );
    explain.aptitude = `Average of ${techAssessments.length} assessment${techAssessments.length > 1 ? "s" : ""}.`;
  }

  // 6. Interview readiness
  if (interviews.length > 0) {
    const scored = interviews.filter((i) => i.score != null && i.maxScore);
    if (scored.length > 0) {
      ev.interview = Math.round(
        (scored.reduce((s, i) => s + (i.score ?? 0) / (i.maxScore ?? 1), 0) / scored.length) * 100
      );
      explain.interview = `Average across ${scored.length} mock interview${scored.length > 1 ? "s" : ""}.`;
    }
  }

  // 7. Consistency / execution
  if (reports.length > 0) {
    const latest = reports[0];
    ev.consistency = Math.round(latest.completionRate);
    explain.consistency = `Last week you completed ${latest.tasksCompleted} of ${latest.tasksPlanned} planned tasks.`;
  }

  // 8. Career activities
  const activities = participations.length + quizResults.length + opportunityActions.length;
  if (activities > 0) {
    ev.careerActivities = Math.min(100, Math.round((activities / 10) * 100));
    explain.careerActivities = `${participations.length} events, ${quizResults.length} quizzes, ${opportunityActions.length} saved/applied opportunities.`;
  }

  // 9. Role-specific readiness
  if (roadmap && roadmap.items.length > 0) {
    const completed = roadmap.items.filter((i) => i.status === "COMPLETED").length;
    ev.roleReadiness = Math.min(100, Math.round((completed / roadmap.items.length) * 100));
    explain.roleReadiness = `${completed} of ${roadmap.items.length} roadmap milestones completed for ${roadmap.targetRole}.`;
  }

  // Weighted total
  let total = 0;
  const dimensions = {} as DimensionScores;
  for (const dim of READINESS_DIMENSIONS) {
    const score = Math.min(100, ev[dim.key as DimensionKey]);
    dimensions[dim.key as DimensionKey] = score;
    total += score * dim.weight;
  }
  total = Math.round(total / 100);

  return { total, dimensions, explain };
}

export function readinessLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Placement Ready", color: "emerald" };
  if (score >= 60) return { label: "Interview Ready", color: "green" };
  if (score >= 40) return { label: "Growing", color: "amber" };
  if (score >= 20) return { label: "Getting Started", color: "orange" };
  return { label: "Just Started", color: "rose" };
}

export async function snapshotReadiness(
  prisma: PrismaClient,
  studentId: string
) {
  const { total, dimensions, explain } = await computeReadiness(prisma, studentId);
  await prisma.readinessSnapshot.create({
    data: {
      studentId,
      total,
      dimensions: JSON.stringify(dimensions),
    },
  });
  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { readinessScore: total },
  });
  return { total, dimensions, explain };
}

export type { DimensionScores };
