export const INTERVIEW_CRITERIA: Record<string, string[]> = {
  TECHNICAL: ["Technical accuracy", "Problem solving", "Code quality", "Communication"],
  HR: ["Career clarity", "Self-awareness", "Confidence", "Communication"],
  BEHAVIORAL: ["STAR structure", "Relevance to role", "Clarity", "Confidence"],
};

export const AI_MAX_SCORE = 100;

export interface AiQuestion {
  id: string;
  question: string;
  idealKeywords: string[];
  maxScore: number;
  hint?: string;
}

export const AI_QUESTION_BANK: Record<"TECHNICAL" | "HR" | "BEHAVIORAL", AiQuestion[]> = {
  TECHNICAL: [
    {
      id: "t1",
      question: "Explain the difference between a process and a thread, and when you'd use threads.",
      idealKeywords: ["process", "memory", "thread", "shared", "context", "parallel", "resource", "os"],
      maxScore: 20,
    },
    {
      id: "t2",
      question: "Describe how you would design a REST API to let users create and read blog posts. Mention endpoints and HTTP methods.",
      idealKeywords: ["rest", "endpoint", "get", "post", "api", "resource", "json", "stateless", "crud"],
      maxScore: 20,
    },
    {
      id: "t3",
      question: "What is the time complexity of searching in a balanced binary search tree, and why?",
      idealKeywords: ["log", "o(log", "height", "balance", "divide", "search", "node"],
      maxScore: 20,
    },
    {
      id: "t4",
      question: "Write a short pseudocode to find the second largest number in an array without sorting.",
      idealKeywords: ["loop", "largest", "second", "array", "compare", "scan", "max"],
      maxScore: 20,
    },
    {
      id: "t5",
      question: "How do you handle errors and edge cases in production code? Give one concrete example.",
      idealKeywords: ["error", "null", "empty", "validation", "exception", "catch", "test", "edge"],
      maxScore: 20,
    },
  ],
  HR: [
    {
      id: "h1",
      question: "Tell me about yourself in 2 minutes — connect your background to the role you're applying for.",
      idealKeywords: ["degree", "skill", "project", "role", "interest", "learn", "goal", "passion"],
      maxScore: 20,
    },
    {
      id: "h2",
      question: "What are your career goals for the next 3 years?",
      idealKeywords: ["goal", "learn", "skill", "role", "growth", "plan", "improve", "career"],
      maxScore: 20,
    },
    {
      id: "h3",
      question: "What are your strengths and one weakness? How do you manage the weakness?",
      idealKeywords: ["strength", "weakness", "improve", "practice", "feedback", "work", "aware"],
      maxScore: 20,
    },
    {
      id: "h4",
      question: "Why should we hire you for this role?",
      idealKeywords: ["skill", "project", "value", "team", "result", "role", "experience", "fit"],
      maxScore: 20,
    },
    {
      id: "h5",
      question: "Where do you see yourself and what salary expectations do you have?",
      idealKeywords: ["role", "market", "expectation", "growth", "range", "research", "company", "value"],
      maxScore: 20,
    },
  ],
  BEHAVIORAL: [
    {
      id: "b1",
      question: "Tell me about a time you had to meet a tight deadline. What did you do?",
      idealKeywords: ["deadline", "plan", "priority", "task", "time", "schedule", "deliver", "focused"],
      maxScore: 20,
    },
    {
      id: "b2",
      question: "Describe a conflict with a teammate and how you resolved it.",
      idealKeywords: ["conflict", "listen", "communicate", "team", "resolve", "agree", "compromise", "respect"],
      maxScore: 20,
    },
    {
      id: "b3",
      question: "Give an example of a failure and what you learned from it.",
      idealKeywords: ["failed", "mistake", "learned", "improve", "reflect", "tried", "result", "growth"],
      maxScore: 20,
    },
    {
      id: "b4",
      question: "Tell me about a project you led. How did you manage the team?",
      idealKeywords: ["led", "team", "plan", "assign", "coordinate", "goal", "milestone", "deliver"],
      maxScore: 20,
    },
    {
      id: "b5",
      question: "Describe a situation where you went beyond your job description to help.",
      idealKeywords: ["initiative", "extra", "helped", "volunteered", "team", "proactive", "result", "impact"],
      maxScore: 20,
    },
  ],
};

export function scoreAnswerWithKeywords(answer: string, keywords: string[]): number {
  const text = answer.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) hits++;
  }
  return Math.round((hits / Math.max(1, keywords.length)) * 100);
}

export function gradeAiAnswer(answer: string, q: AiQuestion): { score: number; comment: string } {
  const score = scoreAnswerWithKeywords(answer, q.idealKeywords);
  if (score >= 70) return { score, comment: "Strong response — good use of key concepts." };
  if (score >= 40) return { score, comment: "Solid attempt — add more specific details and examples." };
  return { score, comment: "Too brief — expand with structured points and examples." };
}
