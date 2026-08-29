"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ASSESSMENT_SETS, getAssessmentSetsForProfile } from "@/lib/assessment-data";
import { gradeSkillsFromAssessments } from "@/lib/assessment-grading";
import { persistRoadmap } from "@/lib/engine/roadmap";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { scheduleNextProgressTest } from "@/lib/engine/tests";
import { fromJson } from "@/lib/utils";

const onboardingSchema = z.object({
  degree: z.string().min(1, "Select your degree"),
  specialization: z.string().optional(),
  year: z.string().min(1, "Select your year"),
  currentlyPursuing: z.string().optional(),
  targetRoles: z.string(), // JSON array of roles
  dailyHours: z.coerce.number().int().min(1).max(24),
  interests: z.string(), // JSON array
  industries: z.string(), // JSON array
});

export async function saveOnboardingAction(_prev: unknown, formData: FormData) {
  const { profile } = await requireStudentProfile();

  const parsed = onboardingSchema.safeParse({
    degree: formData.get("degree"),
    specialization: formData.get("specialization"),
    year: formData.get("year"),
    currentlyPursuing: formData.get("currentlyPursuing"),
    targetRoles: formData.get("targetRoles"),
    dailyHours: formData.get("dailyHours"),
    interests: formData.get("interests"),
    industries: formData.get("industries"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const interests = fromJson<string[]>(data.interests, []);
  const industries = fromJson<string[]>(data.industries, []);
  const targetRoles = fromJson<string[]>(data.targetRoles, []);
  if (targetRoles.length === 0) {
    return { error: "Select at least one target role" };
  }
  const weeklyHours = Math.min(60, data.dailyHours * 7);
  const dailyHours = data.dailyHours;

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      degree: data.degree,
      specialization: data.specialization,
      year: data.year,
      currentlyPursuing: data.currentlyPursuing,
      targetRole: targetRoles[0] || profile.targetRole,
      targetRoles: JSON.stringify(targetRoles),
      dailyHours,
      weeklyHours,
      interests: JSON.stringify(interests),
      preferredIndustries: JSON.stringify(industries),
      onboardedAt: new Date(),
    },
  });

  // Skills are graded by the AI assessment, not self-rated. Clear previous
  // ratings and assessments so grading always reflects the current path.
  await prisma.studentSkill.deleteMany({ where: { studentId: profile.id } });
  await prisma.assessment.deleteMany({ where: { studentId: profile.id } });
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { assessmentComplete: false },
  });

  // Starter roadmap from profile alone — replaced with a graded-skill version
  // once the AI skill assessment is complete.
  await persistRoadmap(
    prisma,
    profile.id,
    {
      degree: data.degree,
      specialization: data.specialization ?? "",
      year: data.year,
      targetRole: targetRoles[0] || profile.targetRole || "Career Seeker",
      interests,
      weeklyHours,
      skills: [],
      weakSkills: [],
    },
    12,
    true
  );

  revalidatePath("/app/assessment");
  redirect("/app/assessment");
}

export async function submitAssessmentAction(
  formData: FormData
): Promise<{ ok: true; score: number; maxScore: number; type: string; graded?: boolean } | { error: string }> {
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

  // Grade skills 1-5 directly from test performance (all tests taken so far)
  await gradeSkillsFromAssessments(prisma, profile.id);

  // Check if all assessments for this student's profile are now complete
  const requiredSets = getAssessmentSetsForProfile(profile.degree);
  const taken = await prisma.assessment.findMany({ where: { studentId: profile.id } });
  const takenTypes = new Set(taken.map((a) => a.type));
  const allComplete = requiredSets.every((s) => takenTypes.has(s.type));
  let graded = false;
  if (allComplete) {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { assessmentComplete: true },
    });
    // Rebuild the roadmap from the graded skills and lock in readiness
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
      true
    );
    await scheduleNextProgressTest(prisma, profile.id);
    await snapshotReadiness(prisma, profile.id);
    graded = true;
  }

  revalidatePath("/app/assessment");
  return { ok: true, score, maxScore: set.questions.length, type: setType, graded };
}

export async function generateRoadmapAction(formData: FormData) {
  const { profile } = await requireStudentProfile();
  const durationWeeks = Math.max(4, Number(formData.get("durationWeeks")) || 12);
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
    durationWeeks,
    true
  );
  await scheduleNextProgressTest(prisma, profile.id);
  revalidatePath("/app/roadmap");
}

export async function changePathAction() {
  const { profile } = await requireStudentProfile();
  // Soft reset: the old roadmap and profile stay visible until the student
  // saves the wizard (which clears ratings/assessments and regenerates).
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      onboardedAt: null,
      assessmentComplete: false,
    },
  });
  revalidatePath("/app");
  redirect("/app/assessment?step=onboard");
}

export async function cancelPathChangeAction() {
  const { profile } = await requireStudentProfile();
  // Restore onboarded status — old degree/role/roadmap were never removed,
  // so the dashboard is fully usable again.
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { onboardedAt: new Date() },
  });
  revalidatePath("/app");
  revalidatePath("/app/assessment");
  redirect("/app");
}
