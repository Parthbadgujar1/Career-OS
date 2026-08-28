"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { suggestProjectDetails } from "@/lib/ai/opportunities";

export async function suggestProjectDetailsAction(
  title: string,
  description: string
): Promise<{
  suggestedTechStack: string[];
  description: string;
  features: string[];
  improvements: string[];
  resumeBlurb: string;
} | { error: string }> {
  const { profile } = await requireStudentProfile();

  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });

  const result = await suggestProjectDetails({
    title,
    description,
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole ?? "",
    existingSkills: skills.map((s) => s.skill.name),
  });

  return result;
}

export async function createProjectWithAIAction(formData: FormData) {
  const { profile } = await requireStudentProfile();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const techStackRaw = (formData.get("techStack") as string) || "";
  const resumeBlurb = (formData.get("resumeBlurb") as string) || "";

  const techStack = techStackRaw
    ? techStackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!title) {
    return { error: "Project title is required" };
  }

  await prisma.project.create({
    data: {
      studentId: profile.id,
      title,
      description,
      techStack: JSON.stringify(techStack),
      evidence: resumeBlurb || null,
    },
  });

  revalidatePath("/app/projects");
  return { ok: true };
}

export async function aiEnhanceProjectAction(projectId: string) {
  const { profile } = await requireStudentProfile();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.studentId !== profile.id) {
    return { error: "Project not found" };
  }

  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });

  const result = await suggestProjectDetails({
    title: project.title,
    description: project.description ?? "",
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole ?? "",
    existingSkills: skills.map((s) => s.skill.name),
  });

  return { ok: true as const, ...result };
}
