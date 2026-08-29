import "server-only";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { generateWithFailover } from "@/lib/ai/client";

// ── AI-Powered Opportunity Suggestions ────────────────────────────────────

export interface PlatformSuggestion {
  platform: string;
  url: string;
  category: "INTERNSHIP" | "HACKATHON" | "QUIZ" | "CERTIFICATION" | "COMPETITION" | "OPEN_SOURCE" | "FREELANCE";
  description: string;
  whyRelevant: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedTime: string;
  isFree: boolean;
}

export interface OpportunitySuggestionResult {
  internships: PlatformSuggestion[];
  hackathons: PlatformSuggestion[];
  quizzes: PlatformSuggestion[];
  certifications: PlatformSuggestion[];
  openSource: PlatformSuggestion[];
  competitions: PlatformSuggestion[];
  summary: string;
}

/**
 * Generate AI-powered platform suggestions based on student profile.
 * Instead of listing static opportunities, suggest WHERE to look.
 */
export async function suggestOpportunities(profile: {
  degree: string;
  specialization: string;
  targetRole: string;
  year: string;
  skills: string[];
  weakSkills: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  projectsCount: number;
}): Promise<OpportunitySuggestionResult> {
  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: z.object({
          internships: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          hackathons: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          quizzes: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          certifications: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          openSource: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          competitions: z.array(
            z.object({
              platform: z.string(),
              url: z.string(),
              category: z.enum(["INTERNSHIP", "HACKATHON", "QUIZ", "CERTIFICATION", "COMPETITION", "OPEN_SOURCE", "FREELANCE"]),
              description: z.string(),
              whyRelevant: z.string(),
              difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
              estimatedTime: z.string(),
              isFree: z.boolean(),
            })
          ),
          summary: z.string(),
        }),
        prompt: `You are a career opportunity advisor for Indian college students. Based on the student's profile, suggest SPECIFIC platforms and websites where they should actively look for opportunities.

Student Profile:
- Degree: ${profile.degree}
- Specialization: ${profile.specialization}
- Target Role: ${profile.targetRole}
- Year: ${profile.year}
- Skills: ${profile.skills.join(", ") || "None yet"}
- Weak Skills: ${profile.weakSkills.join(", ") || "None identified"}
- GitHub: ${profile.githubUrl || "Not linked"}
- LinkedIn: ${profile.linkedinUrl || "Not linked"}
- Projects: ${profile.projectsCount}

For each category, suggest 3-5 SPECIFIC platforms with real URLs:

INTERNSHIPS: Focus on platforms like Internshala, LinkedIn Jobs, Naukri, AngelList/Wellfound, Unstop, company career pages. Suggest specific search filters for their role.
HACKATHONS: Suggest Unstop, Devfolio, MLH, HackerEarth, specific company hackathons. Match to their skill level.
QUIZ/CODING PRACTICE: Suggest GeeksforGeeks, HackerRank, LeetCode, CodeChef, etc. based on their weak skills.
CERTIFICATIONS: Suggest free certifications from Google, Microsoft, AWS, Coursera, freeCodeCamp, etc. relevant to their target role.
OPEN SOURCE: Suggest GitHub trending, Google Summer of Code, Apache projects, specific repos matching their skills.
COMPETITIONS: Suggest Kaggle, coding competitions, case competitions for their domain.

The summary should be a motivational 2-3 sentence overview.`,
        temperature: 0.6,
      }),
    "OPPORTUNITY_SUGGESTIONS",
  );
  return object;
}

/**
 * Generate AI suggestions for improving a project's tech stack and details.
 */
export async function suggestProjectDetails(input: {
  title: string;
  description: string;
  degree: string;
  specialization: string;
  targetRole: string;
  existingSkills: string[];
}): Promise<{
  suggestedTechStack: string[];
  description: string;
  features: string[];
  improvements: string[];
  resumeBlurb: string;
}> {
  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: z.object({
          suggestedTechStack: z.array(z.string()),
          description: z.string(),
          features: z.array(z.string()),
          improvements: z.array(z.string()),
          resumeBlurb: z.string(),
        }),
        prompt: `You are a project advisor for a ${input.degree} student specializing in ${input.specialization}, targeting the role of ${input.targetRole}.

The student has this project idea:
Title: ${input.title}
Description: ${input.description || "No description provided yet"}
Their known skills: ${input.existingSkills.join(", ") || "None yet"}

Provide:
1. suggestedTechStack: Recommend 4-8 technologies that are industry-standard for this type of project AND match their skill level. Include a mix of frontend, backend, database, and deployment tools where relevant.
2. description: A polished 2-3 sentence project description they can use on their resume/LinkedIn.
3. features: 4-6 key features they should implement to make the project impressive.
4. improvements: 3-5 ways to make the project stand out (e.g., add tests, CI/CD, Docker, documentation, live demo).
5. resumeBlurb: A one-line resume bullet point that quantifies impact and uses action verbs.

Keep suggestions practical for a college student. Prefer popular, well-documented technologies.`,
        temperature: 0.5,
      }),
    "PROJECT_SUGGESTIONS",
  );
  return object;
}
