import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { generateRoadmap, generateLongTermPlan, type RoadmapInput } from "@/lib/ai/roadmap";
import { getCareerProfile } from "@/lib/careers";

export type MilestoneCategory = "LEARNING" | "CODING" | "PROJECT" | "PROFILE" | "INTERVIEW" | "OPPORTUNITY";

export interface Milestone {
  week: number;
  title: string;
  description: string;
  category: MilestoneCategory;
  relevance?: string;
}

interface RoleTemplate {
  track: string[];
  codingTopics: string[];
  projects: { title: string; description: string; startWeek: number; endWeek: number }[];
  profileWork: string[];
}

// Deterministic fallback templates per role family (used when no AI key, and as a safety net)
const TEMPLATES: Record<string, RoleTemplate> = {
  "Data Analyst": {
    track: [
      "Excel basics & data cleaning",
      "SQL fundamentals (SELECT, JOIN, GROUP BY)",
      "SQL advanced (window functions, CTEs)",
      "Python for data (pandas, numpy)",
      "Statistics fundamentals (mean, variance, distributions)",
      "Data visualization (Matplotlib, Seaborn, Tableau)",
      "Probability & hypothesis testing",
      "Power BI / dashboarding",
      "Intro to machine learning (regression, classification)",
      "Feature engineering & model evaluation",
      "Business metrics & KPI dashboards",
      "Portfolio finalization & case-study prep",
    ],
    codingTopics: ["SQL queries", "Pandas exercises", "Python logic", "SQL window functions", "NumPy arrays", "Python logic", "Statistics problems", "SQL joins", "Python logic", "Machine learning basics", "SQL case study", "Python logic"],
    projects: [
      { title: "Sales Data Analysis Dashboard", description: "Clean a sales dataset, run SQL + Python analysis, and present insights in a dashboard. Builds SQL, pandas, and visualization in one shot.", startWeek: 3, endWeek: 5 },
      { title: "Customer Churn Analysis", description: "Analyze churn with pandas + statistics, build a simple logistic regression model, and write a findings report.", startWeek: 7, endWeek: 10 },
    ],
    profileWork: [
      "Create/optimize LinkedIn headline around data analytics",
      "Write GitHub README for your analysis repos",
      "Update resume with the completed dashboard project",
    ],
  },
  "Software Developer": {
    track: [
      "Programming fundamentals & problem solving",
      "Data structures: arrays, strings, hash maps",
      "Data structures: linked lists, stacks, queues",
      "Data structures: trees & graphs",
      "Algorithms: sorting, searching, two pointers",
      "Algorithms: recursion, backtracking",
      "OOP concepts (Java/Python/C++)",
      "Database basics: SQL + ORMs",
      "Web fundamentals: HTTP, REST, APIs",
      "System design basics for interviews",
      "Dynamic programming essentials",
      "Full revision + mock interview rounds",
    ],
    codingTopics: ["Arrays", "Strings", "Hash maps", "Linked lists", "Stacks & queues", "Trees", "Graphs", "Sorting", "Recursion", "Dynamic programming", "Sliding window", "Mixed DSA"],
    projects: [
      { title: "Full-Stack CRUD Web App", description: "Build a note-keeping or task app with a backend API, database and simple frontend. Demonstrates end-to-end engineering.", startWeek: 2, endWeek: 4 },
      { title: "REST API with Authentication", description: "Build a REST API with JWT auth, validation and tests. A staple backend portfolio piece.", startWeek: 5, endWeek: 7 },
      { title: "Mini Project with DSA", description: "Pick a problem (e.g. a search/filter app or game) that forces use of the data structures you learned.", startWeek: 8, endWeek: 10 },
    ],
    profileWork: [
      "Set up GitHub with clean repos and READMEs",
      "Write a strong LinkedIn About section for developers",
      "Build a resume with project + impact bullets",
    ],
  },
  "AI/ML Engineer": {
    track: [
      "Python for ML (numpy, pandas, matplotlib)",
      "Math refresher: linear algebra & calculus basics",
      "Statistics & probability for ML",
      "Intro to ML: regression, classification",
      "Model evaluation: cross-validation, metrics",
      "Feature engineering",
      "Neural networks & backpropagation",
      "Deep learning with PyTorch/TensorFlow",
      "CNNs for vision",
      "NLP fundamentals",
      "Model deployment basics (APIs, Docker)",
      "Portfolio finalization + interview prep",
    ],
    codingTopics: ["NumPy", "Pandas", "Python logic", "Scikit-learn", "Python logic", "Feature engineering", "Neural nets basics", "PyTorch", "CNN", "NLP", "Python logic", "Mixed ML"],
    projects: [
      { title: "End-to-End ML Pipeline", description: "Train a classifier on a real dataset, tune it, evaluate, and wrap it in a simple API.", startWeek: 4, endWeek: 6 },
      { title: "Computer Vision or NLP Project", description: "Build an image classifier or text classifier, document it, and push to GitHub.", startWeek: 8, endWeek: 10 },
    ],
    profileWork: [
      "Publish Kaggle notebooks to build an ML presence",
      "Write GitHub READMEs explaining your models",
      "Add ML projects + metrics to your resume",
    ],
  },
  "Frontend Developer": {
    track: [
      "HTML & CSS fundamentals",
      "Responsive design & flexbox/grid",
      "JavaScript fundamentals (ES6+)",
      "DOM manipulation & events",
      "JavaScript: async, fetch, modules",
      "React fundamentals (components, props, state)",
      "React hooks & context",
      "Forms, validation & state management",
      "Styling with Tailwind CSS",
      "Build tools & deployment (Vercel/Netlify)",
      "Performance & accessibility",
      "Portfolio finalization + interview prep",
    ],
    codingTopics: ["HTML/CSS", "JS logic", "JS arrays & objects", "DOM", "Fetch APIs", "React components", "React hooks", "JS logic", "Tailwind", "Build & deploy", "JS logic", "Mixed frontend"],
    projects: [
      { title: "Responsive Landing Page", description: "Build a pixel-perfect responsive landing page from a design brief.", startWeek: 2, endWeek: 3 },
      { title: "React App with External API", description: "Build a React app (e.g. a movie or weather app) that fetches and displays data from a public API.", startWeek: 4, endWeek: 6 },
      { title: "Full Portfolio Website", description: "Your developer portfolio site showcasing all your work.", startWeek: 8, endWeek: 10 },
    ],
    profileWork: [
      "Publish your portfolio site and add it to LinkedIn/GitHub",
      "Write clean GitHub READMEs for frontend projects",
      "Update resume with the portfolio + React app",
    ],
  },
};

