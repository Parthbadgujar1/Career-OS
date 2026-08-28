"use server";

import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { suggestOpportunities } from "@/lib/ai/opportunities";

export async function getOpportunitySuggestionsAction() {
  const { profile } = await requireStudentProfile();

  const [skills, actions, projects, resumes] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
    }),
    prisma.opportunityAction.findMany({ where: { studentId: profile.id } }),
    prisma.project.findMany({ where: { studentId: profile.id } }),
    prisma.resume.findMany({ where: { studentId: profile.id } }),
  ]);

  const result = await suggestOpportunities({
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    targetRole: profile.targetRole ?? "",
    year: profile.year ?? "",
    skills: skills.map((s) => s.skill.name),
    weakSkills: skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name),
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    projectsCount: projects.length,
    applicationsCount: actions.filter((a) => a.action === "APPLIED").length,
    resumeCount: resumes.length,
  });

  return result;
}
