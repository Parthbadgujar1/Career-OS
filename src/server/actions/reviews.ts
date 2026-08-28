"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { reviewResume, reviewProfile, recommendProjects } from "@/lib/ai/reviews";
import { fromJson } from "@/lib/utils";
import { snapshotReadiness } from "@/lib/scoring/readiness";

async function runResumeReview(
  profileId: string,
  role: string,
  resumeText: string,
  resumePdfBase64: string | null,
  resumeId: string
) {
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
  let sectionAnalysis: Array<{ section: string; status: string; note: string }> = [];
  let keywordGaps: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const review = await reviewResume({
        role,
        skills: skills.map((s) => s.skill.name),
        resumeText: resumePdfBase64 ? undefined : resumeText,
        resumePdfBase64: resumePdfBase64 ?? undefined,
        projects: projects.map((p) => `${p.title}: ${p.description ?? ""}`),
      });
      atsScore = review.atsScore;
      summary = review.summary;
      missingSkills = review.missingSkills;
      suggestions = review.suggestions;
      impactStatements = review.impactStatements;
      sectionAnalysis = review.sectionAnalysis ?? [];
      keywordGaps = review.keywordGaps ?? [];
      if (review.extractedText) {
        resumeText = review.extractedText;
      }
    } catch (e) {
      console.error("[reviews] AI resume review failed", e);
    }
  }

  if (missingSkills.length === 0 && suggestions.length === 0) {
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

  await prisma.resume.update({
    where: { id: resumeId },
    data: { content: resumeText, atsScore },
  });

  await prisma.resumeReview.create({
    data: {
      resumeId,
      atsScore,
      missingSkills: JSON.stringify(missingSkills),
      suggestions: JSON.stringify(suggestions),
      impactStatements: JSON.stringify(impactStatements),
    },
  });

  return { atsScore, summary, missingSkills, suggestions, impactStatements, sectionAnalysis, keywordGaps, content: resumeText };
}

export async function reviewResumeAction(
  formData: FormData
): Promise<{ ok: true; atsScore: number; summary: string; content: string; missingSkills: string[]; suggestions: string[]; impactStatements: string[]; sectionAnalysis: Array<{ section: string; status: string; note: string }>; keywordGaps: string[] } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const resumeText = (formData.get("resumeText") as string) || "";
  const role = (formData.get("role") as string) || profile.targetRole || "";

  const file = formData.get("resumeFile") as File | null;
  let base64Data: string | null = null;

  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString("base64");
    } catch (e) {
      console.error("Failed to read uploaded PDF file", e);
      return { error: "Failed to read uploaded PDF file." };
    }
  }

  if (!resumeText && !base64Data) {
    return { error: "Please paste your resume text or upload a PDF file." };
  }

  const version = (await prisma.resume.count({ where: { studentId: profile.id } })) + 1;
  const resume = await prisma.resume.create({
    data: {
      studentId: profile.id,
      version,
      role,
      content: resumeText || "PDF upload processing...",
    },
  });

  const result = await runResumeReview(profile.id, role, resumeText, base64Data, resume.id);

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/reviews");
  return {
    ok: true,
    atsScore: result.atsScore,
    summary: result.summary,
    content: result.content,
    missingSkills: result.missingSkills,
    suggestions: result.suggestions,
    impactStatements: result.impactStatements,
    sectionAnalysis: result.sectionAnalysis,
    keywordGaps: result.keywordGaps,
  };
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

  const result = await runResumeReview(profile.id, role, resumeText, null, resume.id);

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/reviews");
  return { ok: true, atsScore: result.atsScore, summary: result.summary };
}

