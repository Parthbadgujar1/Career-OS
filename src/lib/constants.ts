export const ROLES = {
  STUDENT: "STUDENT",
  MENTOR: "MENTOR",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEGREES = [
  "B.Tech",
  "B.E",
  "B.Sc",
  "BCA",
  "BBA",
  "MBA",
  "MCA",
  "M.Tech",
  "M.Sc",
] as const;

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "Final Year"] as const;

export const CAREER_ROLES = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "UI/UX Designer",
  "Product Manager",
  "QA / Test Engineer",
  "DevOps Engineer",
  "Finance Analyst",
  "Marketing Analyst",
  "Business Analyst",
] as const;

export const INDUSTRIES = [
  "IT Services",
  "Product / SaaS",
  "Fintech",
  "E-commerce",
  "Health Tech",
  "EdTech",
  "AI & ML",
  "Consulting",
  "Banking",
  "Startups",
  "Gaming",
  "Cybersecurity",
] as const;

export const INTERESTS = [
  "Competitive Programming",
  "Web Development",
  "Data & Analytics",
  "Artificial Intelligence",
  "App Development",
  "UI/UX",
  "Cloud & DevOps",
  "Open Source",
  "Cybersecurity",
  "Product & Startups",
  "Finance",
  "Marketing",
] as const;

export const TASK_CATEGORIES = {
  LEARNING: "LEARNING",
  CODING: "CODING",
  PROJECT: "PROJECT",
  PROFILE: "PROFILE",
  INTERVIEW: "INTERVIEW",
  OPPORTUNITY: "OPPORTUNITY",
} as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[keyof typeof TASK_CATEGORIES];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  LEARNING: "Learn",
  CODING: "Code",
  PROJECT: "Project",
  PROFILE: "Profile",
  INTERVIEW: "Interview",
  OPPORTUNITY: "Opportunity",
};

export const PRIORITIES = ["HIGH", "NORMAL", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

// Readiness score dimensions with default weights (Section 9 of the blueprint)
export const READINESS_DIMENSIONS = [
  { key: "coreSkills", label: "Core Technical Skills", weight: 20 },
  { key: "coding", label: "Coding / DSA", weight: 15 },
  { key: "projects", label: "Projects / Portfolio", weight: 15 },
  { key: "profiles", label: "Resume + LinkedIn + GitHub", weight: 10 },
  { key: "aptitude", label: "Aptitude / Assessments", weight: 10 },
  { key: "interview", label: "Interview Readiness", weight: 15 },
  { key: "consistency", label: "Consistency / Execution", weight: 5 },
  { key: "careerActivities", label: "Hackathons / Quizzes / Events", weight: 5 },
  { key: "roleReadiness", label: "Role-Specific Readiness", weight: 5 },
] as const;

export type DimensionKey = (typeof READINESS_DIMENSIONS)[number]["key"];
export type DimensionScores = Record<DimensionKey, number>;

// Opportunity gateway portals (Section 7 of the blueprint)
export const OPPORTUNITY_PLATFORMS = [
  { id: "roadmap.sh", label: "Roadmap.sh", baseUrl: "https://roadmap.sh", color: "#0a0a0a" },
  { id: "internshala", label: "Internshala", baseUrl: "https://internshala.com", color: "#14919b" },
  { id: "linkedin", label: "LinkedIn", baseUrl: "https://www.linkedin.com/jobs", color: "#0a66c2" },
  { id: "naukri", label: "Naukri", baseUrl: "https://www.naukri.com", color: "#ff5733" },
  { id: "indeed", label: "Indeed", baseUrl: "https://www.indeed.com", color: "#2164f3" },
  { id: "unstop", label: "Unstop", baseUrl: "https://unstop.com", color: "#7b2ff7" },
] as const;
