import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { startOfDay } from "@/lib/utils";
import { computeProficiency, distributeTasksAcrossWeek, type ComputeResult } from "@/lib/engine/adaptive";

const TASKS_PER_WEEK = 6;
const DEFAULT_CODING_TOPICS = ["Arrays", "Strings", "Hash maps", "Linked lists", "Stacks & queues", "Trees", "Graphs", "Dynamic programming", "Recursion", "Sorting"];

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

// ── Rollover (weekly) ─────────────────────────────────────────────────────

/**
 * Moves incomplete tasks from previous weeks into the current week,
 * bumping priority so the student does not fall further behind.
 */
export async function rolloverTasks(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const thisMonday = mondayOf(date);
  const pendingOld = await prisma.task.findMany({
    where: { studentId, status: "PENDING", weekStart: { lt: thisMonday } },
  });
  for (const task of pendingOld) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        weekStart: thisMonday,
        rolloverCount: task.rolloverCount + 1,
        priority: task.priority === "LOW" ? "NORMAL" : "HIGH",
      },
    });
  }
  return pendingOld.length;
}

// ── Weakest coding topic ──────────────────────────────────────────────────

async function weakestCodingTopic(prisma: PrismaClient, studentId: string): Promise<string> {
  const subs = await prisma.codingSubmission.findMany({
    where: { studentId },
    include: { problem: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const failures = new Map<string, number>();
  for (const s of subs) {
    if (s.status !== "SOLVED") {
      failures.set(s.problem.topic, (failures.get(s.problem.topic) ?? 0) + 1);
    }
  }
  if (failures.size > 0) {
    let best = "";
    let bestCount = 0;
    for (const [topic, count] of failures) {
      if (count > bestCount) {
        bestCount = count;
        best = topic;
      }
    }
    if (best) return best;
  }
  return DEFAULT_CODING_TOPICS[Math.floor(Math.random() * DEFAULT_CODING_TOPICS.length)];
}

// ── Weekly task generation ────────────────────────────────────────────────

/**
 * Creates the week's tasks based on adaptive proficiency levels.
 * This replaces ensureDailyTasks and runs once per week (on first visit).
 */
export async function ensureWeeklyTasks(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const thisMonday = mondayOf(date);

  // 1. Roll over missed tasks from previous weeks
  await rolloverTasks(prisma, studentId, date);

  // 2. If this week already has tasks, return them
  const existing = await prisma.task.findMany({
    where: { studentId, weekStart: thisMonday, status: "PENDING" },
  });
  if (existing.length >= TASKS_PER_WEEK) return existing;

  // 3. Compute adaptive proficiency
  const compute = await computeProficiency(prisma, studentId);

  // 4. Get roadmap for project / learning items
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { roadmap: { include: { items: { orderBy: { weekNumber: "asc" } } } } },
  });
  const weekNumber = profile?.roadmap ? currentWeek(profile.roadmap.createdAt, date) : 1;
  const roadmapItems = profile?.roadmap?.items.filter((i) => i.weekNumber === weekNumber && i.status === "PENDING") ?? [];

  // 5. Get already-assigned items this week to avoid duplicates
  const alreadyAssigned = new Set(
    existing.map((t) => t.roadmapItemId).filter(Boolean) as string[],
  );

  // 6. Build adaptive mix
  const mix = buildAdaptiveMix(compute, roadmapItems);
  const plan = distributeTasksAcrossWeek(TASKS_PER_WEEK, mix);

  // 7. Create tasks
  const created: string[] = [];
  const categoryPickers = new Map<string, () => Promise<{ title: string; description: string; roadmapItemId?: string } | null>>();

  const topic = await weakestCodingTopic(prisma, studentId);

  categoryPickers.set("LEARNING", async () => {
    const item = roadmapItems.find((i) => i.category === "LEARNING" && !alreadyAssigned.has(i.id));
    return {
      title: `Learn: ${item?.title.replace(/^Learn:\s*/, "") ?? topic + " fundamentals"}`,
      description: item?.description ?? `Study ${topic} basics and complete practice exercises`,
      roadmapItemId: item?.id,
    };
  });

  categoryPickers.set("CODING", async () => {
    const item = roadmapItems.find((i) => i.category === "CODING" && !alreadyAssigned.has(i.id));
    return {
      title: `Code: ${topic} practice`,
      description: `Solve at least 2 problems on ${topic}. Weak topic — do not skip.`,
      roadmapItemId: item?.id,
    };
  });

  categoryPickers.set("PROJECT", async () => {
    const item = roadmapItems.find((i) => i.category === "PROJECT" && !alreadyAssigned.has(i.id));
    return {
      title: `Project: ${item?.title.replace(/^Project:\s*/, "") ?? "Build a portfolio project"}`,
      description: item?.description ?? "Continue work on your current project milestone",
      roadmapItemId: item?.id,
    };
  });

  categoryPickers.set("PROFILE", async () => {
    const item = roadmapItems.find((i) => i.category === "PROFILE" && !alreadyAssigned.has(i.id));
    return {
      title: `Profile: ${item?.title.replace(/^Profile:\s*/, "") ?? "Update resume / LinkedIn"}`,
      description: item?.description ?? "Update your resume, LinkedIn headline, or GitHub README",
      roadmapItemId: item?.id,
    };
  });

  categoryPickers.set("INTERVIEW", async () => {
    const item = roadmapItems.find((i) => i.category === "INTERVIEW" && !alreadyAssigned.has(i.id));
    return {
      title: `Interview: ${item?.title.replace(/^Interview:\s*/, "") ?? "Mock interview practice"}`,
      description: item?.description ?? "Complete a mock interview session or practice STAR stories",
      roadmapItemId: item?.id,
    };
  });

  categoryPickers.set("OPPORTUNITY", async () => {
    const item = roadmapItems.find((i) => i.category === "OPPORTUNITY" && !alreadyAssigned.has(i.id));
    return {
      title: `Opportunity: ${item?.title.replace(/^Opportunity:\s*/, "") ?? "Browse & save opportunities"}`,
      description: item?.description ?? "Browse the Jobs & Internships page and save 2-3 matching positions",
      roadmapItemId: item?.id,
    };
  });

  for (const { category, day } of plan) {
    const picker = categoryPickers.get(category);
    if (!picker) continue;
    const picked = await picker();
    if (!picked) continue;

    const t = await prisma.task.create({
      data: {
        studentId,
        title: picked.title,
        description: picked.description,
        category,
        priority: category === "CODING" ? "HIGH" : "NORMAL",
        status: "PENDING",
        source: "ADAPTIVE",
        weekStart: thisMonday,
        suggestedDay: day,
        frequency: "WEEKLY",
        estimatedHours: estimateHours(category, compute.band),
        assignedDate: new Date(), // creation date
        roadmapItemId: picked.roadmapItemId,
      },
    });
    created.push(t.id);
  }

  // Fallback: ensure at least 3 tasks exist for the week
  if (created.length < 3) {
    const exists = await prisma.task.findFirst({ where: { studentId, weekStart: thisMonday, category: "CODING" } });
    if (!exists) {
      await prisma.task.create({
        data: {
          studentId,
          title: `Code: ${topic} practice`,
          description: `Solve at least 2 problems on ${topic}.`,
          category: "CODING",
          priority: "HIGH",
          source: "ADAPTIVE",
          weekStart: thisMonday,
          suggestedDay: "MON",
          estimatedHours: 2,
          assignedDate: new Date(),
        },
      });
    }
  }

  return prisma.task.findMany({ where: { studentId, weekStart: thisMonday }, orderBy: { suggestedDay: "asc" } });
}

function buildAdaptiveMix(
  compute: ComputeResult,
  roadmapItems: { category: string; id: string }[],
): Record<string, number> {
  const base: Record<string, number> = {
    LEARNING: 0.25,
    CODING: 0.25,
    PROJECT: 0.20,
    PROFILE: 0.10,
    INTERVIEW: 0.10,
    OPPORTUNITY: 0.10,
  };

  // Adjust based on weakest dimensions
  const weakest = Object.entries(compute.proficiency)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);

  for (const [key] of weakest) {
    const cat = key === "coreSkills" ? "LEARNING" : key === "coding" ? "CODING" : key === "projects" ? "PROJECT" : key === "interview" ? "INTERVIEW" : null;
    if (cat) base[cat] = Math.min(0.40, base[cat] + 0.10);
  }

  // If student has roadmap, ensure LEARNING and PROJECT are represented
  if (roadmapItems.length > 0) {
    base.LEARNING = Math.max(base.LEARNING, 0.20);
    base.PROJECT = Math.max(base.PROJECT, 0.15);
  }

  // Normalize to sum = 1.0
  const total = Object.values(base).reduce((s, v) => s + v, 0);
  for (const key of Object.keys(base)) {
    base[key] = base[key] / total;
  }

  return base;
}

function estimateHours(category: string, band: string): number {
  const base: Record<string, number> = {
    LEARNING: band === "beginner" ? 3 : 2,
    CODING: 2,
    PROJECT: 3,
    PROFILE: 1,
    INTERVIEW: 1.5,
    OPPORTUNITY: 1,
  };
  return base[category] ?? 1;
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
  return prisma.task.update({ where: { id: taskId }, data: { status: "SKIPPED", completedAt: new Date() } });
}

export { currentWeek, mondayOf };
