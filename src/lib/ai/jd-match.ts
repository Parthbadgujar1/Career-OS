import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { generateWithFailover } from "@/lib/ai/client";

const jdMatchSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  suggestions: z.array(z.string()),
  verdict: z.enum(["strong_match", "good_match", "partial_match", "weak_match"]),
});

export interface JdMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  verdict: "strong_match" | "good_match" | "partial_match" | "weak_match";
}

export async function matchJobDescription(
  resumeContent: string,
  jdText: string
): Promise<JdMatchResult> {
  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: jdMatchSchema,
        schemaName: "jd_match",
        schemaDescription: "Resume vs Job Description match analysis",
        prompt: `You are an ATS (Applicant Tracking System) and career matching expert. Analyze the student's resume against the job description below.

RESUME:
"""${resumeContent}"""

JOB DESCRIPTION:
"""${jdText}"""

Return:
- matchScore: 0-100 (how well the resume aligns with the JD)
- matchedSkills: array of skills/keywords from the JD found in the resume
- missingKeywords: array of important skills/keywords from the JD NOT found in the resume
- suggestions: array of 3-6 actionable suggestions to improve the resume for this specific JD
- verdict: one of "strong_match" (≥80), "good_match" (≥60), "partial_match" (≥40), "weak_match" (<40)`,
      }),
    "JD_MATCH",
  );

  return object;
}
