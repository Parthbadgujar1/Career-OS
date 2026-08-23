import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { fromJson } from "@/lib/utils";

export const PROGRESS_TEST_INTERVAL_DAYS = 15;

export async function scheduleNextProgressTest(prisma: PrismaClient, studentId: string) {
  const dueAt = new Date(Date.now() + PROGRESS_TEST_INTERVAL_DAYS * 86400000);
  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { nextProgressTestDueAt: dueAt },
  });
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { preferences: true },
  });
  const prefs = fromJson<Record<string, boolean>>(profile?.preferences, {});
  if (prefs.taskReminders !== false) {
    await prisma.notification.create({
      data: {
        studentId,
        type: "REPORT",
        title: "Progress test scheduled",
        body: `Your next 30-minute progress test is due on ${dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Take it when you're ready to track your growth.`,
      },
    });
  }
  return dueAt;
}