function templateFor(role: string): RoleTemplate | null {
  return TEMPLATES[role] ?? null;
}

function relevanceFor(category: MilestoneCategory, topic: string, role: string): string {
  const profile = getCareerProfile(role);
  const base = profile
    ? `Relevant to ${role}: ${profile.summary}`
    : `Relevant to your path toward ${role}.`;
  const perCategory: Record<MilestoneCategory, string> = {
    LEARNING:
      profile && profile.skillAreas.length > 0
        ? `Builds the "${(profile.skillAreas[0] ?? "core skills").split("_").join(" ")}" foundation that ${role} hiring looks for.`
        : `Grows the core knowledge ${role} requires.`,
    CODING:
      profile && profile.coreSkills.length > 0
        ? `Strengthens "${profile.coreSkills[0]}" — a skill directly listed for ${role} candidates.`
        : `Practices the problem-solving skill ${role} interviews test.`,
    PROJECT:
      profile && profile.evidence.length > 0
        ? `Produces portfolio proof: ${profile.evidence[0].toLowerCase()}.`
        : `Builds a portfolio piece that signals real ability for ${role}.`,
    PROFILE:
      profile && profile.evidence.length > 2
        ? `Makes your resume/LinkedIn reflect exactly what ${role} employers check (${profile.evidence.slice(0, 2).join("; ").toLowerCase()}).`
        : `Improves how recruiters perceive you for ${role}.`,
    INTERVIEW: `Converts ${role} knowledge into the structured answers interviews reward.`,
    OPPORTUNITY:
      profile && profile.industries.length > 0
        ? `Surfaces real openings in ${profile.industries.slice(0, 3).join(", ")} — where ${role} roles actually hire.`
        : `Finds live internships/jobs that match your ${role} goal.`,
  };
  return `${perCategory[category]} ${base}`;
}

