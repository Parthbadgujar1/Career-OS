"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile, requireMentor } from "@/lib/auth-helper";
import { AI_QUESTION_BANK, gradeAiAnswer, INTERVIEW_CRITERIA, AI_MAX_SCORE } from "@/lib/interview-data";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

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
  const questionsRaw = fromJson<Array<{ id: string; question: string; idealKeywords: string[]; maxScore: number }>>(formData.get("questions") as string, []);

  const bank = questionsRaw.length > 0 ? questionsRaw : (AI_QUESTION_BANK[type] ?? AI_QUESTION_BANK.TECHNICAL);
  const criteria = INTERVIEW_CRITERIA[type] ?? INTERVIEW_CRITERIA.TECHNICAL;

  let percent = 0;
  const perQuestion: Record<string, { score: number; comment: string; question: string }> = {};
  let criteriaScores: Record<string, number> = {};
  let feedbackList: string[] = [];
  let weakAreas: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const qaFormatted = bank.map((q) => {
        const answer = answersRaw[q.id] || "(no answer provided)";
        return `Question ID: ${q.id}\nQuestion: ${q.question}\nStudent's Answer: """${answer}"""\nIdeal Concepts: ${q.idealKeywords.join(", ")}`;
      }).join("\n\n");

      const prompt = `You are a professional mock interviewer grading a student's "${type}" interview for a "${role}" role.
Evaluate the student's responses to the following questions.

${qaFormatted}

For the evaluation:
1. Grade each question response out of 100 based on accuracy, depth, relevance, and completeness, referencing the Ideal Concepts.
2. Provide a constructive, professional 1-2 sentence comment for each question response.
3. Compute the overall score as the average of the question scores.
4. Score the student on each of the following criteria (0-100): ${criteria.join(", ")}.
5. Generate a checklist of feedback points (up to 5 items) for improvement.
6. Identify weak areas (questions or concepts where the student scored below 60).

Return the grading matching the schema.`;

      const { object } = await generateObject({
        model: getModel(),
        schema: z.object({
          score: z.number().int().min(0).max(100),
          perQuestion: z.record(
            z.string(),
            z.object({
              score: z.number().int().min(0).max(100),
              comment: z.string(),
            })
          ),
          criteriaScores: z.record(z.string(), z.number().int().min(0).max(100)),
          feedbackList: z.array(z.string()),
          weakAreas: z.array(z.string()),
        }),
        schemaName: "interview_grading",
        schemaDescription: "AI grading of mock interview",
        prompt,
      });

      percent = object.score;
      criteriaScores = object.criteriaScores;
      feedbackList = object.feedbackList;
      weakAreas = object.weakAreas;

      for (const q of bank) {
        const grade = object.perQuestion[q.id] || { score: 0, comment: "No answer evaluated." };
        perQuestion[q.id] = {
          score: grade.score,
          comment: grade.comment,
          question: q.question,
        };
      }
    } catch (e) {
      console.error("[interviews] AI grading failed, falling back to deterministic", e);
    }
  }

  // Fallback if AI grading is skipped or failed
  if (percent === 0 || Object.keys(perQuestion).length === 0) {
    let total = 0;
    for (const q of bank) {
      const answer = answersRaw[q.id] ?? "";
      const g = gradeAiAnswer(answer, q);
      perQuestion[q.id] = { score: g.score, comment: g.comment, question: q.question };
      total += g.score;
    }
    const avgScore = Math.round(total / Math.max(1, bank.length));
    percent = Math.min(100, avgScore);

    criteria.forEach((c, i) => {
      criteriaScores[c] = Math.min(100, percent + (i === 0 ? 5 : i === 1 ? 0 : -5));
    });

    feedbackList = bank.map((q) => {
      const g = perQuestion[q.id];
      return `Q: ${q.question} — ${g.score}/100. ${g.comment}`;
    });

    weakAreas = bank.filter((q) => (perQuestion[q.id]?.score ?? 0) < 50).map((q) => q.question.slice(0, 80));
  }

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
      weakAreas: JSON.stringify(weakAreas),
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/interviews");
  return { ok: true, score: percent, perQuestion };
}

export async function generateAiInterviewQuestionsAction(
  type: AiType,
  role: string
): Promise<{ ok: true; questions: Array<{ id: string; question: string; idealKeywords: string[]; maxScore: number }> } | { error: string }> {
  const { profile } = await requireStudentProfile();

  if (!process.env.GEMINI_API_KEY) {
    const bank = AI_QUESTION_BANK[type] ?? AI_QUESTION_BANK.TECHNICAL;
    return { ok: true, questions: bank };
  }

  try {
    const prompt = `You are a professional technical recruiter and mock interviewer for Career OS.
Generate 5 unique mock interview questions of type "${type}" for a candidate targeting the role "${role || profile.targetRole || "Software Developer"}".

Ensure the questions are highly relevant, specific, and typical of what recruiters ask.
For each question:
1. Provide a clear question text.
2. Provide a list of 5-8 ideal keywords or key conceptual phrases (e.g. "Big-O", "STAR format", "time management") that a strong candidate would use in their answer.
3. Set the maxScore to 20.

Return the questions list matching the schema.`;

    const { object } = await generateObject({
      model: getModel(),
      schema: z.object({
        questions: z.array(
          z.object({
            id: z.string(),
            question: z.string(),
            idealKeywords: z.array(z.string()),
            maxScore: z.number().default(20),
          })
        ).length(5),
      }),
      schemaName: "interview_questions",
      schemaDescription: "Dynamically generated mock interview questions",
      prompt,
    });

    return { ok: true, questions: object.questions };
  } catch (e) {
    console.error("[interviews] AI question generation failed, using fallback bank", e);
    const bank = AI_QUESTION_BANK[type] ?? AI_QUESTION_BANK.TECHNICAL;
    return { ok: true, questions: bank };
  }
}
