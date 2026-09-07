"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { matchJobDescription, type JdMatchResult } from "@/lib/ai/jd-match";
import { AiQuotaError } from "@/lib/ai/client";

const MAX_JD_TEXT_CHARS = 20_000;

function isFullResult(r: JdMatchResult): boolean {
  return Array.isArray(r.nextSteps) && Array.isArray(r.matchBreakdown?.skills);
}

export async function matchJdAction(data: {
  jobTitle: string;
  company: string;
  jdText: string;
}): Promise<{ ok: true; result: JdMatchResult } | { error: string }> {
  const { profile } = await requireStudentProfile();

  const resume = await prisma.resume.findFirst({
    where: { studentId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  if (!resume || !resume.content) {
    return {
      error: "Please build or upload a resume first before using JD Match.",
    };
  }

  const jobTitle = (data.jobTitle || "").slice(0, 200);
  const company = (data.company || "").slice(0, 200);
  const jdText = (data.jdText || "").slice(0, MAX_JD_TEXT_CHARS);

  if (!jdText.trim()) {
    return { error: "Please paste a job description." };
  }

  try {
    const aiResult = await matchJobDescription(resume.content, jdText);

    await prisma.jdMatchResult.create({
      data: {
        studentId: profile.id,
        jobTitle: jobTitle || null,
        company: company || null,
        jdText,
        matchScore: aiResult.matchScore,
        matchedSkills: JSON.stringify(aiResult.matchedSkills),
        missingKeywords: JSON.stringify(aiResult.missingSkills),
        suggestions: JSON.stringify(aiResult.suggestions),
        verdict: aiResult.verdict,
        analysis: isFullResult(aiResult) ? JSON.stringify(aiResult) : null,
      },
    });

    revalidatePath("/app/jd-match");

    return { ok: true, result: aiResult };
  } catch (e) {
    if (e instanceof AiQuotaError) return { error: e.message };
    console.error("[matchJdAction] AI generation failed", e);
    return { error: "AI analysis failed. Please try again later." };
  }
}

export async function getJdMatchHistoryAction() {
  const { profile } = await requireStudentProfile();

  const results = await prisma.jdMatchResult.findMany({
    where: { studentId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return results.map((r) => ({
    id: r.id,
    jobTitle: r.jobTitle,
    company: r.company,
    matchScore: r.matchScore,
    matchedSkills: JSON.parse(r.matchedSkills) as string[],
    missingKeywords: JSON.parse(r.missingKeywords) as string[],
    suggestions: JSON.parse(r.suggestions) as string[],
    verdict: r.verdict,
    analysis: r.analysis ? (JSON.parse(r.analysis) as JdMatchResult) : null,
    createdAt: r.createdAt.toISOString(),
  }));
}