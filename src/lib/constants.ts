export const ROLES = {
  STUDENT: "STUDENT",
  MENTOR: "MENTOR",
  ADMIN: "ADMIN",
  EMPLOYER: "EMPLOYER",
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

export const DEGREE_SPECIALIZATIONS: Record<(typeof DEGREES)[number], string[]> = {
  "B.Tech": [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Artificial Intelligence & ML",
    "Data Science",
    "Cyber Security",
    "Software Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Robotics & Automation",
  ],
  "B.E": [
    "Computer Science",
    "Information Science",
    "Electronics & Communication",
    "Electrical & Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Artificial Intelligence & ML",
    "Data Science",
    "Cyber Security",
    "Robotics & Automation",
  ],
  "B.Sc": [
    "Computer Science",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biotechnology",
    "Statistics",
    "Data Science",
    "Electronics",
    "Animation & Multimedia",
    "Zoology",
    "Agriculture",
  ],
  BCA: [
    "Computer Applications",
    "Software Development",
    "Data Science",
    "Cyber Security",
    "Cloud Computing",
    "Artificial Intelligence & ML",
  ],
  BBA: [
    "General Management",
    "Marketing",
    "Finance",
    "Human Resources",
    "Operations",
    "Business Analytics",
    "International Business",
    "Entrepreneurship",
    "Digital Marketing",
  ],
  MBA: [
    "Marketing",
    "Finance",
    "Human Resources",
    "Operations",
    "Business Analytics",
    "Information Technology",
    "Supply Chain",
    "International Business",
    "Consulting",
    "Entrepreneurship",
    "Healthcare Management",
  ],
  MCA: [
    "Software Development",
    "Data Science",
    "Artificial Intelligence & ML",
    "Cloud Computing",
    "Cyber Security",
    "System Administration",
  ],
  "M.Tech": [
    "Computer Science",
    "Artificial Intelligence & ML",
    "Data Science",
    "VLSI Design",
    "Embedded Systems",
    "Power Systems",
    "Structural Engineering",
    "Communication Systems",
  ],
  "M.Sc": [
    "Computer Science",
    "Data Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Statistics",
    "Biotechnology",
    "Economics",
    "Electronics",
  ],
};

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "Final Year"] as const;

export const ROADMAP_DURATIONS = [
  { weeks: 4, label: "4 Weeks", short: "4w", description: "Rapid sprint — focused push" },
  { weeks: 8, label: "8 Weeks", short: "8w", description: "Two-month intensive" },
  { weeks: 12, label: "12 Weeks", short: "12w", description: "One-semester plan" },
  { weeks: 52, label: "1 Year", short: "1y", description: "Full-year structured journey" },
  { weeks: 104, label: "2 Years", short: "2y", description: "Deeper mastery & projects" },
  { weeks: 208, label: "4 Years", short: "4y", description: "Degree-long roadmap" },
] as const;

export function durationLabel(weeks: number): string {
  return ROADMAP_DURATIONS.find((d) => d.weeks === weeks)?.label ?? `${weeks} Weeks`;
}

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

export const CAREER_ROLES_BY_DEGREE: Record<(typeof DEGREES)[number], string[]> = {
  "B.Tech": [
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI/ML Engineer",
    "DevOps Engineer",
    "QA / Test Engineer",
    "Cyber Security Analyst",
    "Cloud Engineer",
    "Mobile App Developer",
    "Product Manager",
    "UI/UX Designer",
  ],
  "B.E": [
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI/ML Engineer",
    "DevOps Engineer",
    "QA / Test Engineer",
    "Cyber Security Analyst",
    "Cloud Engineer",
    "Product Manager",
  ],
  "B.Sc": [
    "Data Analyst",
    "Data Scientist",
    "Software Developer",
    "Research Analyst",
    "Statistician",
    "Quality Analyst",
    "Bioinformatics Analyst",
    "Product Manager",
    "UI/UX Designer",
  ],
  BCA: [
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "QA / Test Engineer",
    "DevOps Engineer",
    "Cyber Security Analyst",
    "Cloud Engineer",
    "AI/ML Engineer",
  ],
  BBA: [
    "Product Manager",
    "Business Analyst",
    "Marketing Analyst",
    "Finance Analyst",
    "HR Specialist",
    "Operations Manager",
    "Sales & Business Development",
    "Digital Marketing Specialist",
    "Management Consultant",
    "Data Analyst",
    "Supply Chain Analyst",
  ],
  MBA: [
    "Product Manager",
    "Business Analyst",
    "Marketing Analyst",
    "Finance Analyst",
    "HR Specialist",
    "Operations Manager",
    "Digital Marketing Specialist",
    "Management Consultant",
    "Investment Banker",
    "Data Analyst",
    "Supply Chain Analyst",
    "Business Development Manager",
  ],
  MCA: [
    "Software Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "AI/ML Engineer",
    "DevOps Engineer",
    "QA / Test Engineer",
    "Cyber Security Analyst",
    "Cloud Engineer",
    "Product Manager",
  ],
  "M.Tech": [
    "Software Developer",
    "Data Scientist",
    "AI/ML Engineer",
    "Research Engineer",
    "Data Analyst",
    "DevOps Engineer",
    "Cloud Engineer",
    "Embedded Systems Engineer",
    "Product Manager",
  ],
  "M.Sc": [
    "Data Scientist",
    "Data Analyst",
    "Research Scientist",
    "Statistician",
    "Bioinformatics Analyst",
    "Quality Analyst",
    "Software Developer",
    "Product Manager",
  ],
};