function buildGenericMilestones(role: string, totalWeeks: number): Milestone[] {
  const profile = getCareerProfile(role);
  const skills = profile?.coreSkills.length ? profile.coreSkills : [profile?.skillAreas[0] ?? "core skills"];
  const milestones: Milestone[] = [];
  const focus = profile?.focusDimension ?? "coreSkills";
  const learnPool = profile?.skillAreas.length ? profile.skillAreas : ["SOFT_SKILLS"];
  const evidence = profile?.evidence[0] ?? "a role-specific portfolio piece";

  for (let w = 1; w <= totalWeeks; w++) {
    const area = learnPool[(w - 1) % learnPool.length];
    const topic = skills[(w - 1) % skills.length];
    milestones.push({
      week: w,
      title: `Learn: ${area.split("_").map(cap).join(" ").toLowerCase()}`,
      description: `Study the "${area}" foundation for ${role}: a short course, notes and a small worked example.`,
      category: "LEARNING",
      relevance: relevanceFor("LEARNING", area, role),
    });
    milestones.push({
      week: w,
      title: `Practice: ${topic}`,
      description: `Apply ${topic} with a hands-on exercise or problem set related to ${role}.`,
      category: "CODING",
      relevance: relevanceFor("CODING", topic, role),
    });
    if (w % 4 === 1 || (w >= 3 && w <= 5)) {
      milestones.push({
        week: w,
        title: `Project: ${cap(evidence)}`,
        description: `Work toward ${evidence} — the signal that stands out for ${role}.`,
        category: "PROJECT",
        relevance: relevanceFor("PROJECT", evidence, role),
      });
    }
    if (w === 6 || w === 10) {
      milestones.push({
        week: w,
        title: `Profile: update resume + LinkedIn for ${role}`,
        description: `Refresh your resume and LinkedIn to lead with ${focus === "projects" ? "projects and portfolios" : focus === "coreSkills" ? "core skills and certifications" : "relevant experience and evidence"}.`,
        category: "PROFILE",
        relevance: relevanceFor("PROFILE", role, role),
      });
    }
    if (w === 8 || w === 11) {
      milestones.push({
        week: w,
        title: `Interview: ${role} skill check`,
        description: `Mock interview or structured self-test on the ${role} topics covered so far.`,
        category: "INTERVIEW",
        relevance: relevanceFor("INTERVIEW", role, role),
      });
    }
    if (w === 4 || w === 9) {
      milestones.push({
        week: w,
        title: `Opportunity: save ${role}-relevant internship/job`,
        description: "Browse Unstop/Internshala/LinkedIn and save at least one matching opportunity.",
        category: "OPPORTUNITY",
        relevance: relevanceFor("OPPORTUNITY", role, role),
      });
    }
  }
  return milestones.sort((a, b) => a.week - b.week);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMilestones(t: RoleTemplate, totalWeeks: number, role: string): Milestone[] {
  const milestones: Milestone[] = [];
  let projectIdx = 0;
  for (let w = 1; w <= totalWeeks; w++) {
    const track = t.track[(w - 1) % t.track.length];
    const coding = t.codingTopics[(w - 1) % t.codingTopics.length];
    milestones.push({
      week: w,
      title: `Learn: ${track}`,
      description: `Study ${track} for this week. Follow a short free course, take notes and build a small example.`,
      category: "LEARNING",
      relevance: relevanceFor("LEARNING", track, role),
    });
    milestones.push({
      week: w,
      title: `Code: ${coding} practice`,
      description: `Solve at least 2 problems on ${coding} on a platform you prefer (LeetCode/HackerRank/GFG).`,
      category: "CODING",
      relevance: relevanceFor("CODING", coding, role),
    });
    const active = t.projects.filter((p) => p.startWeek <= w && p.endWeek >= w);
    if (active.length > 0) {
      const p = active[0];
      milestones.push({
        week: w,
        title: `Project: ${p.title}`,
        description: p.description,
        category: "PROJECT",
        relevance: relevanceFor("PROJECT", p.title, role),
      });
    } else if (projectIdx < t.projects.length && w > t.projects[projectIdx].endWeek) {
      projectIdx++;
    }
  }
  // sprinkle profile & interview & opportunity
  const profileWeeks = [2, 6, 10, 12];
  for (const w of profileWeeks) {
    if (w <= totalWeeks) {
      const text = t.profileWork[(w - 1) % t.profileWork.length];
      milestones.push({
        week: w,
        title: `Profile: ${text}`,
        description: text,
        category: "PROFILE",
        relevance: relevanceFor("PROFILE", text, role),
      });
    }
  }
  [8, 11].forEach((w) => {
    if (w <= totalWeeks) {
      milestones.push({
        week: w,
        title: "Interview: skill check",
        description: "Attempt a mock interview or self-test on topics covered so far.",
        category: "INTERVIEW",
        relevance: relevanceFor("INTERVIEW", "skill check", role),
      });
    }
  });
  [4, 9].forEach((w) => {
    if (w <= totalWeeks) {
      milestones.push({
        week: w,
        title: "Opportunity: find a relevant event/internship",
        description: "Browse Unstop/Internshala/LinkedIn and save at least one relevant opportunity.",
        category: "OPPORTUNITY",
        relevance: relevanceFor("OPPORTUNITY", "event/internship", role),
      });
    }
  });
  return milestones.sort((a, b) => a.week - b.week);
}

export async function persistRoadmap(
  prisma: PrismaClient,
  studentId: string,
  input: RoadmapInput,
  totalWeeks = 12,
  allowAI = true
) {
  let milestones: Milestone[] = [];

  if (allowAI && process.env.GEMINI_API_KEY) {
    try {
      if (totalWeeks > 16) {
        const plan = await generateLongTermPlan(input, totalWeeks);
        for (const p of plan.phases) {
          for (let w = Math.max(1, p.weekStart); w <= Math.min(totalWeeks, p.weekEnd); w++) {
            milestones.push({
              week: w,
              title: `Phase ${p.phase}: ${p.title}`,
              description: p.description,
              category: p.focus,
              relevance: relevanceFor(p.focus as MilestoneCategory, p.title, input.targetRole),
            });
          }
        }
      } else {
        const ai = await generateRoadmap(input, totalWeeks);
        milestones = ai.milestones
          .filter((m) => m.week >= 1 && m.week <= totalWeeks)
          .map((m) => ({
            week: m.week,
            title: m.title,
            description: m.description,
            category: m.category as MilestoneCategory,
            relevance: relevanceFor(m.category as MilestoneCategory, m.title, input.targetRole),
          }));
      }
    } catch (e) {
      console.error("[roadmap] AI generation failed, using template", e);
    }
  }

  if (milestones.length === 0) {
    const template = templateFor(input.targetRole);
    if (template) {
      milestones = buildMilestones(template, totalWeeks, input.targetRole);
    } else if (getCareerProfile(input.targetRole)) {
      milestones = buildGenericMilestones(input.targetRole, totalWeeks);
    } else {
      const generic = templateFor("Software Developer")!;
      milestones = buildMilestones(generic, totalWeeks, input.targetRole).map((m) => ({
        ...m,
        title: `[${input.targetRole}] ${m.title}`,
      }));
    }
  }

  const aiSummary = milestones.length > 0
    ? `${input.targetRole} roadmap: ${totalWeeks} weeks, ${milestones.length} milestones across learning, coding, projects, profiles, interviews and opportunities.`
    : null;

  const existing = await prisma.roadmap.findUnique({ where: { studentId } });
  if (existing) {
    await prisma.roadmapItem.deleteMany({ where: { roadmapId: existing.id } });
    // Unlink tasks that referenced the now-deleted roadmap items
    await prisma.task.updateMany({
      where: { studentId, roadmapItemId: { not: null } },
      data: { roadmapItemId: null },
    });
    await prisma.roadmap.update({
      where: { id: existing.id },
      data: { title: `${input.targetRole} Roadmap`, targetRole: input.targetRole, totalWeeks, aiSummary, status: "ACTIVE" },
    });
    for (const m of milestones) {
      await prisma.roadmapItem.create({
        data: {
          roadmapId: existing.id,
          weekNumber: m.week,
          title: m.title,
          description: m.description,
          relevance: m.relevance ?? null,
          category: m.category,
          order: m.week,
        },
      });
    }
    return existing;
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      studentId,
      title: `${input.targetRole} Roadmap`,
      targetRole: input.targetRole,
      totalWeeks,
      aiSummary,
    },
  });
  for (const m of milestones) {
    await prisma.roadmapItem.create({
      data: {
        roadmapId: roadmap.id,
        weekNumber: m.week,
        title: m.title,
        description: m.description,
        relevance: m.relevance ?? null,
        category: m.category,
        order: m.week,
      },
    });
  }
  return roadmap;
}
