"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";

export async function markNotificationReadAction(notificationId: string) {
  const { profile } = await requireStudentProfile();
  await prisma.notification.updateMany({
    where: { id: notificationId, studentId: profile.id },
    data: { read: true },
  });
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}

export async function markAllNotificationsReadAction() {
  const { profile } = await requireStudentProfile();
  await prisma.notification.updateMany({
    where: { studentId: profile.id, read: false },
    data: { read: true },
  });
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}
