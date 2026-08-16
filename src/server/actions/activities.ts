"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { recordOpportunityAction } from "@/lib/engine/opportunities";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { APTITUDE_PRACTICE_SETS } from "@/lib/assessment-data";

export async function registerEventAction(eventId: string) {
  const { profile } = await requireStudentProfile();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;
  const now = new Date();
  if (event.endsAt && event.endsAt < now) return;
  await prisma.eventParticipation.upsert({
    where: { studentId_eventId: { studentId: profile.id, eventId } },
    create: { studentId: profile.id, eventId, status: "REGISTERED" },
    update: { status: "REGISTERED" },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/opportunities");
}

export async function submitAptitudePracticeAction(
  formData: FormData
): Promise<{ ok: true; setKey: string; score: number; maxScore: number } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const setKey = (formData.get("setKey") as string) || "";
  const set = APTITUDE_PRACTICE_SETS.find((s) => s.key === setKey);
  if (!set) return { error: "Unknown practice set" };

  let score = 0;
  for (const q of set.questions) {
    const v = Number(formData.get(`q_${q.id}`));
    if (v === q.answer) score++;
  }

  await prisma.assessment.create({
    data: {
      studentId: profile.id,
      type: "APTITUDE",
      score,
      maxScore: set.questions.length,
      data: JSON.stringify({ set: setKey }),
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/placement");
  return { ok: true, setKey, score, maxScore: set.questions.length };
}

export async function saveOpportunityAction(opportunityId: string) {
  const { profile } = await requireStudentProfile();
  await recordOpportunityAction(prisma, profile.id, opportunityId, "SAVED");
  revalidatePath("/app/opportunities");
}

export async function applyOpportunityAction(opportunityId: string) {
  const { profile } = await requireStudentProfile();
  await recordOpportunityAction(prisma, profile.id, opportunityId, "APPLIED");
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/opportunities");
}

export async function recordCodingSubmissionAction(problemId: string, status: string, code: string) {
  const { profile } = await requireStudentProfile();
  const problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
  if (!problem) return;
  await prisma.codingSubmission.create({
    data: {
      studentId: profile.id,
      problemId,
      status,
      code,
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/coding");
}

export async function recordMockInterviewAction(formData: FormData) {
  const { profile } = await requireStudentProfile();
  const type = (formData.get("type") as string) || "TECHNICAL";
  const role = (formData.get("role") as string) || profile.targetRole || "";
  const score = Number(formData.get("score")) || 0;
  const maxScore = Number(formData.get("maxScore")) || 10;
  const notes = (formData.get("notes") as string) || "";

  await prisma.mockInterview.create({
    data: {
      studentId: profile.id,
      type,
      role,
      score,
      maxScore,
      feedback: JSON.stringify([notes]),
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/interviews");
  return { ok: true };
}

export async function submitQuizAction(
  quizId: string,
  answers: Record<string, number>
): Promise<{ ok: true; score: number; maxScore: number } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { error: "Quiz not found" };

  const questions = JSON.parse(quiz.questions) as { options: string[]; answer: number }[];
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) score++;
  });

  await prisma.quizResult.create({
    data: {
      studentId: profile.id,
      quizId,
      score,
      maxScore: questions.length,
      answers: JSON.stringify(answers),
    },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/quizzes");
  return { ok: true, score, maxScore: questions.length };
}