// Skill categories shown in onboarding for each degree
export const SKILL_CATEGORIES_BY_DEGREE: Record<(typeof DEGREES)[number], string[]> = {
  "B.Tech": ["LANGUAGES", "CS_FUNDAMENTALS", "DATA", "AI", "TOOLS", "SOFT_SKILLS", "CLOUD", "CYBER", "MOBILE", "DESIGN"],
  "B.E": ["LANGUAGES", "CS_FUNDAMENTALS", "DATA", "AI", "TOOLS", "SOFT_SKILLS", "CLOUD", "CYBER", "MOBILE", "DESIGN"],
  "B.Sc": ["LANGUAGES", "DATA", "AI", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS", "CLOUD", "DESIGN"],
  BCA: ["LANGUAGES", "CS_FUNDAMENTALS", "DATA", "AI", "TOOLS", "SOFT_SKILLS", "CLOUD", "CYBER", "MOBILE", "DESIGN"],
  BBA: ["BUSINESS", "MARKETING", "FINANCE", "DATA", "SOFT_SKILLS"],
  MBA: ["BUSINESS", "MARKETING", "FINANCE", "DATA", "SOFT_SKILLS"],
  MCA: ["LANGUAGES", "CS_FUNDAMENTALS", "DATA", "AI", "TOOLS", "SOFT_SKILLS", "CLOUD", "CYBER", "MOBILE", "DESIGN"],
  "M.Tech": ["LANGUAGES", "CS_FUNDAMENTALS", "DATA", "AI", "TOOLS", "SOFT_SKILLS", "CLOUD", "CYBER", "MOBILE", "DESIGN"],
  "M.Sc": ["DATA", "AI", "LANGUAGES", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS", "CLOUD", "DESIGN"],
};

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

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  LANGUAGES: "Languages",
  DATA: "Data",
  AI: "AI",
  WEB: "Web",
  CS_FUNDAMENTALS: "CS Fundamentals",
  SOFT_SKILLS: "Soft Skills",
  TOOLS: "Tools",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  BUSINESS: "Business & Management",
  DESIGN: "Design",
  CLOUD: "Cloud & DevOps",
  CYBER: "Cybersecurity",
  MOBILE: "Mobile Development",
};

// Interests auto-suggested per target role (drives the dynamic "Interests" step)
export const ROLE_INTERESTS: Record<string, readonly string[]> = {
  "Software Developer": ["Competitive Programming", "Web Development", "Open Source"],
  "Frontend Developer": ["Web Development", "UI/UX", "Open Source"],
  "Backend Developer": ["Web Development", "Competitive Programming", "Open Source"],
  "Full-Stack Developer": ["Web Development", "App Development", "Open Source"],
  "Mobile App Developer": ["App Development", "Web Development"],
  "Data Analyst": ["Data & Analytics", "Finance"],
  "Data Scientist": ["Data & Analytics", "Artificial Intelligence"],
  "AI/ML Engineer": ["Artificial Intelligence", "Data & Analytics"],
  "Research Analyst": ["Data & Analytics"],
  "Research Scientist": ["Artificial Intelligence", "Data & Analytics"],
  "Research Engineer": ["Artificial Intelligence", "Data & Analytics"],
  "Statistician": ["Data & Analytics", "Finance"],
  "Quality Analyst": ["Data & Analytics"],
  "Bioinformatics Analyst": ["Data & Analytics", "Artificial Intelligence"],
  "UI/UX Designer": ["UI/UX", "App Development"],
  "Product Manager": ["Product & Startups", "Marketing"],
  "Business Analyst": ["Data & Analytics", "Product & Startups"],
  "Marketing Analyst": ["Marketing", "Data & Analytics"],
  "Finance Analyst": ["Finance", "Data & Analytics"],
  "HR Specialist": ["Marketing", "Product & Startups"],
  "Operations Manager": ["Product & Startups", "Finance"],
  "Sales & Business Development": ["Marketing", "Product & Startups"],
  "Digital Marketing Specialist": ["Marketing"],
  "Management Consultant": ["Product & Startups", "Finance"],
  "Supply Chain Analyst": ["Data & Analytics", "Finance"],
  "Investment Banker": ["Finance"],
  "Business Development Manager": ["Marketing", "Product & Startups"],
  "QA / Test Engineer": ["Web Development", "Competitive Programming"],
  "DevOps Engineer": ["Cloud & DevOps", "Open Source", "Cybersecurity"],
  "Cyber Security Analyst": ["Cybersecurity", "Cloud & DevOps"],
  "Cloud Engineer": ["Cloud & DevOps", "Open Source"],
  "Embedded Systems Engineer": ["App Development", "Cybersecurity"],
};

// Skill categories prioritized per target role (drives the dynamic skill-level step)
export const ROLE_SKILL_CATEGORIES: Record<string, readonly string[]> = {
  "Software Developer": ["LANGUAGES", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS"],
  "Frontend Developer": ["TOOLS", "LANGUAGES", "CS_FUNDAMENTALS", "SOFT_SKILLS"],
  "Backend Developer": ["LANGUAGES", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS"],
  "Full-Stack Developer": ["TOOLS", "LANGUAGES", "CS_FUNDAMENTALS", "SOFT_SKILLS"],
  "Mobile App Developer": ["MOBILE", "TOOLS", "LANGUAGES", "CS_FUNDAMENTALS", "SOFT_SKILLS"],
  "Data Analyst": ["DATA", "LANGUAGES", "SOFT_SKILLS"],
  "Data Scientist": ["DATA", "AI", "LANGUAGES", "SOFT_SKILLS"],
  "AI/ML Engineer": ["AI", "DATA", "LANGUAGES", "SOFT_SKILLS"],
  "Research Analyst": ["DATA", "AI", "SOFT_SKILLS"],
  "Research Scientist": ["DATA", "AI", "SOFT_SKILLS"],
  "Research Engineer": ["AI", "DATA", "LANGUAGES", "SOFT_SKILLS"],
  "Statistician": ["DATA", "AI", "SOFT_SKILLS"],
  "Quality Analyst": ["DATA", "SOFT_SKILLS"],
  "Bioinformatics Analyst": ["DATA", "AI", "SOFT_SKILLS"],
  "UI/UX Designer": ["DESIGN", "TOOLS", "LANGUAGES", "SOFT_SKILLS"],
  "Product Manager": ["BUSINESS", "MARKETING", "DATA", "SOFT_SKILLS"],
  "Business Analyst": ["BUSINESS", "DATA", "SOFT_SKILLS"],
  "Marketing Analyst": ["MARKETING", "DATA", "SOFT_SKILLS"],
  "Finance Analyst": ["FINANCE", "DATA", "SOFT_SKILLS"],
  "HR Specialist": ["BUSINESS", "SOFT_SKILLS"],
  "Operations Manager": ["BUSINESS", "DATA", "SOFT_SKILLS"],
  "Sales & Business Development": ["MARKETING", "BUSINESS", "SOFT_SKILLS"],
  "Digital Marketing Specialist": ["MARKETING", "BUSINESS", "DATA", "SOFT_SKILLS"],
  "Management Consultant": ["BUSINESS", "FINANCE", "DATA", "SOFT_SKILLS"],
  "Supply Chain Analyst": ["BUSINESS", "DATA", "SOFT_SKILLS"],
  "Investment Banker": ["FINANCE", "BUSINESS", "DATA", "SOFT_SKILLS"],
  "Business Development Manager": ["MARKETING", "BUSINESS", "SOFT_SKILLS"],
  "QA / Test Engineer": ["LANGUAGES", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS"],
  "DevOps Engineer": ["CLOUD", "TOOLS", "CS_FUNDAMENTALS", "LANGUAGES", "SOFT_SKILLS"],
  "Cyber Security Analyst": ["CYBER", "CS_FUNDAMENTALS", "CLOUD", "LANGUAGES", "SOFT_SKILLS"],
  "Cloud Engineer": ["CLOUD", "TOOLS", "CS_FUNDAMENTALS", "LANGUAGES", "SOFT_SKILLS"],
  "Embedded Systems Engineer": ["LANGUAGES", "CS_FUNDAMENTALS", "TOOLS", "SOFT_SKILLS"],
};

function interestsForSpecializationKeyword(spec: string): string[] {
  const s = spec.toLowerCase();
  if (s.includes("artificial") || s.includes("machine learning")) return ["Artificial Intelligence", "Data & Analytics"];
  if (s.includes("data") || s.includes("statistics") || s.includes("analytics")) return ["Data & Analytics", "Artificial Intelligence"];
  if (s.includes("cyber")) return ["Cybersecurity", "Cloud & DevOps"];
  if (s.includes("cloud") || s.includes("system administration")) return ["Cloud & DevOps", "Open Source"];
  if (s.includes("information")) return ["Web Development", "Open Source"];
  if (s.includes("software") || s.includes("computer") || s.includes("application") || s.includes("multimedia") || s.includes("animation"))
    return ["Web Development", "Competitive Programming"];
  if (s.includes("marketing") || s.includes("digital market")) return ["Marketing"];
  if (s.includes("finance") || s.includes("investment") || s.includes("banking")) return ["Finance"];
  if (s.includes("human") || s.includes("hr")) return ["Marketing", "Product & Startups"];
  if (s.includes("operation") || s.includes("management") || s.includes("business") || s.includes("supply chain"))
    return ["Product & Startups", "Marketing"];
  if (s.includes("electronics") || s.includes("vlsi") || s.includes("embedded") || s.includes("robotics") || s.includes("electrical") || s.includes("communication") || s.includes("aerospace"))
    return ["App Development", "Web Development"];
  return [];
}

function skillCategoriesForSpecializationKeyword(spec: string): string[] {
  const s = spec.toLowerCase();
  if (s.includes("marketing") || s.includes("digital market")) return ["MARKETING", "DATA", "SOFT_SKILLS"];
  if (s.includes("finance") || s.includes("investment") || s.includes("banking")) return ["FINANCE", "DATA", "SOFT_SKILLS"];
  if (s.includes("human") || s.includes("hr")) return ["BUSINESS", "SOFT_SKILLS"];
  if (s.includes("operation") || s.includes("supply chain") || s.includes("consult") || s.includes("entrepreneurship") || s.includes("international business") || s.includes("healthcare management") || s.includes("management") || s.includes("business analytics"))
    return ["BUSINESS", "DATA", "SOFT_SKILLS"];
  if (s.includes("cloud") || s.includes("system administration")) return ["CLOUD", "TOOLS", "CS_FUNDAMENTALS"];
  if (s.includes("cyber")) return ["CYBER", "CS_FUNDAMENTALS", "LANGUAGES"];
  if (s.includes("artificial") || s.includes("machine learning")) return ["AI", "DATA", "LANGUAGES"];
  if (s.includes("software") || s.includes("computer") || s.includes("application") || s.includes("information") || s.includes("multimedia") || s.includes("animation") || s.includes("electronics") || s.includes("vlsi") || s.includes("embedded") || s.includes("robotics") || s.includes("electrical") || s.includes("communication") || s.includes("aerospace"))
    return ["LANGUAGES", "CS_FUNDAMENTALS", "TOOLS"];
  if (s.includes("data") || s.includes("statistics") || s.includes("analytics") || s.includes("mathematics") || s.includes("physics") || s.includes("chemistry") || s.includes("biotech") || s.includes("zoology") || s.includes("agriculture") || s.includes("economics"))
    return ["DATA", "AI"];
  return [];
}

export function interestsForRole(role: string): string[] {
  return (ROLE_INTERESTS[role] ?? []).filter((i) => (INTERESTS as readonly string[]).includes(i));
}

export function interestsForSpecialization(spec: string): string[] {
  return interestsForSpecializationKeyword(spec).filter((i) => (INTERESTS as readonly string[]).includes(i));
}

// Combined recommended interests for the current specialization + selected roles
export function recommendedInterests(specialization: string, roles: string[]): string[] {
  const out: string[] = [];
  for (const v of [...interestsForSpecialization(specialization), ...roles.flatMap(interestsForRole)]) {
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

// Skill categories to show: degree list as the fallback, otherwise the union of
// specialization + role categories so the fields always match the selections
export function visibleSkillCategories(degree: string, specialization: string, roles: string[]): string[] {
  const base = (SKILL_CATEGORIES_BY_DEGREE[degree as keyof typeof SKILL_CATEGORIES_BY_DEGREE] ?? []) as string[];
  if (base.length === 0) return [];
  const focus: string[] = [];
  for (const v of [...skillCategoriesForSpecializationKeyword(specialization), ...roles.flatMap((r) => ROLE_SKILL_CATEGORIES[r] ?? [])]) {
    if (!focus.includes(v)) focus.push(v);
  }
  if (focus.length === 0) return base;
  return focus;
}

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

export const INTERVIEW_TYPES = ["TECHNICAL", "HR", "BEHAVIORAL"] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const APPLICATION_STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "COMPLETED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function formatInterviewType(type: string): string {
  const map: Record<string, string> = {
    TECHNICAL: "Technical",
    HR: "HR",
    BEHAVIORAL: "Behavioral",
    AI: "AI",
    MENTOR_MEET: "Mentor Meet",
  };
  return map[type] ?? type;
}
