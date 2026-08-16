"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile, requireMentor } from "@/lib/auth-helper";
import { AI_QUESTION_BANK, gradeAiAnswer, INTERVIEW_CRITERIA, AI_MAX_SCORE } from "@/lib/interview-data";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";

type AiType = "TECHNICAL" | "HR" | "BEHAVIORAL";

function parseTime(t: string): Date | null {
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

// ============ MENTOR: slots ============

export async function createInterviewSlotAction(formData: FormData) {
  const user = await requireMentor();
  const title = (formData.get("title") as string) || "Mock interview";
  const type = ((formData.get("type") as string) || "TECHNICAL") as AiType;
  const startAt = parseTime(formData.get("startAt") as string);
  const endAt = parseTime(formData.get("endAt") as string) ?? undefined;
  const meetUrl = (formData.get("meetUrl") as string) || undefined;
  const maxStudents = Math.max(1, Number(formData.get("maxStudents")) || 1);

  if (!startAt) return;

  await prisma.interviewSlot.create({
    data: { mentorId: user.id, title, type, startAt, endAt, meetUrl, maxStudents },
  });
  revalidatePath("/mentor/interviews");
}

export async function cancelInterviewSlotAction(slotId: string) {
  const user = await requireMentor();
  const slot = await prisma.interviewSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.mentorId !== user.id) return;

  await prisma.interviewBooking.updateMany({ where: { slotId }, data: { status: "CANCELLED" } });
  await prisma.interviewSlot.update({ where: { id: slotId }, data: { status: "CANCELLED" } });
  revalidatePath("/mentor/interviews");
}

export async function completeInterviewBookingAction(formData: FormData) {
  const user = await requireMentor();
  const bookingId = formData.get("bookingId") as string;
  const score = Math.max(0, Number(formData.get("score")) || 0);
  const maxScore = Math.max(1, Number(formData.get("maxScore")) || 100);
  const feedback = (formData.get("feedback") as string) || "";

  const booking = await prisma.interviewBooking.findUnique({ where: { id: bookingId }, include: { slot: true } });
  if (!booking || booking.slot.mentorId !== user.id) return;

  await prisma.interviewBooking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED", score, maxScore, feedback: JSON.stringify(feedback ? [feedback] : []) },
  });
  await prisma.interviewSlot.update({ where: { id: booking.slotId }, data: { status: "COMPLETED" } });

  await prisma.mockInterview.create({
    data: {
      studentId: booking.studentId,
      type: booking.slot.type,
      mode: "MENTOR_MEET",
      role: booking.slot.title,
      score,
      maxScore,
      criteriaScores: JSON.stringify({ Overall: score }),
      feedback: JSON.stringify(feedback ? [feedback] : []),
      evaluatorName: user.name ?? "Mentor",
      meetUrl: booking.slot.meetUrl,
    },
  });
  await snapshotReadiness(prisma, booking.studentId);
  revalidatePath("/mentor/interviews");
  revalidatePath("/app/interviews");
}

// ============ STUDENT: booking ============

export async function bookInterviewSlotAction(
  slotId: string
): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const slot = await prisma.interviewSlot.findUnique({ where: { id: slotId }, include: { bookings: true } });
  if (!slot || slot.status !== "AVAILABLE") return { error: "This slot is no longer available." };
  if (slot.bookings.some((b) => b.studentId === profile.id)) return { error: "You already booked this slot." };
  if (slot.bookings.filter((b) => b.status !== "CANCELLED").length >= slot.maxStudents) {
    return { error: "This slot is already full." };
  }

  await prisma.interviewBooking.create({
    data: { slotId: slot.id, studentId: profile.id, status: "BOOKED" },
  });
  const active = await prisma.interviewBooking.count({
    where: { slotId: slot.id, status: { not: "CANCELLED" } },
  });
  if (active >= slot.maxStudents) {
    await prisma.interviewSlot.update({ where: { id: slot.id }, data: { status: "BOOKED" } });
  }
  await prisma.notification.create({
    data: {
      studentId: profile.id,
      type: "INTERVIEW",
      title: "Interview slot booked",
      body: `You're booked for "${slot.title}" on ${slot.startAt.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}. Join using the meet link from My Sessions.`,
    },
  });
  revalidatePath("/app/interviews");
  return { ok: true };
}

export async function cancelInterviewBookingAction(slotId: string) {
  const { profile } = await requireStudentProfile();
  const booking = await prisma.interviewBooking.findUnique({
    where: { slotId_studentId: { slotId, studentId: profile.id } },
  });
  if (!booking) return;

  await prisma.interviewBooking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  await prisma.interviewSlot.update({ where: { id: slotId }, data: { status: "AVAILABLE" } });
  revalidatePath("/app/interviews");
}

// ============ STUDENT: AI interview ============

export async function submitAiInterviewAction(
  formData: FormData
): Promise<
  | { ok: true; score: number; perQuestion: Record<string, { score: number; comment: string; question: string }> }
  | { error: string }
> {
  const { profile } = await requireStudentProfile();
  const type = ((formData.get("type") as string) || "TECHNICAL") as AiType;
  const role = (formData.get("role") as string) || profile.targetRole || "";
  const answersRaw = fromJson<Record<string, string>>((formData.get("answers") as string) ?? "{}", {});

  const bank = AI_QUESTION_BANK[type] ?? AI_QUESTION_BANK.TECHNICAL;
  const criteria = INTERVIEW_CRITERIA[type] ?? INTERVIEW_CRITERIA.TECHNICAL;

  let total = 0;
  const perQuestion: Record<string, { score: number; comment: string; question: string }> = {};
  for (const q of bank) {
    const answer = answersRaw[q.id] ?? "";
    const g = gradeAiAnswer(answer, q);
    perQuestion[q.id] = { score: g.score, comment: g.comment, question: q.question };
    total += g.score;
  }

  const avgScore = Math.round(total / Math.max(1, bank.length));
  const criteriaScores: Record<string, number> = {};
  criteria.forEach((c, i) => {
    criteriaScores[c] = Math.min(100, avgScore + (i === 0 ? 5 : i === 1 ? 0 : -5));
  });

  const feedbackList = bank.map((q) => {
    const g = perQuestion[q.id];
    return `Q: ${q.question} — ${g.score}/100. ${g.comment}`;
  });

  const percent = Math.min(100, avgScore);
  await prisma.mockInterview.create({
    data: {
      studentId: profile.id,
      type,
      mode: "AI",
      role,
      score: percent,
      maxScore: AI_MAX_SCORE,
      criteriaScores: JSON.stringify(criteriaScores),
      transcript: JSON.stringify(perQuestion),
      feedback: JSON.stringify(feedbackList),
      weakAreas: JSON.stringify(
        bank.filter((q) => (perQuestion[q.id]?.score ?? 0) < 50).map((q) => q.question.slice(0, 80))
      ),
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/interviews");
  return { ok: true, score: percent, perQuestion };
}
