import { NextResponse } from "next/server";
import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, profile } = await requireStudentProfile();

  const [skills, assessments, tasks, reports, resumes, projects, submissions, quizResults, participations, interviews, roadmap, opportunityActions, notifications] =
    await Promise.all([
      prisma.studentSkill.findMany({ where: { studentId: profile.id }, include: { skill: true } }),
      prisma.assessment.findMany({ where: { studentId: profile.id } }),
      prisma.task.findMany({ where: { studentId: profile.id }, orderBy: { assignedDate: "desc" } }),
      prisma.weeklyReport.findMany({ where: { studentId: profile.id }, orderBy: { weekEnd: "desc" } }),
      prisma.resume.findMany({ where: { studentId: profile.id } }),
      prisma.project.findMany({ where: { studentId: profile.id } }),
      prisma.codingSubmission.findMany({ where: { studentId: profile.id }, include: { problem: true } }),
      prisma.quizResult.findMany({ where: { studentId: profile.id }, include: { quiz: true } }),
      prisma.eventParticipation.findMany({ where: { studentId: profile.id }, include: { event: true } }),
      prisma.mockInterview.findMany({ where: { studentId: profile.id } }),
      prisma.roadmap.findUnique({ where: { studentId: profile.id }, include: { items: true } }),
      prisma.opportunityAction.findMany({ where: { studentId: profile.id }, include: { opportunity: true } }),
      prisma.notification.findMany({ where: { studentId: profile.id } }),
    ]);

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: {
      degree: profile.degree,
      specialization: profile.specialization,
      year: profile.year,
      targetRole: profile.targetRole,
      readinessScore: profile.readinessScore,
      currentStreak: profile.currentStreak,
      bestStreak: profile.bestStreak,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      onboardedAt: profile.onboardedAt,
    },
    skills: skills.map((s) => ({ skill: s.skill.name, category: s.skill.category, selfRating: s.selfRating })),
    assessments,
    tasks: tasks.map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assignedDate: t.assignedDate,
      completedAt: t.completedAt,
    })),
    weeklyReports: reports.map((r) => ({
      weekStart: r.weekStart,
      weekEnd: r.weekEnd,
      completionRate: r.completionRate,
      tasksCompleted: r.tasksCompleted,
      tasksPlanned: r.tasksPlanned,
      aiNarrative: r.aiNarrative,
      priorities: r.priorities,
    })),
    resumes,
    projects,
    codingSubmissions: submissions.map((s) => ({ title: s.problem.title, status: s.status, createdAt: s.createdAt })),
    quizResults: quizResults.map((q) => ({ title: q.quiz.title, score: q.score, maxScore: q.maxScore, createdAt: q.createdAt })),
    eventParticipations: participations.map((p) => ({ title: p.event.title, status: p.status, createdAt: p.createdAt })),
    mockInterviews: interviews,
    roadmap,
    opportunityActions: opportunityActions.map((o) => ({ title: o.opportunity.title, action: o.action, createdAt: o.createdAt })),
    notifications,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="career-os-export.json"',
    },
  });
}
