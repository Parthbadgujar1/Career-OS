"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ensureWeeklyTasks, completeTask, skipTask } from "@/lib/engine/tasks";
import { generateWeeklyReport } from "@/lib/engine/reports";

export async function ensureTasksAction() {
  const { profile } = await requireStudentProfile();
  await ensureWeeklyTasks(prisma, profile.id);
  revalidatePath("/app/tasks");
}

export async function completeTaskAction(taskId: string) {
  const { profile } = await requireStudentProfile();
  await completeTask(prisma, profile.id, taskId);
  revalidatePath("/app/tasks");
  revalidatePath("/app");
}

export async function skipTaskAction(taskId: string) {
  const { profile } = await requireStudentProfile();
  await skipTask(prisma, profile.id, taskId);
  revalidatePath("/app/tasks");
}

export async function generateWeeklyReportAction() {
  const { profile } = await requireStudentProfile();
  await generateWeeklyReport(prisma, profile.id);
  revalidatePath("/app");
  revalidatePath("/app/reports");
}

export async function markRoadmapItemCompleteAction(itemId: string) {
  const { profile } = await requireStudentProfile();
  const item = await prisma.roadmapItem.findUnique({
    where: { id: itemId },
    include: { roadmap: true },
  });
  if (!item || item.roadmap.studentId !== profile.id) {
    return;
  }
  await prisma.roadmapItem.update({
    where: { id: itemId },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/app/roadmap");
}