export async function reviewProfileAction(
  formData: FormData
): Promise<{ ok: true; score: number; summary: string; findings: string[]; suggestions: string[]; sectionAnalysis: Array<{ section: string; status: string; note: string }>; whatToAdd: Array<{ item: string; priority: string; reason: string }> } | { error: string }> {
  const { profile } = await requireStudentProfile();
  const platform = (formData.get("platform") as "LINKEDIN" | "GITHUB") || "LINKEDIN";
  const url = (formData.get("url") as string) || "";
  const details = (formData.get("details") as string) || "";

  let evaluatedDetails = details;

  if (platform === "GITHUB" && url) {
    const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      try {
        const username = match[1];
        const userRes = await fetch(`https://api.github.com/users/${username}`, {
          headers: { "User-Agent": "Career-OS-Agent" }
        });
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
          headers: { "User-Agent": "Career-OS-Agent" }
        });
        if (userRes.ok && repoRes.ok) {
          const userData = await userRes.json();
          interface GitHubRepo {
            name: string;
            description: string | null;
            language: string | null;
            stargazers_count: number;
          }
          const reposData = (await repoRes.json()) as GitHubRepo[];
          evaluatedDetails = `Autofetched GitHub Profile Data:
Username: ${userData.login}
Name: ${userData.name || "N/A"}
Bio: ${userData.bio || "N/A"}
Public Repositories: ${userData.public_repos}
Followers: ${userData.followers} / Following: ${userData.following}

Recent Public Repos:
${reposData.map((r) => `- ${r.name}: ${r.description || "No description"} (Language: ${r.language || "N/A"}, Stars: ${r.stargazers_count})`).join("\n")}

User Entered Details:
${details || "None provided"}`;
        }
      } catch (e) {
        console.error("Failed to autofetch GitHub profile info", e);
      }
    }
  } else if (platform === "LINKEDIN" && url) {
    const skills = await prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true }
    });
    const projects = await prisma.project.findMany({
      where: { studentId: profile.id }
    });
    
    evaluatedDetails = `LinkedIn Profile Review for URL: ${url}
Candidate Target Role: ${profile.targetRole || "Software Developer"}
Readiness Score: ${profile.readinessScore}/100

Skills listed in profile database:
${skills.map(s => `- ${s.skill.name} (${s.selfRating}/5)`).join("\n")}

Projects in database:
${projects.map(p => `- ${p.title}: ${p.description || "No description"}`).join("\n")}

User Entered Details:
${details || "LinkedIn URL provided. Performing positioning evaluation based on target role, skills gaps, and project evidence."}`;
  }

  let score = platform === "LINKEDIN" ? 45 : 50;
  let summary = "";
  let findings: string[] = [];
  let suggestions: string[] = [];
  let sectionAnalysis: Array<{ section: string; status: string; note: string }> = [];
  let whatToAdd: Array<{ item: string; priority: string; reason: string }> = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const review = await reviewProfile({
        platform,
        role: profile.targetRole ?? "",
        url,
        details: evaluatedDetails,
      });
      score = review.score;
      summary = review.summary;
      findings = review.findings;
      suggestions = review.suggestions;
      sectionAnalysis = review.sectionAnalysis ?? [];
      whatToAdd = review.whatToAdd ?? [];
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
  return { ok: true, score, summary, findings, suggestions, sectionAnalysis, whatToAdd };
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

// ── AI-Improved Resume Generation ─────────────────────────────────────────

export async function generateImprovedResumeAction(
  resumeId: string
): Promise<{ ok: true; improvedContent: string; changesSummary: string[] } | { error: string }> {
  const { profile } = await requireStudentProfile();

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { review: true },
  });
  if (!resume || resume.studentId !== profile.id) {
    return { error: "Resume not found" };
  }

  const { generateImprovedResume } = await import("@/lib/ai/reviews");
  const skills = await prisma.studentSkill.findMany({
    where: { studentId: profile.id },
    include: { skill: true },
  });

  const result = await generateImprovedResume({
    currentResume: resume.content ?? "",
    role: resume.role ?? profile.targetRole ?? "",
    skills: skills.map((s) => s.skill.name),
    missingSkills: resume.review ? JSON.parse(resume.review.missingSkills as string) as string[] : [],
    suggestions: resume.review ? JSON.parse(resume.review.suggestions as string) as string[] : [],
    impactStatements: resume.review ? JSON.parse(resume.review.impactStatements as string) as string[] : [],
    keywordGaps: [],
  });

  return { ok: true, improvedContent: result.improvedContent, changesSummary: result.changesSummary };
}

// ── AI-Improved Profile Generation ────────────────────────────────────────

export async function generateImprovedProfileAction(
  platform: "LINKEDIN" | "GITHUB"
): Promise<{ ok: true; headline: string; about: string; skillsToAdd: string[]; projectsSection: string; readmeContent: string; changesSummary: string[] } | { error: string }> {
  const { profile } = await requireStudentProfile();

  const latestReview = await prisma.profileReview.findFirst({
    where: { studentId: profile.id, platform },
    orderBy: { createdAt: "desc" },
  });

  const { generateImprovedProfile } = await import("@/lib/ai/reviews");

  const url = platform === "LINKEDIN" ? profile.linkedinUrl : profile.githubUrl;

  const result = await generateImprovedProfile({
    platform,
    role: profile.targetRole ?? "",
    currentDetails: url || `${platform} profile for ${profile.targetRole || "student"}`,
    suggestions: latestReview ? JSON.parse(latestReview.suggestions as string) as string[] : [],
    sectionAnalysis: [],
    whatToAdd: [],
  });

  return {
    ok: true,
    headline: result.headline,
    about: result.about,
    skillsToAdd: result.skillsToAdd,
    projectsSection: result.projectsSection,
    readmeContent: result.readmeContent,
    changesSummary: result.changesSummary,
  };
}
