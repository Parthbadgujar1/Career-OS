"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { matchJobDescription } from "@/lib/ai/jd-match";

export async function matchJdAction(data: {
  jobTitle: string;
  company: string;
  jdText: string;
}): Promise<
  | { ok: true; result: {
      matchScore: number;
      matchedSkills: string[];
      missingKeywords: string[];
      suggestions: string[];
      verdict: string;
    }}
  | { error: string }
> {
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

  try {
    const aiResult = await matchJobDescription(resume.content, data.jdText);

    const saved = await prisma.jdMatchResult.create({
      data: {
        studentId: profile.id,
        jobTitle: data.jobTitle || null,
        company: data.company || null,
        jdText: data.jdText,
        matchScore: aiResult.matchScore,
        matchedSkills: JSON.stringify(aiResult.matchedSkills),
        missingKeywords: JSON.stringify(aiResult.missingKeywords),
        suggestions: JSON.stringify(aiResult.suggestions),
        verdict: aiResult.verdict,
      },
    });

    revalidatePath("/app/jd-match");

    return {
      ok: true,
      result: {
        matchScore: saved.matchScore,
        matchedSkills: aiResult.matchedSkills,
        missingKeywords: aiResult.missingKeywords,
        suggestions: aiResult.suggestions,
        verdict: saved.verdict ?? "partial_match",
      },
    };
  } catch (e) {
    console.error("[matchJdAction] AI generation failed", e);
    return { error: "AI analysis failed. Please try again later." };
  }
}

export async function getJdMatchHistoryAction() {
  const { profile } = await requireStudentProfile();

  const results = await prisma.jdMatchResult.findMany({
    where: { studentId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 10,
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
    createdAt: r.createdAt.toISOString(),
  }));
}
