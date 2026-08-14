import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { startOfDay } from "@/lib/utils";

const MAX_TASKS_PER_DAY = 6;
const DEFAULT_CODING_TOPICS = ["Arrays", "Strings", "Hash maps", "Linked lists", "Stacks & queues", "Trees", "Graphs", "Dynamic programming", "Recursion", "Sorting"];

function currentWeek(createdAt: Date, today: Date): number {
  const diff = Math.floor((startOfDay(today).getTime() - startOfDay(createdAt).getTime()) / 86400000);
  return Math.max(1, Math.floor(diff / 7) + 1);
}

/**
 * Tracks the student's daily activity streak. Counts once per calendar day:
 * an activity on consecutive days extends the streak, a gap resets it.
 */
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

/**
 * Moves incomplete tasks from previous days onto today, bumping their
 * priority (Section 6.3: "Automatic rollover of incomplete tasks").
 */
export async function rolloverTasks(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  const today = startOfDay(date);
  const pendingOld = await prisma.task.findMany({
    where: { studentId, status: "PENDING", assignedDate: { lt: today } },
  });
  for (const task of pendingOld) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        assignedDate: today,
        rolloverCount: task.rolloverCount + 1,
        priority: task.priority === "LOW" ? "NORMAL" : "HIGH",
      },
    });
  }
  return pendingOld.length;
}

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

/**
 * Ensures today has a sensible daily plan. Uses roadmap milestones for the
 * current week, rolls over missed work, and adapts coding practice to weak topics.
 */
export async function ensureDailyTasks(prisma: PrismaClient, studentId: string, date: Date = new Date()) {
  await rolloverTasks(prisma, studentId, date);
  const today = startOfDay(date);

  const existing = await prisma.task.count({
    where: { studentId, assignedDate: today, status: "PENDING" },
  });
  if (existing >= MAX_TASKS_PER_DAY) {
    return prisma.task.findMany({ where: { studentId, assignedDate: today }, orderBy: { priority: "desc" } });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { roadmap: { include: { items: { orderBy: { weekNumber: "asc" } } } } },
  });
  const dayIndex = (today.getDay() + 6) % 7; // Mon=0
  const created: string[] = [];

  if (profile?.roadmap) {
    const week = currentWeek(profile.roadmap.createdAt, today);
    const weekItems = profile.roadmap.items.filter((i) => i.weekNumber === week && i.status === "PENDING");
    const pick = (category: string) => {
      const items = weekItems.filter((i) => i.category === category);
      if (items.length === 0) return null;
      return items[dayIndex % items.length];
    };

    const alreadyAssigned = new Set(
      (
        await prisma.task.findMany({
          where: { studentId, assignedDate: today },
          select: { roadmapItemId: true },
        })
      ).map((t) => t.roadmapItemId)
    );

    const learning = pick("LEARNING");
    if (learning && !alreadyAssigned.has(learning.id)) {
      const t = await prisma.task.create({
        data: {
          studentId,
          title: `Learn: ${learning.title.replace(/^Learn:\s*/, "")}`,
          description: learning.description,
          category: "LEARNING",
          priority: "NORMAL",
          assignedDate: today,
          roadmapItemId: learning.id,
        },
      });
      created.push(t.id);
    }

    const coding = pick("CODING");
    if (coding && !alreadyAssigned.has(coding.id)) {
      const topic = await weakestCodingTopic(prisma, studentId);
      const t = await prisma.task.create({
        data: {
          studentId,
          title: `Code: ${topic} practice`,
          description: `Solve at least 2 problems on ${topic}. Weak topic — do not skip.`,
          category: "CODING",
          priority: "HIGH",
          assignedDate: today,
          roadmapItemId: coding.id,
        },
      });
      created.push(t.id);
    }

    const project = pick("PROJECT");
    if (project && !alreadyAssigned.has(project.id)) {
      const t = await prisma.task.create({
        data: {
          studentId,
          title: `Project: ${project.title.replace(/^Project:\s*/, "")}`,
          description: project.description,
          category: "PROJECT",
          priority: "HIGH",
          assignedDate: today,
          roadmapItemId: project.id,
        },
      });
      created.push(t.id);
    }

    // Rotate profile / interview / opportunity through the week
    const schedule: Record<number, string[]> = {
      0: ["PROFILE"], // Monday
      1: [],
      2: ["INTERVIEW"], // Wednesday
      3: [],
      4: ["OPPORTUNITY"], // Friday
      5: ["PROFILE"], // Saturday
      6: [],
    };
    const wanted = schedule[dayIndex] ?? [];
    for (const cat of wanted) {
      const item = pick(cat);
      if (item && !alreadyAssigned.has(item.id)) {
        const t = await prisma.task.create({
          data: {
            studentId,
            title: `${cat === "PROFILE" ? "Profile" : cat === "INTERVIEW" ? "Interview" : "Opportunity"}: ${item.title.split(": ").slice(1).join(": ") || item.title}`,
            description: item.description,
            category: item.category,
            priority: "NORMAL",
            assignedDate: today,
            roadmapItemId: item.id,
          },
        });
        created.push(t.id);
      }
    }
  }

  // Always ensure at least one coding + one learning task even without a roadmap
  if (!profile?.roadmap || created.length < 3) {
    if (created.length < 3) {
      const topic = await weakestCodingTopic(prisma, studentId);
      const exists = await prisma.task.findFirst({
        where: { studentId, assignedDate: today, category: "CODING" },
      });
      if (!exists) {
        await prisma.task.create({
          data: {
            studentId,
            title: `Code: ${topic} practice`,
            description: `Solve at least 2 problems on ${topic}.`,
            category: "CODING",
            priority: "HIGH",
            assignedDate: today,
          },
        });
      }
    }
  }

  return prisma.task.findMany({ where: { studentId, assignedDate: today }, orderBy: { priority: "desc" } });
}

export async function completeTask(prisma: PrismaClient, studentId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, studentId } });
  if (!task) throw new Error("Task not found");
  if (task.roadmapItemId) {
    await prisma.roadmapItem.update({ where: { id: task.roadmapItemId }, data: { status: "COMPLETED" } });
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

export { currentWeek };
