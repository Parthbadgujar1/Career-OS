"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { suggestProjectDetails } from "@/lib/ai/opportunities";

const MAX_TITLE_CHARS = 120;
const MAX_DESC_CHARS = 2_000;

function capped(
  title: string,
  description: string
): { title: string; description: string } {
  return { title: (title || "").slice(0, MAX_TITLE_CHARS), description: (description || "").slice(0, MAX_DESC_CHARS) };
}

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

  const { title: cTitle, description: cDescription } = capped(title, description);
  if (!cTitle.trim()) return { error: "Project title is required." };

  const result = await suggestProjectDetails({
    title: cTitle,
    description: cDescription,
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole ?? "",
    existingSkills: skills.map((s) => s.skill.name),
  });

  return result;
}

export async function createProjectWithAIAction(formData: FormData) {
  const { profile } = await requireStudentProfile();
  const { title, description } = capped(
    (formData.get("title") as string) || "",
    (formData.get("description") as string) || ""
  );
  const techStackRaw = (formData.get("techStack") as string) || "";
  const resumeBlurb = ((formData.get("resumeBlurb") as string) || "").slice(0, 500);

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
