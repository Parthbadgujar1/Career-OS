import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { generateWithFailover } from "@/lib/ai/client";

const jdMatchSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  verdict: z.enum(["strong_match", "good_match", "partial_match", "weak_match"]),
  matchedSkills: z.array(z.string()),
  partialSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchBreakdown: z.object({
    skills: z.number().int().min(0).max(100),
    experience: z.number().int().min(0).max(100),
    education: z.number().int().min(0).max(100),
    responsibilities: z.number().int().min(0).max(100),
  }),
  experience: z.object({
    present: z.array(z.string()),
    gap: z.array(z.string()),
    note: z.string(),
  }),
  education: z.object({
    present: z.array(z.string()),
    gap: z.array(z.string()),
    note: z.string(),
  }),
  responsibilities: z.object({
    canDo: z.array(z.string()),
    gap: z.array(z.string()),
  }),
  redFlags: z.array(z.string()),
  proofPoints: z.array(z.string()),
  nextSteps: z.array(
    z.object({
      action: z.string(),
      impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
    })
  ),
  analysis: z.string(),
  suggestions: z.array(z.string()),
});

export interface JdMatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  responsibilities: number;
}

export interface JdMatchResult {
  matchScore: number;
  verdict: "strong_match" | "good_match" | "partial_match" | "weak_match";
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  matchBreakdown: JdMatchBreakdown;
  experience: { present: string[]; gap: string[]; note: string };
  education: { present: string[]; gap: string[]; note: string };
  responsibilities: { canDo: string[]; gap: string[] };
  redFlags: string[];
  proofPoints: string[];
  nextSteps: Array<{ action: string; impact: "HIGH" | "MEDIUM" | "LOW" }>;
  analysis: string;
  suggestions: string[];
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
        schemaDescription: "Detailed resume vs Job Description compatibility breakdown",
        prompt: `You are an ATS (Applicant Tracking System) and career matching expert. Analyze the student's resume against the job description below and produce a DETAILED, honest breakdown a student can act on. Judge the resume as a hiring manager would: explicit buzzwords beat generic claims; absence of required keywords must be flagged.

RESUME:
"""${resumeContent}"""

JOB DESCRIPTION:
"""${jdText}"""

Return:
- matchScore: 0-100 (overall alignment)
- verdict: strong_match (≥80), good_match (≥60), partial_match (≥40), weak_match (<40)
- matchedSkills: required skills from the JD explicitly present in the resume
- partialSkills: required skills implied or weakly evidenced (e.g. shown only as coursework, no hands-on example)
- missingSkills: required skills/keywords absent from the resume
- matchBreakdown: four 0-100 sub-scores — skills (hard/soft skills coverage), experience (years/roles/project depth), education (degree/certification fit), responsibilities (ability to perform stated duties)
- experience: present = experience facets the resume evidences (role types, years, scale); gap = experience the JD demands that the resume does not show; note = 1-2 sentence read on experience fit
- education: present = degree/cert/credential fit; gap = missing education requirements; note = short fit read
- responsibilities: canDo = duties the resume shows capability for; gap = duties with no evidence
- redFlags: 1-4 things that would hurt this application (e.g. no metrics, generic bullets, unrelated projects, missing core stack)
- proofPoints: 3-5 concrete, quantified bullet-point REWRITES the student can add to prove the most important missing matches
- nextSteps: 3-6 prioritized, specific actions (each with impact HIGH/MEDIUM/LOW) — what to change, learn, build, or add first
- analysis: 2-3 sentence overall assessment written directly to the student
- suggestions: 3-6 actionable tips to tailor the resume for this specific JD`,
      }),
    "JD_MATCH",
  );

  return object;
}