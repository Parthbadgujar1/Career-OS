import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

const weeklyReportSchema = z.object({
  narrative: z.string(),
  weakAreas: z.array(z.string()),
  priorities: z.array(z.string()),
});

export interface WeeklyReportInput {
  role: string;
  weekLabel: string;
  tasksPlanned: number;
  tasksCompleted: number;
  completionRate: number;
  codingSolved: number;
  learningTopics: string[];
  projectProgress: string;
  topWeakTasks: string[];
}

export async function generateWeeklyReport(input: WeeklyReportInput) {
  const { object } = await generateObject({
    model: getModel(),
    schema: weeklyReportSchema,
    schemaName: "weekly_report",
    schemaDescription: "AI weekly progress report for a student",
    prompt: `You are the Career OS weekly coach. Write an encouraging, honest weekly report for a student targeting "${input.role}".

WEEK: ${input.weekLabel}
PLANNED TASKS: ${input.tasksPlanned}
COMPLETED: ${input.tasksCompleted}
COMPLETION RATE: ${input.completionRate}%
CODING PROBLEMS SOLVED: ${input.codingSolved}
TOPICS STUDIED: ${input.learningTopics.join(", ") || "none"}
PROJECT PROGRESS: ${input.projectProgress || "none"}
WEAK/INCOMPLETE AREAS: ${input.topWeakTasks.join(", ") || "none"}

Return:
- narrative: 4-6 sentence summary of the week, balanced (celebrate wins, name gaps), tone is coach-like, no fluff.
- weakAreas: up to 5 weakest areas with short evidence (e.g. "SQL practice skipped 3 days").
- priorities: up to 5 concrete priorities for next week. Each must say WHAT and WHY now (e.g. "Finish SQL project milestone 2 — it unblocks your portfolio for Data Analyst internships").`,
  });

  return object;
}
