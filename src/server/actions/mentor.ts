"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMentor } from "@/lib/auth-helper";
import { fromJson } from "@/lib/utils";

export async function mentorSendFeedbackAction(studentId: string, message: string) {
  const mentor = await requireMentor();
  if (!message.trim()) return;

  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId, mentorId: mentor.id },
    select: { id: true, preferences: true },
  });
  if (!student) return;

  const prefs = fromJson<Record<string, boolean>>(student.preferences, {});
  if (prefs.mentorMessages !== false) {
    await prisma.notification.create({
      data: {
        studentId,
        type: "ALERT",
        title: `Feedback from ${mentor.name ?? "your mentor"}`,
        body: message.trim(),
      },
    });
  }

  revalidatePath("/mentor");
  revalidatePath("/app/mentor");
  revalidatePath("/app");
}
