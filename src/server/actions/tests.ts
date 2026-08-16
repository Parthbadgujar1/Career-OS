"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { TEST_BANK } from "@/lib/test-bank";
import { scheduleNextProgressTest } from "@/lib/engine/tests";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";

export async function submitProgressTestAction(
  formData: FormData
): Promise<
  | { ok: true; difficulty: string; score: number; maxScore: number; percent: number }
  | { error: string }
> {
  const { profile } = await requireStudentProfile();

  const difficulty = (formData.get("difficulty") as string) || "MEDIUM";
  const bank = TEST_BANK[difficulty as keyof typeof TEST_BANK] ?? TEST_BANK.MEDIUM;
  const answers = fromJson<Record<string, number>>((formData.get("answers") as string) ?? "{}", {});
  const timeSpentSec = Math.max(0, Number(formData.get("timeSpentSec")) || 0);

  let score = 0;
  for (const q of bank) {
    if (answers[q.id] === q.answer) score++;
  }
  const maxScore = bank.length;

  await prisma.progressTestAttempt.create({
    data: {
      studentId: profile.id,
      difficulty,
      score,
      maxScore,
      timeSpentSec,
      answers: JSON.stringify(answers),
    },
  });

  await scheduleNextProgressTest(prisma, profile.id);
  await snapshotReadiness(prisma, profile.id);

  revalidatePath("/app/progress-test");
  revalidatePath("/app");
  return {
    ok: true,
    difficulty,
    score,
    maxScore,
    percent: Math.round((score / maxScore) * 100),
  };
}

export async function resetProgressTestAction() {
  const { profile } = await requireStudentProfile();
  await scheduleNextProgressTest(prisma, profile.id);
  revalidatePath("/app/progress-test");
}
