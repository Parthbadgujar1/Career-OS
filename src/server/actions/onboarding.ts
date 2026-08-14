"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ASSESSMENT_SETS } from "@/lib/assessment-data";
import { persistRoadmap } from "@/lib/engine/roadmap";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";

const onboardingSchema = z.object({
  degree: z.string().min(1, "Select your degree"),
  specialization: z.string().optional(),
  year: z.string().min(1, "Select your year"),
  targetRole: z.string().min(1, "Select a target role"),
  weeklyHours: z.coerce.number().int().min(1).max(60),
  interests: z.string(), // JSON array
  industries: z.string(), // JSON array
  skills: z.string(), // JSON of {skillId, rating}[]
});

export async function saveOnboardingAction(_prev: unknown, formData: FormData) {
  const { profile } = await requireStudentProfile();

  const parsed = onboardingSchema.safeParse({
    degree: formData.get("degree"),
    specialization: formData.get("specialization"),
    year: formData.get("year"),
    targetRole: formData.get("targetRole"),
    weeklyHours: formData.get("weeklyHours"),
    interests: formData.get("interests"),
    industries: formData.get("industries"),
    skills: formData.get("skills"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const interests = fromJson<string[]>(data.interests, []);
  const industries = fromJson<string[]>(data.industries, []);
  const skills = fromJson<{ skillId: string; rating: number }[]>(data.skills, []);

  // Store skills
  for (const s of skills) {
    if (!s.skillId) continue;
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: profile.id, skillId: s.skillId } },
      update: { selfRating: s.rating },
      create: { studentId: profile.id, skillId: s.skillId, selfRating: s.rating },
    });
  }

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      degree: data.degree,
      specialization: data.specialization,
      year: data.year,
      targetRole: data.targetRole,
      weeklyHours: data.weeklyHours,
      interests: JSON.stringify(interests),
      preferredIndustries: JSON.stringify(industries),
      onboardedAt: new Date(),
    },
  });

  // Generate the personalized roadmap right after onboarding
  const skillRows = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });
  const weakSkills = skillRows.filter((s) => s.selfRating <= 2).map((s) => s.skill.name);
  await persistRoadmap(
    prisma,
    profile.id,
    {
      degree: data.degree,
      specialization: data.specialization ?? "",
      year: data.year,
      targetRole: data.targetRole,
      interests,
      weeklyHours: data.weeklyHours,
      skills: skillRows.map((s) => ({ name: s.skill.name, rating: s.selfRating })),
      weakSkills,
    },
    12,
    true
  );

  revalidatePath("/app/assessment");
  redirect("/app/assessment?step=quiz");
}

export async function submitAssessmentAction(
  formData: FormData
): Promise<{ ok: true; score: number; maxScore: number; type: string } | { error: string }> {
  const { profile } = await requireStudentProfile();

  const setType = (formData.get("setType") as string) || "TECHNICAL";
  const set = ASSESSMENT_SETS.find((s) => s.type === setType);
  if (!set) return { error: "Unknown assessment" };

  let score = 0;
  const answers: Record<string, number> = {};
  for (const q of set.questions) {
    const val = formData.get(`q_${q.id}`);
    const idx = val === null ? -1 : Number(val);
    answers[q.id] = idx;
    if (idx === q.answer) score++;
  }

  await prisma.assessment.create({
    data: {
      studentId: profile.id,
      type: set.type,
      score,
      maxScore: set.questions.length,
      data: JSON.stringify(answers),
    },
  });

  if (setType === "COMMUNICATION") {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { assessmentComplete: true },
    });
    await snapshotReadiness(prisma, profile.id);
  }

  revalidatePath("/app/assessment");
  return { ok: true, score, maxScore: set.questions.length, type: setType };
}

export async function generateRoadmapAction() {
  const { profile } = await requireStudentProfile();
  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });
  await persistRoadmap(
    prisma,
    profile.id,
    {
      degree: profile.degree ?? "",
      specialization: "",
      year: profile.year ?? "",
      targetRole: profile.targetRole ?? "",
      interests: fromJson<string[]>(profile.interests, []),
      weeklyHours: profile.weeklyHours,
      skills: skills.map((s) => ({ name: s.skill.name, rating: s.selfRating })),
      weakSkills: skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name),
    },
    12,
    true
  );
  revalidatePath("/app/roadmap");
}
