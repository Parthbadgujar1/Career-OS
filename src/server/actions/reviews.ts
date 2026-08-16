"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { reviewResume, reviewProfile, recommendProjects } from "@/lib/ai/reviews";
import { fromJson } from "@/lib/utils";
import { snapshotReadiness } from "@/lib/scoring/readiness";

async function runResumeReview(profileId: string, role: string, resumeText: string, resumeId: string) {
  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profileId },
    include: { skill: true },
  });
  const projects = await prisma.project.findMany({
    where: { studentId: profileId, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
  });

  let atsScore = 50;
  let summary = "Deterministic review: resume length and role keywords checked.";
  let missingSkills: string[] = [];
  let suggestions: string[] = [];
  let impactStatements: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const review = await reviewResume({
        role,
        skills: skills.map((s) => s.skill.name),
        resumeText,
        projects: projects.map((p) => `${p.title}: ${p.description ?? ""}`),
      });
      atsScore = review.atsScore;
      summary = review.summary;
      missingSkills = review.missingSkills;
      suggestions = review.suggestions;
      impactStatements = review.impactStatements;
    } catch (e) {
      console.error("[reviews] AI resume review failed", e);
    }
  }

  if (missingSkills.length === 0 && suggestions.length === 0) {
    // Deterministic fallback scoring
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    let score = 40;
    if (wordCount > 200) score += 20;
    if (wordCount > 400) score += 10;
    if (role && resumeText.toLowerCase().includes("experience")) score += 10;
    atsScore = Math.min(100, score);
    suggestions = wordCount < 300
      ? ["Add a professional summary at the top", "Include quantifiable achievements", "Add your projects with links"]
      : ["Add keywords from the target role job description", "Quantify impact with numbers", "Keep it to one page for campus roles"];
  }

  await prisma.resumeReview.create({
    data: {
      resumeId,
      atsScore,
      missingSkills: JSON.stringify(missingSkills),
      suggestions: JSON.stringify(suggestions),
      impactStatements: JSON.stringify(impactStatements),
    },
  });

  return { atsScore, summary };
}

export async function reviewResumeAction(
  formData: FormData
): Promise<{ ok: true; atsScore: number; summary: string } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const resumeText = (formData.get("resumeText") as string) || "";
  const role = (formData.get("role") as string) || profile.targetRole || "";

  const version = (await prisma.resume.count({ where: { studentId: profile.id } })) + 1;
  const resume = await prisma.resume.create({
    data: {
      studentId: profile.id,
      version,
      role,
      content: resumeText,
    },
  });

  const { atsScore, summary } = await runResumeReview(profile.id, role, resumeText, resume.id);

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/reviews");
  return { ok: true, atsScore, summary };
}

export async function buildResumeAction(
  formData: FormData
): Promise<{ ok: true; atsScore: number; summary: string } | { error: string }> {
  const { user, profile } = await requireStudentProfile();
  const role = (formData.get("role") as string) || profile.targetRole || "";
  const summary = (formData.get("summary") as string) || "";
  const education = (formData.get("education") as string) || "";
  const projects = (formData.get("projects") as string) || "";
  const skills = (formData.get("skills") as string) || "";
  const achievements = (formData.get("achievements") as string) || "";

  if (!summary && !education && !projects && !skills) {
    return { error: "Fill at least one section to build your resume." };
  }

  const sections: string[] = [];
  if (role) sections.push(`# ${user.name ?? "Your Name"}\nTarget role: ${role}`);
  if (summary) sections.push(`## Summary\n${summary}`);
  if (education) sections.push(`## Education\n${education}`);
  if (skills) sections.push(`## Skills\n${skills}`);
  if (projects) sections.push(`## Projects\n${projects}`);
  if (achievements) sections.push(`## Achievements\n${achievements}`);
  const resumeText = sections.join("\n\n");

  const version = (await prisma.resume.count({ where: { studentId: profile.id } })) + 1;
  const resume = await prisma.resume.create({
    data: {
      studentId: profile.id,
      version,
      role,
      content: resumeText,
    },
  });

  const result = await runResumeReview(profile.id, role, resumeText, resume.id);

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/reviews");
  return { ok: true, atsScore: result.atsScore, summary: result.summary };
}

