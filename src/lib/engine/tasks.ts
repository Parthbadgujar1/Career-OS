import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { startOfDay } from "@/lib/utils";

// ── Calendar helpers ─────────────────────────────────────────────────────

function currentWeek(createdAt: Date, today: Date): number {
  const diff = Math.floor((startOfDay(today).getTime() - startOfDay(createdAt).getTime()) / 86400000);
  return Math.max(1, Math.floor(diff / 7) + 1);
}

function mondayOf(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // Sun=0 Mon=1 ... Sat=6
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  return new Date(d.getTime() + diff * 86400000);
}

// ── Completion-driven active week ────────────────────────────────────────
//
// The task engine works on a weekly cadence driven by the roadmap: the active
// week is the earliest roadmap week that still contains an unfinished item.
// Tasks for that week are created once, verbatim from the roadmap items, and
// when every item of the week is resolved the next week automatically becomes
// the active one. No daily slicing, no manufactured task text.

export function activeRoadmapWeek(items: { weekNumber: number; status: string }[]): number | null {
  const weekNumbers = [...new Set(items.map((i) => i.weekNumber))].sort((a, b) => a - b);
  for (const week of weekNumbers) {
    if (items.some((i) => i.weekNumber === week && i.status !== "COMPLETED")) return week;
  }
  return null;
}

// ── Streak ─────────────────────────────────────────────────────────────────

export async function bumpStreak(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const today = startOfDay(date);
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { currentStreak: true, bestStreak: true, lastActiveDate: true },
  });
  if (!profile) return 0;

  const last = profile.lastActiveDate ? startOfDay(profile.lastActiveDate) : null;
  if (last && last.getTime() === today.getTime()) return profile.currentStreak;

  const yesterday = new Date(today.getTime() - 86400000);
  const isStreak = !!last && last.getTime() === yesterday.getTime();
  const current = isStreak ? profile.currentStreak + 1 : 1;
  const best = Math.max(profile.bestStreak, current);

  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { currentStreak: current, bestStreak: best, lastActiveDate: today },
  });
  return current;
}

// ── Fallback plan (student without a roadmap) ──────────────────────────────
//
// Fixed, deterministic weekly plan. Text never changes between visits.

const FALLBACK_WEEKLY_PLAN = [
  {
    category: "LEARNING",
    title: "Learn: Core fundamentals",
    description: "Revise the core concepts of your target role for 2 focused study sessions this week.",
  },
  {
    category: "CODING",
    title: "Code: Strengthen problem solving",
    description: "Solve 3 coding problems this week — start easy, then retry them until they click.",
  },
  {
    category: "PROJECT",
    title: "Project: Advance your portfolio",
    description: "Add at least one small feature or improvement and push it to your GitHub.",
  },
] as const;

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

function estimateHours(category: string): number {
  switch (category) {
    case "LEARNING":
      return 2;
    case "CODING":
      return 2;
    case "PROJECT":
      return 3;
    case "INTERVIEW":
      return 1.5;
    default:
      return 1;
  }
}

// ── Weekly task generation ────────────────────────────────────────────────
//
// syncTasksForWeek makes the week's task list an exact mirror of the roadmap's
// active week. It is idempotent: it only creates missing tasks, removes stale
// pending tasks that no longer belong to the active week, and reconciles status
// so that completing an item on either the tasks or roadmap page stays in sync.

