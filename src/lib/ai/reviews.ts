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
  extractedText: z.string().describe("Clean plain text representation of the resume content, formatted neatly."),
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
  resumeText?: string;
  resumePdfBase64?: string;
  projects: string[];
}

export async function reviewResume(input: ResumeReviewInput) {
  const contentParts: Array<{ type: "text"; text: string } | { type: "file"; data: string; mimeType: string }> = [
    {
      type: "text",
      text: `You are an ATS resume reviewer and career coach. Review the resume below for a "${input.role}" role.

TARGET ROLE: ${input.role}
STUDENT'S SKILLS: ${input.skills.join(", ") || "not provided"}
PROJECTS: ${input.projects.join(", ") || "none listed"}

Score it for ATS-friendliness and impact (0-100) and perform formatting analysis. Return:
- atsScore: 0-100
- summary: 2-3 sentence overall assessment
- missingSkills: up to 6 skills that should be added for the target role
- suggestions: up to 8 specific, actionable resume fixes (structure, keywords, impact statements, sections)
- impactStatements: up to 4 example rewritten bullet points that quantify achievements
- extractedText: The neat, clean plain text content of the entire resume.`,
    }
  ];

  if (input.resumePdfBase64) {
    contentParts.push({
      type: "file",
      data: input.resumePdfBase64,
      mimeType: "application/pdf",
    });
  } else {
    contentParts.push({
      type: "text",
      text: `RESUME CONTENT:\n"""${input.resumeText || "(empty resume)"}"""`,
    });
  }

  const { object } = await generateObject({
    model: getModel(),
    schema: resumeReviewSchema,
    schemaName: "resume_review",
    schemaDescription: "ATS-oriented resume review",
    messages: [
      {
        role: "user",
        content: contentParts as unknown as string,
      },
    ],
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
  let projects: Array<{
    title: string;
    description: string;
    skillGaps: string[];
    milestones: string[];
  }> = [];

  if (process.env.GEMINI_API_KEY) {
    try {
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
      projects = object.projects;
    } catch (e) {
      console.error("[recommendProjects] AI generation failed, using fallback", e);
    }
  }

  if (projects.length === 0) {
    // Deterministic fallback recommendations based on role and weak skills
    const role = input.role.toLowerCase();
    const weak = input.weakSkills.map((s) => s.toLowerCase());

    const fallbackProjects: Record<string, typeof projects> = {
      "software developer": [
        {
          title: "Task Manager REST API",
          description: "Build a REST API with JWT authentication, CRUD operations, and comprehensive tests. A staple backend portfolio piece.",
          skillGaps: [...weak, "SQL", "Node.js", "Testing"],
          milestones: [
            "Set up Express + TypeScript project with Prisma",
            "Design database schema for users, tasks",
            "Implement JWT auth (register, login, middleware)",
            "Build CRUD endpoints for tasks",
            "Write unit/integration tests with Jest",
            "Deploy to Railway/Render",
          ],
        },
        {
          title: "Full-Stack Notes App",
          description: "Build a notes app with authentication, real-time sync, and offline support. Demonstrates end-to-end full-stack skills.",
          skillGaps: [...weak, "React", "TypeScript", "WebSockets"],
          milestones: [
            "Set up Next.js + Prisma + PostgreSQL",
            "Implement authentication with NextAuth",
            "Build notes CRUD with optimistic updates",
            "Add real-time sync with Socket.io",
            "Implement offline support with IndexedDB",
            "Deploy to Vercel + Railway",
          ],
        },
        {
          title: "Code Snippet Manager",
          description: "VS Code extension + web dashboard for managing code snippets. Shows tooling and cross-platform skills.",
          skillGaps: [...weak, "TypeScript", "VS Code API", "Electron"],
          milestones: [
            "Build VS Code extension with snippet storage",
            "Create React web dashboard",
            "Sync extension ↔ web via API",
            "Add syntax highlighting and tagging",
            "Package and publish extension",
          ],
        },
      ],
      "data analyst": [
        {
          title: "Sales Data Analysis Dashboard",
          description: "Clean a sales dataset, run SQL + Python analysis, and present insights in an interactive dashboard.",
          skillGaps: [...weak, "SQL", "Python", "pandas", "Visualization"],
          milestones: [
            "Obtain and clean sales dataset (Kaggle)",
            "Run exploratory SQL analysis (JOINs, window functions)",
            "Build Python/pandas analysis notebook",
            "Create interactive dashboard with Plotly/Streamlit",
            "Write findings report with visualizations",
          ],
        },
        {
          title: "Customer Churn Analysis",
          description: "Analyze churn with pandas + statistics, build a logistic regression model, and write a findings report.",
          skillGaps: [...weak, "Statistics", "Scikit-learn", "Python"],
          milestones: [
            "Load and explore churn dataset",
            "Feature engineering for churn prediction",
            "Train logistic regression model",
            "Evaluate with precision/recall/ROC-AUC",
            "Create executive summary dashboard",
          ],
        },
      ],
      "ai/ml engineer": [
        {
          title: "End-to-End ML Pipeline",
          description: "Train a classifier on a real dataset, tune it, evaluate, and wrap it in a simple API.",
          skillGaps: [...weak, "Python", "Scikit-learn", "FastAPI", "Docker"],
          milestones: [
            "Select dataset (UCI/Kaggle) and define problem",
            "Build preprocessing pipeline",
            "Train and tune multiple models",
            "Build FastAPI inference endpoint",
            "Containerize with Docker",
          ],
        },
        {
          title: "Computer Vision Project",
          description: "Build an image classifier, document it, and push to GitHub with a clean README.",
          skillGaps: [...weak, "PyTorch", "CNN", "Data Augmentation"],
          milestones: [
            "Choose dataset (CIFAR-10, Flowers, custom)",
            "Implement CNN with PyTorch",
            "Add data augmentation and regularization",
            "Train, evaluate, and visualize results",
            "Create GitHub repo with model card",
          ],
        },
      ],
      "frontend developer": [
        {
          title: "Responsive Landing Page",
          description: "Build a pixel-perfect responsive landing page from a design brief.",
          skillGaps: [...weak, "HTML", "CSS", "Tailwind", "Responsive Design"],
          milestones: [
            "Convert Figma/design to HTML + Tailwind",
            "Implement responsive breakpoints",
            "Add animations and micro-interactions",
            "Optimize for Lighthouse 90+",
            "Deploy to Vercel/Netlify",
          ],
        },
        {
          title: "React App with External API",
          description: "Build a React app (e.g., a movie or weather app) that fetches and displays data from a public API.",
          skillGaps: [...weak, "React", "TypeScript", "API Integration", "State Management"],
          milestones: [
            "Set up React + TypeScript + Vite",
            "Integrate public API (TMDB, OpenWeather, etc.)",
            "Implement search, filtering, pagination",
            "Add error boundaries and loading states",
            "Deploy to Vercel",
          ],
        },
        {
          title: "Full Portfolio Website",
          description: "Your developer portfolio site showcasing all your work.",
          skillGaps: [...weak, "Next.js", "MDX", "Contentlayer", "SEO"],
          milestones: [
            "Design portfolio structure and content",
            "Build with Next.js + MDX for blog/projects",
            "Add dark mode and animations",
            "Optimize SEO and performance",
            "Deploy to Vercel with custom domain",
          ],
        },
      ],
    };

    const key = Object.keys(fallbackProjects).find((k) => role.includes(k)) || "software developer";
    projects = fallbackProjects[key];
  }

  return { projects };
}
