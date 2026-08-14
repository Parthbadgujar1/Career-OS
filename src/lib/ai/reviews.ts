import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

const resumeReviewSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  summary: z.string(),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  impactStatements: z.array(z.string()),
});

const profileReviewSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string(),
  findings: z.array(z.string()),
  suggestions: z.array(z.string()),
});

const projectRecommendationsSchema = z.object({
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      skillGaps: z.array(z.string()),
      milestones: z.array(z.string()),
    })
  ),
});

export interface ResumeReviewInput {
  role: string;
  skills: string[];
  resumeText: string;
  projects: string[];
}

export async function reviewResume(input: ResumeReviewInput) {
  const { object } = await generateObject({
    model: getModel(),
    schema: resumeReviewSchema,
    schemaName: "resume_review",
    schemaDescription: "ATS-oriented resume review",
    prompt: `You are an ATS resume reviewer. Review the resume below for a "${input.role}" role.

TARGET ROLE: ${input.role}
STUDENT'S SKILLS: ${input.skills.join(", ") || "not provided"}
PROJECTS: ${input.projects.join(", ") || "none listed"}
RESUME CONTENT:
"""${input.resumeText || "(empty resume)"}"""

Score it for ATS-friendliness and impact (0-100). Return:
- atsScore: 0-100
- summary: 2-3 sentence overall assessment
- missingSkills: up to 6 skills that should be added for the target role
- suggestions: up to 8 specific, actionable resume fixes (structure, keywords, impact statements, sections)
- impactStatements: up to 4 example rewritten bullet points that quantify achievements`,
  });

  return object;
}

export interface ProfileReviewInput {
  platform: "LINKEDIN" | "GITHUB";
  role: string;
  url: string;
  details: string;
}

export async function reviewProfile(input: ProfileReviewInput) {
  const isLinkedIn = input.platform === "LINKEDIN";
  const { object } = await generateObject({
    model: getModel(),
    schema: profileReviewSchema,
    schemaName: "profile_review",
    schemaDescription: `${isLinkedIn ? "LinkedIn" : "GitHub"} profile review`,
    prompt: `You are a career profile coach. Review this ${isLinkedIn ? "LinkedIn" : "GitHub"} profile for a "${input.role}" candidate.

PROFILE URL: ${input.url || "not provided"}
PROFILE DETAILS FROM THE STUDENT:
"""${input.details || "(no details provided)"}"""

Score 0-100 for completeness, positioning and appeal to recruiters. Return:
- score: 0-100
- summary: 2-3 sentences
- findings: up to 6 strengths and gaps found
- suggestions: up to 8 specific improvement actions (headline, about, skills, projects, README, activity)`,
  });

  return object;
}

export interface ProjectRecommendationInput {
  role: string;
  skills: string[];
  weakSkills: string[];
}

export async function recommendProjects(input: ProjectRecommendationInput) {
  const { object } = await generateObject({
    model: getModel(),
    schema: projectRecommendationsSchema,
    schemaName: "project_recommendations",
    schemaDescription: "Skill-gap-driven project recommendations",
    prompt: `You are the Career OS project engine. Recommend 3 portfolio projects for a student targeting "${input.role}".

CURRENT SKILLS: ${input.skills.join(", ") || "none"}
WEAK SKILLS TO PRACTICE: ${input.weakSkills.join(", ") || "none"}

RULES:
1. Each project must force practice of the weak skills while matching the target role.
2. Order from simplest to most impressive (beginner → intermediate).
3. Projects must be buildable solo by a student in 1-3 weeks.
4. For each project return title, 2-3 sentence description, skillGaps (skills it builds), and milestones (3-5 steps to complete it).`,
  });

  return object;
}
