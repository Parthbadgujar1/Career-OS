"use server";

import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { ensureDailyTasks } from "@/lib/engine/tasks";
import { getModel } from "@/lib/ai/client";

interface CoachContext {
  name: string;
  targetRole: string;
  readiness: number;
  weakSkills: string[];
  roadmapWeek: number;
  roadmapWeeks: number;
  todayTasks: string[];
  latestReport: string | null;
  projects: string[];
  interviews: number;
  codingSolved: number;
}

async function buildContext(studentId: string): Promise<CoachContext> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, roadmap: { include: { items: true } } },
  });
  const skills = await prisma.studentSkill.findMany({
    where: { studentId },
    include: { skill: true },
  });
  const tasks = await ensureDailyTasks(prisma, studentId);
  const latestReport = await prisma.weeklyReport.findFirst({
    where: { studentId },
    orderBy: { weekEnd: "desc" },
  });
  const [projects, submissions, interviews] = await Promise.all([
    prisma.project.findMany({ where: { studentId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.codingSubmission.findMany({ where: { studentId } }),
    prisma.mockInterview.findMany({ where: { studentId } }),
  ]);

  const week = profile?.roadmap
    ? Math.min(
        profile.roadmap.totalWeeks,
        Math.max(1, Math.floor((Date.now() - profile.roadmap.createdAt.getTime()) / 86400000 / 7) + 1)
      )
    : 0;

  return {
    name: profile?.user.name ?? "there",
    targetRole: profile?.targetRole ?? "your target role",
    readiness: profile?.readinessScore ?? 0,
    weakSkills: skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name),
    roadmapWeek: week,
    roadmapWeeks: profile?.roadmap?.totalWeeks ?? 12,
    todayTasks: tasks.filter((t) => t.status === "PENDING").map((t) => t.title),
    latestReport: latestReport?.aiNarrative ?? null,
    projects: projects.map((p) => p.title),
    interviews: interviews.length,
    codingSolved: submissions.filter((s) => s.status === "SOLVED").length,
  };
}

function keywordResponse(ctx: CoachContext, message: string): string {
  const lower = message.toLowerCase();
  const role = ctx.targetRole;
  const weak = ctx.weakSkills.length > 0 ? ctx.weakSkills.join(", ") : "no critical gaps";
  const today = ctx.todayTasks.length > 0 ? ctx.todayTasks.join("\n") : "No pending tasks — refresh today's plan on the Overview page.";

  if (lower.includes("today") || lower.includes("daily") || lower.includes("plan") || lower.includes("work on")) {
    return `Here's your plan for today, ${ctx.name} (Readiness ${ctx.readiness}/100):\n\n**Today's tasks**\n${today}\n\n**Focus hint:** your weakest skills are ${weak}. Spend extra time there.\n\nOpen "Today's Plan" to check them off — every completed task feeds your weekly report.`;
  }
  if (lower.includes("skill") || lower.includes("prioriti")) {
    return `Based on your roadmap (${role}) and current ratings:\n\n**Critical (rating ≤ 2/5):** ${weak === "no critical gaps" ? "none right now — nice work" : weak}\n\n**Readiness:** ${ctx.readiness}/100\n\nPrioritize the critical list first — those gaps carry the most weight in your readiness score. The Skills dashboard lets you update ratings after you level up.`;
  }
  if (lower.includes("interview") || lower.includes("mock")) {
    return `**Interview Prep**\n\nYou've done ${ctx.interviews} mock interview${ctx.interviews === 1 ? "" : "s"} so far. Keep a rhythm of 1–2 per week.\n\nRecommended weekly cycle:\n1. Technical — DSA patterns (two pointers, sliding window, BFS/DFS)\n2. Behavioral — STAR stories from your projects\n3. HR — goals, salary, "why this company"\n\nUse the Mock Interviews module and record your scores — they directly improve your readiness dimension.`;
  }
  if (lower.includes("project") || lower.includes("portfolio")) {
    if (ctx.projects.length === 0) {
      return `You don't have any projects yet. Start with one focused build that uses your target stack for ${role}:\n\n1. **Task Manager API** — Node/Express + SQL, JWT auth\n2. **Weather Dashboard** — React + a public API\n3. **Portfolio site** — Next.js, deploy to Vercel\n\nOpen Projects → "Generate project ideas" to get role-matched recommendations.`;
    }
    return `Your projects so far:\n${ctx.projects.map((p) => `• ${p}`).join("\n")}\n\nFor each one, prepare a 2-minute story: problem → what you built → impact. Deploy them and add links to your resume — the Projects page lets you move them to "Completed".`;
  }
  if (lower.includes("resume") || lower.includes("review") || lower.includes("ats")) {
    return `Head to **Resume & Profile** to review your resume (ATS score), LinkedIn, and GitHub. You can paste resume text and get a deterministic check instantly, with deeper AI feedback when an API key is configured.\n\nQuick wins that raise the profiles dimension of readiness:\n• Add quantifiable impact (numbers > adjectives)\n• Match keywords from ${role} job descriptions\n• Keep it to one page for campus roles`;
  }
  if (lower.includes("readiness") || lower.includes("score")) {
    return `Your current readiness is **${ctx.readiness}/100**. The breakdown lives on the Overview page — every point is explainable.\n\n${ctx.latestReport ? `Latest coach note: ${ctx.latestReport}` : "Generate a weekly report to get a narrative of your progress."}\n\nFastest levers right now: close the ${weak} gap${ctx.weakSkills.length > 1 ? "s" : ""}, solve more coding problems (${ctx.codingSolved} solved so far), and complete projects.`;
  }
  if (lower.includes("roadmap") || lower.includes("week")) {
    if (ctx.roadmapWeek === 0) {
      return `You haven't generated a career roadmap yet. Go to **Career Roadmap** and generate one for ${role} — it lays out a week-by-week plan.`;
    }
    return `You're on **Week ${ctx.roadmapWeek} of ${ctx.roadmapWeeks}** of your ${role} roadmap. Complete the week's milestones to advance. Today's tasks are generated from this week's plan.`;
  }
  if (lower.includes("opportunit") || lower.includes("job") || lower.includes("intern")) {
    return `Check the **Jobs & Internships** page for live opportunities across Internshala, LinkedIn, Naukri, and more. Save the ones you like, then Apply to track them. Your Applications page keeps a live tracker of everything you've applied to.`;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `Hi ${ctx.name}! I'm your Career Coach. Ask me about today's plan, skill priorities, interviews, projects, your resume, or your readiness score — I pull straight from your real data.`;
  }

  return `I'm here to help, ${ctx.name}. I can answer questions about:\n• Today's plan & daily tasks\n• Skill priorities (your weak areas: ${weak})\n• Interview prep & mock interviews\n• Project & portfolio ideas\n• Resume / ATS review\n• Your readiness score (${ctx.readiness}/100)\n• Your roadmap (Week ${ctx.roadmapWeek || "—"} of ${ctx.roadmapWeeks})\n\nTry one of the suggested prompts below.`;
}

export async function coachChatAction(message: string): Promise<{ response: string }> {
  const { profile } = await requireStudentProfile();
  const ctx = await buildContext(profile.id);

  if (process.env.GEMINI_API_KEY) {
    try {
      const { text } = await generateText({
        model: getModel(),
        prompt: `You are Career OS's AI career coach for a ${ctx.targetRole} student.
Real student context (use this, never invent data):
- Readiness: ${ctx.readiness}/100
- Weak skills: ${ctx.weakSkills.join(", ") || "none"}
- Roadmap: week ${ctx.roadmapWeek} of ${ctx.roadmapWeeks}
- Today's pending tasks: ${ctx.todayTasks.join(" | ") || "none"}
- Projects: ${ctx.projects.join(", ") || "none"}
- Coding problems solved: ${ctx.codingSolved}
- Mock interviews: ${ctx.interviews}

Student message: "${message}"

Reply as a concise, motivating coach (max ~120 words). If the student asks something about their data, answer using the context above. End with one concrete next action.`,
      });
      if (text.trim()) return { response: text.trim() };
    } catch (e) {
      console.error("[coach] AI chat failed", e);
    }
  }

  return { response: keywordResponse(ctx, message) };
}
