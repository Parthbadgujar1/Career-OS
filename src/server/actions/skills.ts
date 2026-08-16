"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { snapshotReadiness } from "@/lib/scoring/readiness";

export async function addStudentSkillAction(skillId: string, rating: number) {
  const { profile } = await requireStudentProfile();
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) return;

  await prisma.studentSkill.upsert({
    where: { studentId_skillId: { studentId: profile.id, skillId } },
    create: { studentId: profile.id, skillId, selfRating: Math.max(1, Math.min(5, rating)) },
    update: { selfRating: Math.max(1, Math.min(5, rating)) },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/skills");
}

export async function updateStudentSkillRatingAction(skillId: string, rating: number) {
  const { profile } = await requireStudentProfile();

  await prisma.studentSkill.upsert({
    where: { studentId_skillId: { studentId: profile.id, skillId } },
    create: { studentId: profile.id, skillId, selfRating: Math.max(1, Math.min(5, rating)) },
    update: { selfRating: Math.max(1, Math.min(5, rating)) },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/skills");
}