export async function reviewProfileAction(
  formData: FormData
): Promise<{ ok: true; score: number } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const platform = (formData.get("platform") as "LINKEDIN" | "GITHUB") || "LINKEDIN";
  const url = (formData.get("url") as string) || "";
  const details = (formData.get("details") as string) || "";

  let score = platform === "LINKEDIN" ? 45 : 50;
  let findings: string[] = [];
  let suggestions: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const review = await reviewProfile({
        platform,
        role: profile.targetRole ?? "",
        url,
        details,
      });
      score = review.score;
      findings = review.findings;
      suggestions = review.suggestions;
    } catch (e) {
      console.error("[reviews] AI profile review failed", e);
    }
  }

  if (suggestions.length === 0) {
    suggestions = platform === "LINKEDIN"
      ? ["Write a role-focused headline", "Complete your About section", "List skills relevant to your target role"]
      : ["Add a README to each repo", "Increase commit activity", "Pin your best projects"];
  }

  await prisma.profileReview.create({
    data: {
      studentId: profile.id,
      platform,
      url,
      score,
      findings: JSON.stringify(findings),
      suggestions: JSON.stringify(suggestions),
    },
  });

  if (platform === "LINKEDIN") {
    await prisma.studentProfile.update({ where: { id: profile.id }, data: { linkedinUrl: url } });
  } else {
    await prisma.studentProfile.update({ where: { id: profile.id }, data: { githubUrl: url } });
  }

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/reviews");
  return { ok: true, score };
}

export async function recommendProjectsAction(): Promise<{ ok: true; count: number } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });
  const skillNames = skills.map((s) => s.skill.name);
  const weak = skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name);

  const projects = await recommendProjects({
    role: profile.targetRole ?? "",
    skills: skillNames,
    weakSkills: weak,
  });

  // Regenerate: replace previous suggested (un-started) recommendations so
  // repeated clicks never accumulate duplicates.
  await prisma.projectRecommendation.deleteMany({
    where: { studentId: profile.id, status: "SUGGESTED" },
  });

  let count = 0;
  for (const p of projects.projects) {
    const alreadyStarted = await prisma.projectRecommendation.findFirst({
      where: { studentId: profile.id, title: p.title, status: { in: ["STARTED", "COMPLETED"] } },
    });
    if (alreadyStarted) continue;
    await prisma.projectRecommendation.create({
      data: {
        studentId: profile.id,
        title: p.title,
        description: p.description,
        skillGaps: JSON.stringify(p.skillGaps),
        milestones: JSON.stringify(p.milestones),
      },
    });
    count++;
  }
  revalidatePath("/app/projects");
  return { ok: true, count };
}

export async function createProjectAction(formData: FormData) {
  const { profile } = await requireStudentProfile();
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const techStack = fromJson<string[]>(formData.get("techStack") as string, []);

  await prisma.project.create({
    data: { studentId: profile.id, title, description, techStack: JSON.stringify(techStack) },
  });
  revalidatePath("/app/projects");
  return { ok: true };
}

export async function updateProjectStatusAction(projectId: string, status: string) {
  const { profile } = await requireStudentProfile();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.studentId !== profile.id) {
    return;
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/projects");
}

export async function startRecommendedProjectAction(recommendationId: string) {
  const { profile } = await requireStudentProfile();
  const rec = await prisma.projectRecommendation.findFirst({
    where: { id: recommendationId, studentId: profile.id },
  });
  if (!rec) return;

  await prisma.project.create({
    data: {
      studentId: profile.id,
      title: rec.title,
      description: rec.description,
      techStack: JSON.stringify(fromJson<string[]>(rec.skillGaps, [])),
    },
  });
  await prisma.projectRecommendation.update({ where: { id: rec.id }, data: { status: "STARTED" } });
  revalidatePath("/app/projects");
}
