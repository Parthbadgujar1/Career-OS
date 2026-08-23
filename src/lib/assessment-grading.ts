import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { ASSESSMENT_SETS, type AssessmentQuestion } from "@/lib/assessment-data";

// Maps each assessment question topic to the Skill names (see prisma/seed.ts)
// that the question measures. A topic can contribute to multiple skills.
// Entries keyed "<TYPE>:<topic>" override the generic topic mapping.
export const TOPIC_SKILL_MAP: Record<string, string[]> = {
  // Technical fundamentals
  "Data Structures": ["Data Structures"],
  Algorithms: ["Algorithms"],
  SQL: ["SQL"],
  DBMS: ["DBMS"],
  Python: ["Python"],
  Web: ["Computer Networks"],
  OS: ["Operating Systems"],
  OOP: ["OOP", "Java"],
  Networking: ["Computer Networks"],

  // Aptitude & reasoning
  Quantitative: ["Aptitude"],
  "Logical Reasoning": ["Aptitude"],
  Verbal: ["Aptitude"],

  // Communication & soft skills
  "Email Etiquette": ["Communication"],
  Interviews: ["Interview Skills"],
  Communication: ["Communication"],
  Behavioral: ["Interview Skills"],
  Presentation: ["Communication"],
  Professionalism: ["Communication"],
  Writing: ["Resume Writing"],
  Teamwork: ["Leadership"],

  // Marketing
  "Marketing Fundamentals": ["Branding", "Content Marketing"],
  "Strategic Marketing": ["Business Strategy", "Branding"],
  Branding: ["Branding"],
  "Digital Marketing": ["SEO & SEM", "Digital Ads"],
  "Market Research": ["Market Research"],
  "Consumer Behaviour": ["Market Research"],

  // Finance
  "Accounting Basics": ["Accounting Basics"],
  "Financial Analysis": ["Corporate Finance"],
  "Financial Reporting": ["Accounting Basics", "P&L Analysis"],
  "Financial Concepts": ["Corporate Finance"],
  "Financial Planning": ["Financial Modeling"],

  // Business & management
  Strategy: ["Business Strategy"],
  Management: ["Business Strategy"],
  Operations: ["Operations & Supply Chain"],
  "Human Resources": ["HR & People Operations"],
  Ethics: ["Business Strategy"],

  // Data & analytics
  "Data Concepts": ["Excel", "Power BI"],
  "Data Visualisation": ["Power BI", "Tableau"],
  Statistics: ["Statistics"],
  "Excel & Spreadsheets": ["Excel"],
  "Data Preparation": ["Pandas"],
  Analytics: ["Tableau", "Statistics"],
  "Data Engineering": ["SQL", "Pandas"],

  // Type-scoped overrides
  // In the communication test, "Verbal" measures written clarity, not aptitude
  "COMMUNICATION:Verbal": ["Communication"],
};

function skillsForQuestion(setType: string, topic: string): string[] | undefined {
  return TOPIC_SKILL_MAP[`${setType}:${topic}`] ?? TOPIC_SKILL_MAP[topic];
}

// Test performance (%) -> grade on the 1-5 scale
export function gradeFromPercentage(pct: number): number {
  if (pct >= 85) return 5;
  if (pct >= 70) return 4;
  if (pct >= 50) return 3;
  if (pct >= 30) return 2;
  return 1;
}

function questionsByType(): Map<string, AssessmentQuestion[]> {
  const map = new Map<string, AssessmentQuestion[]>();
  for (const set of ASSESSMENT_SETS) map.set(set.type, set.questions);
  return map;
}

export interface SkillGrade {
  skillId: string;
  skillName: string;
  rating: number;
  correct: number;
  total: number;
}

/**
 * Derives skill grades (1-5) purely from the student's baseline test results.
 * Reads every stored Assessment (answers JSON), groups correctness per skill
 * via TOPIC_SKILL_MAP and upserts StudentSkill rows. Idempotent — safe to run
 * after every submission.
 */
export async function gradeSkillsFromAssessments(
  prisma: PrismaClient,
  studentId: string
): Promise<SkillGrade[]> {
  const [assessments, skills] = await Promise.all([
    prisma.assessment.findMany({ where: { studentId } }),
    prisma.skill.findMany(),
  ]);

  const skillIdByName = new Map(skills.map((s) => [s.name, s.id]));
  const setsByType = questionsByType();

  // Aggregate correctness per skill name across all taken assessments
  const stats = new Map<string, { correct: number; total: number }>();
  for (const a of assessments) {
    const questions = setsByType.get(a.type);
    if (!questions) continue;

    let answers: Record<string, number> = {};
    try {
      answers = JSON.parse(a.data || "{}") as Record<string, number>;
    } catch {
      continue;
    }

    for (const q of questions) {
      const skillNames = skillsForQuestion(a.type, q.topic);
      if (!skillNames) continue;
      const given = answers[q.id];
      const isCorrect = given !== undefined && given === q.answer;
      for (const name of skillNames) {
        if (!skillIdByName.has(name)) continue;
        const s = stats.get(name) ?? { correct: 0, total: 0 };
        s.total += 1;
        if (isCorrect) s.correct += 1;
        stats.set(name, s);
      }
    }
  }

  const grades: SkillGrade[] = [];
  for (const [name, s] of stats) {
    if (s.total === 0) continue;
    const pct = Math.round((s.correct / s.total) * 100);
    const rating = gradeFromPercentage(pct);
    const skillId = skillIdByName.get(name)!;
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId, skillId } },
      update: { selfRating: rating },
      create: { studentId, skillId, selfRating: rating },
    });
    grades.push({ skillId, skillName: name, rating, correct: s.correct, total: s.total });
  }

  return grades.sort((a, b) => b.rating - a.rating);
}
