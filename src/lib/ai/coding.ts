import "server-only";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/client";

const codingFeedbackSchema = z.object({
  correctness: z.string(),
  feedback: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
});

export interface CodingFeedbackInput {
  title: string;
  topic: string;
  difficulty: string;
  description: string;
  code: string;
}

export async function evaluateCodeSolution(input: CodingFeedbackInput) {
  const model = getModel();

  const prompt = `You are a Senior Software Engineer reviewing a student's solution to a coding problem.

PROBLEM TITLE: ${input.title}
TOPIC: ${input.topic}
DIFFICULTY: ${input.difficulty}
PROBLEM DESCRIPTION:
"""${input.description}"""

STUDENT'S SOLUTION CODE:
"""${input.code || "// no code written yet"}"""

Evaluate the student's solution and return:
1. correctness: A brief explanation (1-2 sentences) of whether the approach is correct, partially correct, or incorrect, mentioning potential edge cases, syntax issues, or bugs.
2. feedback: 2-3 specific, constructive tips or hints to improve the code (formatting, modularity, algorithmic optimization) without directly writing the full solution code.
3. timeComplexity: Estimated Big-O time complexity (e.g. O(N log N)).
4. spaceComplexity: Estimated Big-O space complexity (e.g. O(N)).

Keep your explanations concise, encouraging, and clear.`;

  const { object } = await generateObject({
    model,
    schema: codingFeedbackSchema,
    schemaName: "coding_feedback",
    schemaDescription: "AI feedback on a coding solution",
    prompt,
  });

  return object;
}
