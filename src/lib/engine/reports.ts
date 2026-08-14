import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { generateWeeklyReport as generateWeeklyReportNarrative } from "@/lib/ai/weekly";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { addDays, startOfWeek } from "@/lib/utils";

/**
 * Weekly Review loop (Section 5.6): analyze the week, generate the report,
 * snapshot readiness, and feed priorities into the coming week.
 */
export async function generateWeeklyReport(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);

  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { roadmap: true },
  });
  if (!profile) throw new Error("Student profile not found");

  const [tasks, submissions] = await Promise.all([
    prisma.task.findMany({
      where: { studentId, assignedDate: { gte: weekStart, lte: addDays(weekEnd, 1) } },
    }),
    prisma.codingSubmission.findMany({ where: { studentId, createdAt: { gte: weekStart, lte: addDays(weekEnd, 1) } } }),
  ]);

  const planned = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const completionRate = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  const codingSolved = submissions.filter((s) => s.status === "SOLVED").length;

  const incomplete = tasks.filter((t) => t.status !== "COMPLETED");
  const topWeak = incomplete
    .sort((a, b) => (a.rolloverCount ?? 0) - (b.rolloverCount ?? 0))
    .slice(0, 5)
    .map((t) => t.title);

  const learningTasks = tasks.filter((t) => t.category === "LEARNING" && t.status === "COMPLETED");
  const learningTopics = learningTasks.map((t) => t.title.replace(/^Learn:\s*/, ""));

  const projectTasks = tasks.filter((t) => t.category === "PROJECT");
  const projectProgress = projectTasks.length
    ? `${projectTasks.filter((t) => t.status === "COMPLETED").length} of ${projectTasks.length} project tasks completed`
    : "";

  const weekLabel = `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;

  let narrative = "";
  let weakAreas = topWeak.length ? topWeak : ["Stay consistent — keep completing your daily tasks."];
  let priorities: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = await generateWeeklyReportNarrative({
        role: profile.targetRole ?? "your target role",
        weekLabel,
        tasksPlanned: planned,
        tasksCompleted: completed,
        completionRate,
        codingSolved,
        learningTopics,
        projectProgress,
        topWeakTasks: topWeak,
      });
      narrative = ai.narrative;
      weakAreas = ai.weakAreas;
      priorities = ai.priorities;
    } catch (e) {
      console.error("[weekly] AI failed, using deterministic fallback", e);
    }
  }

  if (!narrative) {
    narrative = [
      `This week you planned ${planned} tasks and completed ${completed} (${completionRate}%).`,
      codingSolved > 0 ? `You solved ${codingSolved} coding problem${codingSolved > 1 ? "s" : ""}.` : "Coding practice was skipped — consistency matters.",
      projectProgress ? `Project progress: ${projectProgress}.` : "No project milestone completed yet.",
      weakAreas.length ? `Focus next week on: ${weakAreas.slice(0, 3).join(", ")}.` : "Keep the momentum going.",
    ].join(" ");
  }

  if (priorities.length === 0) {
    const priorityCats = incomplete
      .filter((t) => t.priority === "HIGH")
      .slice(0, 3)
      .map((t) => t.title);
    priorities = priorityCats.length
      ? priorityCats
      : ["Finish all rolled-over tasks", "Solve coding problems daily", "Advance your project milestone"];
  }

  const report = await prisma.weeklyReport.create({
    data: {
      studentId,
      weekStart,
      weekEnd,
      tasksPlanned: planned,
      tasksCompleted: completed,
      completionRate,
      codingSolved,
      aiNarrative: narrative,
      weakAreas: JSON.stringify(weakAreas),
      priorities: JSON.stringify(priorities),
    },
  });

  const readiness = await snapshotReadiness(prisma, studentId);

  await prisma.notification.create({
    data: {
      studentId,
      type: "REPORT",
      title: `Your weekly report is ready (${weekLabel})`,
      body: `${completionRate}% completion · Readiness ${readiness.total}/100`,
    },
  });

  return { report, readiness, weekLabel };
}

export type { };
