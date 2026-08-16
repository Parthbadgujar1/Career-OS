"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMentor } from "@/lib/auth-helper";

export async function mentorSendFeedbackAction(studentId: string, message: string) {
  const mentor = await requireMentor();
  if (!message.trim()) return;

  const student = await prisma.studentProfile.findFirst({
    where: { id: studentId, mentorId: mentor.id },
    select: { id: true },
  });
  if (!student) return;

  await prisma.notification.create({
    data: {
      studentId,
      type: "ALERT",
      title: `Feedback from ${mentor.name ?? "your mentor"}`,
      body: message.trim(),
    },
  });

  revalidatePath("/mentor");
  revalidatePath("/app/mentor");
  revalidatePath("/app");
}