export async function syncTasksForWeek(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const thisMonday = mondayOf(date);

  const roadmap = await prisma.roadmap.findUnique({
    where: { studentId },
    include: { items: { orderBy: [{ weekNumber: "asc" }, { order: "asc" }] } },
  });

  // No roadmap (or empty): deterministic fallback plan, created once per week.
  if (!roadmap || roadmap.items.length === 0) {
    const existing = await prisma.task.findMany({ where: { studentId, weekStart: thisMonday } });
    const present = new Set(existing.map((t) => t.title));
    for (let i = 0; i < FALLBACK_WEEKLY_PLAN.length; i++) {
      const plan = FALLBACK_WEEKLY_PLAN[i];
      if (!present.has(plan.title)) {
        await prisma.task.create({
          data: {
            studentId,
            title: plan.title,
            description: plan.description,
            category: plan.category,
            priority: plan.category === "CODING" ? "HIGH" : "NORMAL",
            status: "PENDING",
            source: "AUTO",
            weekStart: thisMonday,
            suggestedDay: WEEK_DAYS[i] ?? "MON",
            frequency: "WEEKLY",
            estimatedHours: estimateHours(plan.category),
            assignedDate: new Date(),
          },
        });
      }
    }
    return prisma.task.findMany({ where: { studentId, weekStart: thisMonday }, orderBy: { suggestedDay: "asc" } });
  }

  // Active week is the earliest week with unfinished items. If there is none,
  // the roadmap is complete — no tasks remain, and we mark it as such.
  const activeWeek = activeRoadmapWeek(roadmap.items);
  if (activeWeek === null) {
    await prisma.task.deleteMany({ where: { studentId, status: { in: ["PENDING", "SKIPPED"] } } });
    if (roadmap.status !== "COMPLETED") {
      await prisma.roadmap.update({ where: { id: roadmap.id }, data: { status: "COMPLETED" } });
    }
    return [];
  }

  const weekItems = roadmap.items.filter((i) => i.weekNumber === activeWeek);
  const keepItemIds = new Set(weekItems.map((i) => i.id));

  // Drop pending/skipped tasks that no longer belong to the active week (e.g.
  // a previous fallback plan, or tasks from a week that got resolved).
  const open = await prisma.task.findMany({ where: { studentId, status: { in: ["PENDING", "SKIPPED"] } } });
  for (const t of open) {
    if (!t.roadmapItemId || !keepItemIds.has(t.roadmapItemId)) {
      await prisma.task.delete({ where: { id: t.id } });
    }
  }
  const openByItem = new Map(open.filter((t) => t.roadmapItemId).map((t) => [t.roadmapItemId as string, t]));

  // One task per roadmap item of the active week — title and description come
  // verbatim from the roadmap item, so the task list always matches the roadmap.
  let dayIndex = 0;
  for (const item of weekItems) {
    if (!openByItem.has(item.id)) {
      await prisma.task.create({
        data: {
          studentId,
          title: item.title,
          description: item.description,
          category: item.category,
          priority: item.category === "CODING" ? "HIGH" : "NORMAL",
          status: "PENDING",
          source: "ADAPTIVE",
          weekStart: thisMonday,
          suggestedDay: WEEK_DAYS[dayIndex % WEEK_DAYS.length],
          frequency: "WEEKLY",
          estimatedHours: estimateHours(item.category),
          assignedDate: new Date(),
          roadmapItemId: item.id,
        },
      });
    }
    // Reconcile: if the roadmap item was marked done directly on the roadmap
    // page, mark its linked task completed too.
    const linked = openByItem.get(item.id);
    if (linked && item.status === "COMPLETED" && linked.status !== "COMPLETED") {
      await prisma.task.update({ where: { id: linked.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    }
    dayIndex++;
  }

  return prisma.task.findMany({ where: { studentId, weekStart: thisMonday }, orderBy: [{ suggestedDay: "asc" }, { status: "asc" }] });
}

export async function ensureWeeklyTasks(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  return syncTasksForWeek(prisma, studentId, date);
}

// ── Complete / Skip ────────────────────────────────────────────────────────

export async function completeTask(prisma: PrismaClient, studentId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, studentId } });
  if (!task) throw new Error("Task not found");
  if (task.roadmapItemId) {
    await prisma.roadmapItem.updateMany({
      where: { id: task.roadmapItemId },
      data: { status: "COMPLETED" },
    });
  }
  return prisma.task.update({
    where: { id: taskId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

export async function skipTask(prisma: PrismaClient, studentId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, studentId } });
  if (!task) throw new Error("Task not found");
  // Resolve the linked roadmap item too, so the week's flow can move on.
  if (task.roadmapItemId) {
    await prisma.roadmapItem.updateMany({
      where: { id: task.roadmapItemId },
      data: { status: "COMPLETED" },
    });
  }
  return prisma.task.update({ where: { id: taskId }, data: { status: "SKIPPED", completedAt: new Date() } });
}

export { currentWeek, mondayOf };