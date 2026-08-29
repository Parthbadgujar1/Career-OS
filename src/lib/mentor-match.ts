import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { getCareerProfile } from "@/lib/careers";
import { fromJson } from "@/lib/utils";

export interface MentorCandidateData {
  userId: string;
  name: string;
  email: string;
  expertiseRoles: string[];
  expertiseIndustries: string[];
  yearsExperience: number;
  bio: string | null;
}

export interface StudentMenteeData {
  targetRoles: string[];
  industries: string[];
  weakSkills: string[];
}

export interface MentorMatch {
  score: number; // 0-100
  reasons: string[];
}

/**
 * Scores how well a mentor fits a student's target career, industry and skill gaps.
 * Weighting: career overlap is the strongest signal, then industry, then experience.
 */
export function scoreMentorForStudent(mentor: MentorCandidateData, student: StudentMenteeData): MentorMatch {
  const reasons: string[] = [];
  let score = 0;

  const roles = new Set(mentor.expertiseRoles);
  const roleHits = student.targetRoles.filter((r) => roles.has(r));
  if (roleHits.length > 0) {
    score += 40;
    reasons.push(`Expertise in ${roleHits.join(", ")} — matches your target role${student.targetRoles.length > 1 ? "s" : ""}`);
  } else {
    // Partial credit: role shares the same career profile skill emphasis
    const partial = student.targetRoles.filter((r) => {
      const cp = getCareerProfile(r);
      return cp && cp.skillAreas.some((a) => mentor.expertiseRoles.some((er) => er.toLowerCase().includes(a.toLowerCase())));
    });
    if (partial.length > 0) {
      score += 15;
      reasons.push(`Covers the core skill areas for ${partial.join(", ")}`);
    }
  }

  const inds = new Set(mentor.expertiseIndustries);
  const indHits = student.industries.filter((i) => inds.has(i));
  if (indHits.length > 0) {
    score += 25;
    reasons.push(`Industry background in ${indHits.join(", ")}`);
  }

  let experienceBonus = 0;
  if (mentor.yearsExperience >= 6) experienceBonus = 20;
  else if (mentor.yearsExperience >= 3) experienceBonus = 15;
  else if (mentor.yearsExperience >= 1) experienceBonus = 10;
  score += experienceBonus;
  if (experienceBonus > 0) reasons.push(`${mentor.yearsExperience} years of work experience`);

  if (industryHintMatch(mentor, student)) {
    score += 10;
    reasons.push("Industry focus aligns with your career goal");
  }

  if (student.weakSkills.length > 0 && mentor.bio) {
    const hits = student.weakSkills.filter((s) => testBio(mentor.bio, s));
    if (hits.length > 0) {
      score += 5;
      reasons.push(`Can help you close the gap in ${hits.slice(0, 2).join(", ")}`);
    }
  }

  const deduped = [...new Set(reasons)];
  if (deduped.length === 0) deduped.push("General career guidance");

  return { score: Math.min(95, score), reasons: deduped };
}

export function rankMentors(mentors: MentorCandidateData[], student: StudentMenteeData): MentorMatch[] {
  return mentors
    .map((m) => scoreMentorForStudent(m, student))
    .sort((a, b) => b.score - a.score);
}

function industryHintMatch(mentor: MentorCandidateData, student: StudentMenteeData): boolean {
  if (student.industries.length === 0) return false;
  const primary = student.industries[0].toLowerCase();
  return [...mentor.expertiseRoles, ...(mentor.expertiseIndustries ?? [])].some((v) =>
    testKeywords(primary, v)
  );
}

function testBio(bio: string | null, skill: string): boolean {
  return (bio ?? "").toLowerCase().includes(skill.toLowerCase());
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "IT Services": ["software", "development", "technology"],
  "Product / SaaS": ["saas", "product", "software", "startup"],
  Fintech: ["finance", "fintech", "banking", "payments"],
  "E-commerce": ["ecommerce", "e-commerce", "retail", "commerce"],
  "Health Tech": ["health", "healthcare", "medical"],
  EdTech: ["education", "edtech", "learning"],
  "AI & ML": ["ai", "machine learning", "ml", "data science", "artificial"],
  Consulting: ["consulting", "strategy", "advisory"],
  Banking: ["banking", "finance", "investment"],
  Startups: ["startup", "entrepreneur", "founder"],
  Gaming: ["gaming", "game"],
  Cybersecurity: ["security", "cyber", "infosec"],
};

function testKeywords(primaryIndustry: string, value: string): boolean {
  const v = value.toLowerCase();
  const kws = INDUSTRY_KEYWORDS[primaryIndustry] ?? [primaryIndustry];
  return kws.some((k) => v.includes(k));
}

/** Fetches mentors with their expertise metadata from the DB. */
export async function fetchMentorCandidates(
  prisma: Pick<PrismaClient, "user">,
  excludeIds: string[] = []
): Promise<MentorCandidateData[]> {
  const users = await prisma.user.findMany({
    where: { role: "MENTOR" },
    include: { mentorProfile: true },
    orderBy: { name: "asc" },
  });
  return users
    .filter((u) => !excludeIds.includes(u.id))
    .map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      expertiseRoles: fromJson<string[]>(u.mentorProfile?.expertiseRoles, []),
      expertiseIndustries: fromJson<string[]>(u.mentorProfile?.expertiseIndustries, []),
      yearsExperience: u.mentorProfile?.yearsExperience ?? 0,
      bio: u.mentorProfile?.bio ?? null,
    }));
}