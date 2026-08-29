"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMentor, requireStudentProfile } from "@/lib/auth-helper";
import { fromJson } from "@/lib/utils";

// Personalized self-assignment: the student picks a recommended mentor
// matched to their target career, industry and skill gaps.
export async function assignMentorToMeAction(mentorUserId: string) {
  const { profile } = await requireStudentProfile();

  const mentor = await prisma.user.findFirst({
    where: { id: mentorUserId, role: "MENTOR" },
    select: { id: true, name: true },
  });
  if (!mentor) return;

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { mentorId: mentor.id },
  });

  await prisma.notification.create({
    data: {
      studentId: profile.id,
      type: "INFO",
      title: "Mentor assigned",
      body: `${mentor.name ?? "Your mentor"} is now connected to your profile. Reach out with the goals below.`,
    },
  });

  revalidatePath("/app/mentor");
  revalidatePath("/app");
  revalidatePath("/mentor");
  redirect("/app/mentor");
}

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
