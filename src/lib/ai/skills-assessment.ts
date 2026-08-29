import "server-only";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { generateWithFailover } from "@/lib/ai/client";
import { careerContextFor } from "@/lib/careers";

// ── Adaptive Skill Assessment ─────────────────────────────────────────────

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
  skillArea: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface SkillGrade {
  name: string;
  category: string;
  grade: number; // 1-5
  confidence: number; // 0-1
  reasoning: string;
}

export interface AssessmentResult {
  grades: SkillGrade[];
  questions: AssessmentQuestion[];
  overallScore: number;
  summary: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendedPath: string;
}

/**
 * Generate initial adaptive questions based on the student's chosen
 * specialization, degree, year, and target role.
 */
export async function generateInitialQuestions(profile: {
  degree: string;
  specialization: string;
  targetRole: string;
  year: string;
}): Promise<AssessmentQuestion[]> {
  const career = await careerContextFor(profile);
  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: z.object({
          questions: z.array(
            z.object({
              id: z.string(),
              question: z.string(),
              options: z.array(z.string()).min(4).max(4),
              correctIndex: z.number().min(0).max(3),
              topic: z.string(),
              skillArea: z.string(),
              difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
            })
          ),
        }),
        prompt: `You are an expert career assessment designer. Generate exactly 10 initial assessment questions for a student with the following profile:

Degree: ${profile.degree}
Specialization: ${profile.specialization}
Target Role: ${profile.targetRole}
Year: ${profile.year}

Career profile context:
${career}

The questions should:
1. Start with EASY difficulty to establish a baseline
2. Cover the key skills needed for their target career (weighted toward the priority skill areas above)
3. Be practical and scenario-based where possible
4. Test conceptual understanding, not just definitions
5. Include a mix of skill areas relevant to their path

Each question must have exactly 4 options with one correct answer.
Skill areas should map to their degree domain (e.g., for CS: Programming, Data Structures, Algorithms, Databases, Web, System Design, etc.)
For non-CS degrees, use appropriate skill areas (e.g., for MBA: Strategy, Analytics, Marketing, Finance, Operations, Leadership, etc.)

Generate unique IDs like "q1", "q2", etc.`,
        temperature: 0.7,
      }),
    "SKILL_ASSESSMENT_INITIAL",
  );
  return object.questions;
}

/**
 * Generate follow-up adaptive questions based on how the student answered
 * the initial round. Focus on weak areas and adjust difficulty.
 */
export async function generateFollowUpQuestions(profile: {
  degree: string;
  specialization: string;
  targetRole: string;
  year: string;
}, previousAnswers: {
  questionId: string;
  question: string;
  answered: number;
  correct: boolean;
  topic: string;
  skillArea: string;
  difficulty: string;
}[]): Promise<AssessmentQuestion[]> {
  const career = await careerContextFor(profile);
  const weakAreas = previousAnswers
    .filter((a) => !a.correct)
    .map((a) => `${a.skillArea} (${a.topic})`);
  const strongAreas = previousAnswers
    .filter((a) => a.correct)
    .map((a) => `${a.skillArea} (${a.topic})`);
  const lastDifficulty = previousAnswers[previousAnswers.length - 1]?.difficulty ?? "EASY";

  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: z.object({
          questions: z.array(
            z.object({
              id: z.string(),
              question: z.string(),
              options: z.array(z.string()).min(4).max(4),
              correctIndex: z.number().min(0).max(3),
              topic: z.string(),
              skillArea: z.string(),
              difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
            })
          ),
        }),
        prompt: `You are an adaptive assessment engine. Based on the student's performance in the first round, generate 5 follow-up questions that dig deeper into their weak areas while also testing their strong areas at a higher difficulty.

Student Profile:
- Degree: ${profile.degree}
- Specialization: ${profile.specialization}
- Target Role: ${profile.targetRole}
- Year: ${profile.year}

Career profile context:
${career}

Previous Round Results:
- Weak areas (got wrong): ${weakAreas.length > 0 ? weakAreas.join(", ") : "None — all correct!"}
- Strong areas (got right): ${strongAreas.length > 0 ? strongAreas.join(", ") : "None — all incorrect"}
- Last difficulty level: ${lastDifficulty}

Adjust difficulty:
- If student got most right → increase difficulty to MEDIUM/HARD
- If student struggled → keep at EASY/MEDIUM and focus on fundamentals
- Ensure at least 2 questions target their weakest skill areas

Each question must have exactly 4 options with one correct answer.
Generate unique IDs like "fu1", "fu2", etc.`,
        temperature: 0.6,
      }),
    "SKILL_ASSESSMENT_FOLLOWUP",
  );
  return object.questions;
}

/**
 * Grade all skills 1-5 based on combined assessment performance.
 */
export async function gradeSkillsFromResponses(profile: {
  degree: string;
  specialization: string;
  targetRole: string;
  year: string;
}, allAnswers: {
  questionId: string;
  question: string;
  answered: number;
  correct: boolean;
  topic: string;
  skillArea: string;
  difficulty: string;
}[]): Promise<AssessmentResult> {
  const career = await careerContextFor(profile);
  const { object } = await generateWithFailover(
    (model) =>
      generateObject({
        model,
        schema: z.object({
          grades: z.array(
            z.object({
              name: z.string(),
              category: z.string(),
              grade: z.number().min(1).max(5),
              confidence: z.number().min(0).max(1),
              reasoning: z.string(),
            })
          ),
          overallScore: z.number().min(0).max(100),
          summary: z.string(),
          weakAreas: z.array(z.string()),
          strongAreas: z.array(z.string()),
          recommendedPath: z.string(),
        }),
        prompt: `You are a skill grading expert. Analyze all assessment responses and grade each skill area on a 1-5 scale.

Student Profile:
- Degree: ${profile.degree}
- Specialization: ${profile.specialization}
- Target Role: ${profile.targetRole}
- Year: ${profile.year}

Career profile context:
${career}

Assessment Responses (${allAnswers.length} questions total):
${allAnswers.map((a) => `- [${a.correct ? "CORRECT" : "WRONG"}] ${a.skillArea}/${a.topic} (${a.difficulty}): "${a.question}" → Selected option ${a.answered}`).join("\n")}

Grading Guidelines:
- 5 = Expert: Consistently answered MEDIUM/HARD questions correctly in this area
- 4 = Proficient: Answered most questions correctly, including some HARD ones
- 3 = Developing: Got EASY/MEDIUM questions right but struggled with HARD
- 2 = Beginner: Got some EASY questions right
- 1 = Novice: Got most or all questions wrong in this area

Category mapping:
- For CS/Tech degrees: LANGUAGES, CS_FUNDAMENTALS, DATA, AI, WEB, TOOLS, SOFT_SKILLS, CLOUD
- For BBA/MBA: BUSINESS, MARKETING, FINANCE, DATA, SOFT_SKILLS
- For B.Sc/M.Sc: DATA, AI, LANGUAGES, CS_FUNDAMENTALS, TOOLS, SOFT_SKILLS

Grade each skill area based on the evidence. Be strict but fair.
Include a clear reasoning for each grade.
The recommendedPath should describe what the student should focus on to reach their specialization and target role.`,
        temperature: 0.3,
      }),
    "SKILL_ASSESSMENT_GRADE",
  );
  return { ...object, questions: [] } as AssessmentResult;
}
