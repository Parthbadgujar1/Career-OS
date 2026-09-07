import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  generateRoadmap,
  generateYearRoadmap,
  yearFocusContext,
  type RoadmapInput,
  type CompletedWork,
} from "@/lib/ai/roadmap";
import { getCareerProfile } from "@/lib/careers";
import { academicYearsForDegree, remainingAcademicYears, WEEKS_PER_YEAR } from "@/lib/constants";
import { resourcesFor, type LearningResource } from "@/lib/engine/resources";

export type MilestoneCategory = "LEARNING" | "CODING" | "PROJECT" | "PROFILE" | "INTERVIEW" | "OPPORTUNITY";

export interface Milestone {
  week: number;
  title: string;
  description: string;
  category: MilestoneCategory;
  relevance?: string;
  academicYear?: number;
  resources?: LearningResource[];
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

  const push = (week: number, title: string, description: string, category: MilestoneCategory, topic: string) => {
    milestones.push({
      week,
      title,
      description,
      category,
      relevance: relevanceFor(category, topic, role),
      resources: resourcesFor(role, category, topic),
    });
  };

  for (let w = 1; w <= totalWeeks; w++) {
    const area = learnPool[(w - 1) % learnPool.length];
    const topic = skills[(w - 1) % skills.length];
    push(w, `Learn: ${area.split("_").map(cap).join(" ").toLowerCase()}`, `Study the "${area}" foundation for ${role}: a short course, notes and a small worked example.`, "LEARNING", area);
    push(w, `Practice: ${topic}`, `Apply ${topic} with a hands-on exercise or problem set related to ${role}.`, "CODING", topic);
    if (w % 4 === 1 || (w >= 3 && w <= 5)) {
      push(w, `Project: ${cap(evidence)}`, `Work toward ${evidence} — the signal that stands out for ${role}.`, "PROJECT", evidence);
    }
    if (w === 6 || w === 10) {
      push(w, `Profile: update resume + LinkedIn for ${role}`, `Refresh your resume and LinkedIn to lead with ${focus === "projects" ? "projects and portfolios" : focus === "coreSkills" ? "core skills and certifications" : "relevant experience and evidence"}.`, "PROFILE", role);
    }
    if (w === 8 || w === 11) {
      push(w, `Interview: ${role} skill check`, `Mock interview or structured self-test on the ${role} topics covered so far.`, "INTERVIEW", role);
    }
    if (w === 4 || w === 9) {
      push(w, `Opportunity: save ${role}-relevant internship/job`, "Browse Unstop/Internshala/LinkedIn and save at least one matching opportunity.", "OPPORTUNITY", role);
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
  const push = (week: number, title: string, description: string, category: MilestoneCategory, topic: string) => {
    milestones.push({
      week,
      title,
      description,
      category,
      relevance: relevanceFor(category, topic, role),
      resources: resourcesFor(role, category, topic),
    });
  };
  for (let w = 1; w <= totalWeeks; w++) {
    const track = t.track[(w - 1) % t.track.length];
    const coding = t.codingTopics[(w - 1) % t.codingTopics.length];
    push(w, `Learn: ${track}`, `Study ${track} for this week. Follow a short free course, take notes and build a small example.`, "LEARNING", track);
    push(w, `Code: ${coding} practice`, `Solve at least 2 problems on ${coding} on a platform you prefer (LeetCode/HackerRank/GFG).`, "CODING", coding);
    const active = t.projects.filter((p) => p.startWeek <= w && p.endWeek >= w);
    if (active.length > 0) {
      const p = active[0];
      push(w, `Project: ${p.title}`, p.description, "PROJECT", p.title);
    } else if (projectIdx < t.projects.length && w > t.projects[projectIdx].endWeek) {
      projectIdx++;
    }
  }
  const profileWeeks = [2, 6, 10, 12];
  for (const w of profileWeeks) {
    if (w <= totalWeeks) {
      const text = t.profileWork[(w - 1) % t.profileWork.length];
      push(w, `Profile: ${text}`, text, "PROFILE", text);
    }
  }
  [8, 11].forEach((w) => {
    if (w <= totalWeeks) {
      push(w, "Interview: skill check", "Attempt a mock interview or self-test on topics covered so far.", "INTERVIEW", "interview");
    }
  });
  [4, 9].forEach((w) => {
    if (w <= totalWeeks) {
      push(w, "Opportunity: find a relevant event/internship", "Browse Unstop/Internshala/LinkedIn and save at least one relevant opportunity.", "OPPORTUNITY", "opportunity");
    }
  });
  return milestones.sort((a, b) => a.week - b.week);
}

/** Year math for slicing a roadmap into academic years. */
function planSlice(totalWeeks: number, year: string | undefined, degree: string | undefined) {
  const totalYears = academicYearsForDegree(degree ?? null);
  const remaining = remainingAcademicYears(year ?? null, degree ?? null);
  const years = Math.max(1, Math.round(totalWeeks / WEEKS_PER_YEAR));
  const weeksPerYear = Math.round(totalWeeks / years);
  const offset = Math.max(0, totalYears - remaining); // 0-based absolute year of the first plan week
  return { totalYears, remaining, years, weeksPerYear, offset };
}

function withYear(week: number, academicYear: number) {
  return { week, academicYear };
}

export async function persistRoadmap(
  prisma: PrismaClient,
  studentId: string,
  input: RoadmapInput,
  totalWeeks = 12,
  allowAI = true
) {
  const { totalYears, remaining, years, weeksPerYear, offset } = planSlice(totalWeeks, input.year, input.degree);
  const role = input.targetRole;
  let milestones: Milestone[] = [];

  // Collect completed work BEFORE doing anything, so the AI can build on it.
  const existing = await prisma.roadmap.findUnique({ where: { studentId } });
  let completedWork: CompletedWork | undefined;
  if (existing) {
    const oldItems = await prisma.roadmapItem.findMany({
      where: { roadmapId: existing.id, status: "COMPLETED" },
      select: { title: true, category: true },
    });
    if (oldItems.length > 0) {
      completedWork = {
        previousRole: existing.targetRole ?? undefined,
        items: oldItems,
      };
    }
  }

  if (allowAI && process.env.GEMINI_API_KEY) {
    try {
      if (years > 1) {
        // Year-wise generation: one focused call per academic year so the first,
        // middle and final years each get the right emphasis.
        for (let y = 1; y <= years; y++) {
          const absoluteYear = Math.min(totalYears, offset + y);
          const plan = await generateYearRoadmap(input, {
            yearIndex: y,
            absoluteYear,
            totalYears,
            weeksInYear: weeksPerYear,
            yearFocus: yearFocusContext(absoluteYear, totalYears, role),
            role,
            completedWork,
          });
          for (const m of plan.milestones.filter((m) => m.week >= 1 && m.week <= weeksPerYear)) {
            const globalWeek = (y - 1) * weeksPerYear + m.week;
            milestones.push({
              ...withYear(globalWeek, absoluteYear),
              title: m.title,
              description: m.description,
              category: m.category as MilestoneCategory,
              relevance: relevanceFor(m.category as MilestoneCategory, m.title, role),
              resources: m.resources && m.resources.length > 0 ? m.resources : resourcesFor(role, m.category, m.title),
            });
          }
        }
      } else {
        const ai = await generateRoadmap(input, totalWeeks, {
          yearFocus: yearFocusContext(Math.min(totalYears, offset + 1), totalYears, role),
          completedWork,
        });
        const currentYear = totalYears - remaining + 1;
        milestones = ai.milestones
          .filter((m) => m.week >= 1 && m.week <= totalWeeks)
          .map((m) => ({
            ...withYear(m.week, currentYear),
            title: m.title,
            description: m.description,
            category: m.category as MilestoneCategory,
            relevance: relevanceFor(m.category as MilestoneCategory, m.title, role),
            resources: m.resources && m.resources.length > 0 ? m.resources : resourcesFor(role, m.category, m.title),
          }));
      }
    } catch (e) {
      console.error("[roadmap] AI generation failed, using template", e);
    }
  }

  if (milestones.length === 0) {
    const template = templateFor(role);
    if (template) {
      milestones = buildMilestones(template, totalWeeks, role);
    } else if (getCareerProfile(role)) {
      milestones = buildGenericMilestones(role, totalWeeks);
    } else {
      const generic = templateFor("Software Developer")!;
      milestones = buildMilestones(generic, totalWeeks, role).map((m) => ({
        ...m,
        title: `[${role}] ${m.title}`,
      }));
    }
    // Assign year numbers to every fallback milestone too.
    milestones.forEach((m) => {
      const y = Math.min(remaining, Math.ceil(m.week / weeksPerYear));
      m.academicYear = offset + y;
    });
  }

  const weeklyCount = milestones.filter((m) => m.week >= 1 && m.week <= totalWeeks).length;
  const aiSummary = weeklyCount > 0
    ? `${role} roadmap for ${years} academic year${years > 1 ? "s" : ""} (${totalWeeks} weeks, ≈${years * 12} months) with ${weeklyCount} weekly milestones covering learning, coding, projects, profiles, interviews and opportunities.`
    : null;

  if (existing) {
    await prisma.roadmapItem.deleteMany({ where: { roadmapId: existing.id } });
    // Unlink tasks that referenced the now-deleted roadmap items
    await prisma.task.updateMany({
      where: { studentId, roadmapItemId: { not: null } },
      data: { roadmapItemId: null, resources: undefined },
    });
    await prisma.roadmap.update({
      where: { id: existing.id },
      data: { title: `${role} Roadmap`, targetRole: role, totalWeeks, aiSummary, status: "ACTIVE" },
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
          academicYear: m.academicYear ?? null,
          resources: m.resources && m.resources.length > 0 ? (m.resources as object) : undefined,
        },
      });
    }
    const fresh = await prisma.roadmap.findUnique({ where: { studentId } });
    return fresh ?? existing;
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      studentId,
      title: `${role} Roadmap`,
      targetRole: role,
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
        academicYear: m.academicYear ?? null,
        resources: m.resources && m.resources.length > 0 ? (m.resources as object) : undefined,
      },
    });
  }
  return roadmap;
}