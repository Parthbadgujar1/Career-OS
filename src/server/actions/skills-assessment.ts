"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import {
  generateInitialQuestions,
  generateFollowUpQuestions,
  gradeSkillsFromResponses,
} from "@/lib/ai/skills-assessment";
import { persistRoadmap } from "@/lib/engine/roadmap";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";

// ── Adaptive Assessment Actions ───────────────────────────────────────────

export async function restartAssessmentAction() {
  const { profile } = await requireStudentProfile();

  await prisma.assessmentQuestion.deleteMany({ where: { studentId: profile.id } });
  await prisma.studentSkill.deleteMany({ where: { studentId: profile.id } });
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { assessmentComplete: false },
  });

  revalidatePath("/app/assessment");
  revalidatePath("/app");
  redirect("/app/assessment");
}

export async function startAssessmentAction(): Promise<
  { ok: true; questions: Array<{ id: string; question: string; options: string[]; topic: string; skillArea: string; difficulty: string }> } | { error: string }
> {
  const { profile } = await requireStudentProfile();

  if (!profile.degree || !profile.targetRole) {
    return { error: "Complete onboarding first — choose your degree and target role." };
  }

  // A fresh run replaces any previous (possibly partial) store.
  await prisma.assessmentQuestion.deleteMany({ where: { studentId: profile.id } });

  const questions = await generateInitialQuestions({
    degree: profile.degree,
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole,
    year: profile.year ?? "",
  });

  await prisma.assessmentQuestion.createMany({
    data: questions.map((q) => ({
      studentId: profile.id,
      round: 0,
      questionId: q.id,
      question: q.question,
      options: JSON.stringify(q.options),
      correctIndex: q.correctIndex,
      topic: q.topic,
      skillArea: q.skillArea,
      difficulty: q.difficulty,
    })),
  });

  return {
    ok: true,
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
      skillArea: q.skillArea,
      difficulty: q.difficulty,
    })),
  };
}

export async function submitRoundAction(
  round: number,
  answers: Array<{ questionId: string; answered: number; question: string; topic: string; skillArea: string; difficulty: string }>
): Promise<
  { ok: true; nextQuestions: Array<{ id: string; question: string; options: string[]; topic: string; skillArea: string; difficulty: string }> } | { ok: true; done: true; result: { grades: Array<{ name: string; category: string; grade: number; confidence: number; reasoning: string }>; overallScore: number; summary: string; weakAreas: string[]; strongAreas: string[]; recommendedPath: string } } | { error: string }
> {
  const { profile } = await requireStudentProfile();

  // Grade honestly: look up the stored correct answer for each question.
  const stored = await prisma.assessmentQuestion.findMany({
    where: { studentId: profile.id, round },
  });
  const correctByQuestion = new Map(stored.map((q) => [q.questionId, q.correctIndex]));

  const gradedAnswers = answers.map((a) => ({
    ...a,
    correct: correctByQuestion.get(a.questionId) === a.answered,
  }));

  // Write the student's selections back to the store so the final grade can
  // use every round's answers, not just the latest one.
  for (const a of answers) {
    await prisma.assessmentQuestion.updateMany({
      where: { studentId: profile.id, questionId: a.questionId },
      data: { selected: a.answered, correct: correctByQuestion.get(a.questionId) === a.answered },
    });
  }

  if (round === 0) {
    // Generate follow-up questions based on how round 1 was actually answered.
    const followUp = await generateFollowUpQuestions(
      {
        degree: profile.degree ?? "",
        specialization: profile.specialization ?? "",
        targetRole: profile.targetRole ?? "",
        year: profile.year ?? "",
      },
      gradedAnswers,
    );

    await prisma.assessmentQuestion.createMany({
      data: followUp.map((q) => ({
        studentId: profile.id,
        round: 1,
        questionId: q.id,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        topic: q.topic,
        skillArea: q.skillArea,
        difficulty: q.difficulty,
      })),
    });

    return {
      ok: true,
      nextQuestions: followUp.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        topic: q.topic,
        skillArea: q.skillArea,
        difficulty: q.difficulty,
      })),
    };
  }

  // Final round — grade with every answered question across both rounds.
  const allStored = await prisma.assessmentQuestion.findMany({
    where: { studentId: profile.id, selected: { not: null } },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });
  if (allStored.length === 0) {
    return { error: "No valid answers to grade — please restart the assessment." };
  }

  const allAnswers = allStored.map((q) => ({
    questionId: q.questionId,
    question: q.question,
    answered: q.selected as number,
    correct: (q.correct as boolean) ?? false,
    topic: q.topic,
    skillArea: q.skillArea,
    difficulty: q.difficulty,
  }));

  const result = await gradeSkillsFromResponses(
    {
      degree: profile.degree ?? "",
      specialization: profile.specialization ?? "",
      targetRole: profile.targetRole ?? "",
      year: profile.year ?? "",
    },
    allAnswers,
  );

  // Persist grades to StudentSkill
  for (const g of result.grades) {
    const skill = await prisma.skill.findFirst({ where: { name: g.name } });
    if (skill) {
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId: profile.id, skillId: skill.id } },
        create: { studentId: profile.id, skillId: skill.id, selfRating: g.grade },
        update: { selfRating: g.grade },
      });
    }
  }

  // Mark assessment complete
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { assessmentComplete: true },
  });

  // Build personalized roadmap
  const skillRows = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });

  await persistRoadmap(
    prisma,
    profile.id,
    {
      degree: profile.degree ?? "",
      specialization: profile.specialization ?? "",
      year: profile.year ?? "",
      targetRole: profile.targetRole ?? "",
      interests: fromJson<string[]>(profile.interests, []),
      weeklyHours: profile.weeklyHours,
      skills: skillRows.map((s) => ({ name: s.skill.name, rating: s.selfRating })),
      weakSkills: skillRows.filter((s) => s.selfRating <= 2).map((s) => s.skill.name),
    },
    12,
    true,
  );

  await snapshotReadiness(prisma, profile.id);

  return { ok: true, done: true, result };
}
