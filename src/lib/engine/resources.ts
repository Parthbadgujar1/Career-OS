import "server-only";

// ── Curated free learning resources ────────────────────────────────────────
// Deterministic fallback for roadmap weekly milestones. When AI is available it
// picks role-specific links; this library guarantees no-milestone-goes-bare.

export interface LearningResource {
  name: string;
  url: string;
  kind: "roadmap" | "course" | "practice" | "docs" | "community" | "cert";
}

// roadmap.sh path per target role — the single most useful "what to learn next"
// map for every tech/data/product role.
export const ROLE_ROADMAP_PATHS: Record<string, string> = {
  "Software Developer": "https://roadmap.sh/computer-science",
  "Frontend Developer": "https://roadmap.sh/frontend",
  "Backend Developer": "https://roadmap.sh/backend",
  "Full-Stack Developer": "https://roadmap.sh/full-stack",
  "AI/ML Engineer": "https://roadmap.sh/ai-engineer",
  "Data Scientist": "https://roadmap.sh/ai-data-scientist",
  "Data Analyst": "https://roadmap.sh/data-analyst",
  "DevOps Engineer": "https://roadmap.sh/devops",
  "Cloud Engineer": "https://roadmap.sh/cloud",
  "Cyber Security Analyst": "https://roadmap.sh/cyber-security",
  "Mobile App Developer": "https://roadmap.sh/android",
  "QA / Test Engineer": "https://roadmap.sh/qa",
  "Product Manager": "https://roadmap.sh/product-manager",
  "UI/UX Designer": "https://roadmap.sh/ux-design",
  "Data Engineer": "https://roadmap.sh/data-engineer",
  "Blockchain Developer": "https://roadmap.sh/blockchain",
  "PostgreSQL / DBA": "https://roadmap.sh/postgresql-dba",
  "Technical Writer": "https://roadmap.sh/technical-writer",
  "Database Engineer": "https://roadmap.sh/postgresql-dba",
};

// Topic keyword → high-quality, always-free resources (YouTube courses are the
// primary "watch & learn" slot as the user asked for).
const TOPIC_RESOURCES: Array<{ match: string[]; resources: LearningResource[] }> = [
  {
    match: ["sql"],
    resources: [
      { name: "SQL for beginners (freeCodeCamp · 4.5h)", url: "https://www.youtube.com/watch?v=5OdVJTHN0Bo", kind: "course" },
      { name: "SQLZoo — free interactive SQL", url: "https://sqlzoo.net/wiki/SQL_Tutorial", kind: "practice" },
      { name: "Mode Analytics SQL tutorial", url: "https://mode.com/sql-tutorial/", kind: "course" },
    ],
  },
  {
    match: ["python", "pandas", "numpy", "data analys"],
    resources: [
      { name: "Python for Everybody (freeFullCourse)", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", kind: "course" },
      { name: "Kaggle Learn — Python & pandas", url: "https://www.kaggle.com/learn/python", kind: "course" },
      { name: "Python off docs", url: "https://docs.python.org/3/tutorial/", kind: "docs" },
    ],
  },
  {
    match: ["javascript", "js"],
    resources: [
      { name: "JavaScript freeCodeCamp cert", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", kind: "course" },
      { name: "Eloquent JavaScript (free ebook)", url: "https://eloquentjavascript.net/", kind: "docs" },
      { name: "JavaScript.info", url: "https://javascript.info/", kind: "course" },
    ],
  },
  {
    match: ["react"],
    resources: [
      { name: "React docs — learn", url: "https://react.dev/learn", kind: "docs" },
      { name: "React course (freeCodeCamp)", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/", kind: "course" },
      { name: "Scrimba React (free)", url: "https://scrimba.com/learn/learnreact", kind: "course" },
    ],
  },
  {
    match: ["html", "css"],
    resources: [
      { name: "The Odin Project — free full-stack", url: "https://www.theodinproject.com/", kind: "course" },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org/", kind: "docs" },
      { name: "FreeCodeCamp responsive web design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", kind: "course" },
    ],
  },
  {
    match: ["data structure", "algorithm", "dsa", "problem solv"],
    resources: [
      { name: "DSA (freeCodeCamp · 40h collection)", url: "https://www.youtube.com/playlist?list=PLWKjhJtqVAblfum5UrnUn4IAKts_NJhfe", kind: "course" },
      { name: "LeetCode — free practice", url: "https://leetcode.com/problemset/all/", kind: "practice" },
      { name: "GeeksforGeeks DSA articles", url: "https://www.geeksforgeeks.org/data-structures/", kind: "practice" },
    ],
  },
  {
    match: ["machine learning", "ml", "deep learning", "neural", "pytorch", "tensorflow", "ai/ml"],
    resources: [
      { name: "DeepLearning.AI short courses", url: "https://www.deeplearning.ai/short-courses/", kind: "course" },
      { name: "Kaggle Learn — intro to ML", url: "https://www.kaggle.com/learn/intro-to-machine-learning", kind: "course" },
      { name: "freeCodeCamp ML course", url: "https://www.freecodecamp.org/learn/machine-learning-with-python/", kind: "course" },
    ],
  },
  {
    match: ["statistics", "statist", "probability"],
    resources: [
      { name: "StatQuest — statistics on YouTube", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsYD", kind: "course" },
      { name: "Khan Academy statistics", url: "https://www.khanacademy.org/math/statistics-probability", kind: "course" },
    ],
  },
  {
    match: ["excel"],
    resources: [
      { name: "Excel course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=Vl0H-qTclOg", kind: "course" },
      { name: "ExcelJet tips & formulas", url: "https://exceljet.net/", kind: "docs" },
    ],
  },
  {
    match: ["power bi", "tableau", "dashboard", "visualiz"],
    resources: [
      { name: "Power BI courses (free)", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/", kind: "course" },
      { name: "Tableau free training videos", url: "https://www.tableau.com/learn/training", kind: "course" },
    ],
  },
  {
    match: ["system design", "api", "rest", "backend", "node", "graphql"],
    resources: [
      { name: "roadmap.sh/backend", url: "https://roadmap.sh/backend", kind: "roadmap" },
      { name: "System Design Primer (free)", url: "https://github.com/donnemartin/system-design-primer", kind: "docs" },
      { name: "freeCodeCamp backend cert", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", kind: "course" },
    ],
  },
  {
    match: ["operating system", "os ", "linux", "shell", "networking"],
    resources: [
      { name: "freeCodeCamp Linux course", url: "https://www.youtube.com/watch?v=ROjZy1Wb3IA", kind: "course" },
      { name: "The Missing Semester of CS", url: "https://missing.csail.mit.edu/", kind: "course" },
    ],
  },
  {
    match: ["docker", "kubernetes", "devops", "ci/cd", "cloud"],
    resources: [
      { name: "roadmap.sh/devops", url: "https://roadmap.sh/devops", kind: "roadmap" },
      { name: "KodeKloud free labs", url: "https://kodekloud.com/", kind: "course" },
      { name: "AWS free tier + Skill Builder", url: "https://aws.amazon.com/training/", kind: "course" },
    ],
  },
  {
    match: ["security", "cyber", "hack"],
    resources: [
      { name: "TryHackMe — free hands-on labs", url: "https://tryhackme.com/", kind: "practice" },
      { name: "Professor Messer Security+ (free)", url: "https://www.professormesser.com/security-plus/sy0-701-comptia-security-plus-course/", kind: "course" },
      { name: "HackTheBox Academy basics", url: "https://academy.hackthebox.com/", kind: "practice" },
    ],
  },
  {
    match: ["figma", "design", "ux", "ui"],
    resources: [
      { name: "Figma Learn — free design course", url: "https://www.figma.com/learn/", kind: "course" },
      { name: "Google UX Design certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", kind: "cert" },
      { name: "NN/g — free UX articles", url: "https://www.nngroup.com/articles/", kind: "docs" },
    ],
  },
  {
    match: ["product", "pm ", "prd", "market", "agile", "scrum"],
    resources: [
      { name: "Lenny's Newsletter (free)", url: "https://www.lennysnewsletter.com/", kind: "docs" },
      { name: "Product School free resources", url: "https://productschool.com/resources", kind: "course" },
      { name: "Google PM certificate", url: "https://www.coursera.org/professional-certificates/google-project-management", kind: "cert" },
    ],
  },
  {
    match: ["interview", "resume", "linkedin", "profile"],
    resources: [
      { name: "Video: how to crack placement interviews", url: "https://www.youtube.com/results?search_query=how+to+crack+placement+interview+freshers", kind: "course" },
      { name: "Resume guide (free)", url: "https://resumegenius.com/blog/resume-help/resume-examples", kind: "docs" },
      { name: "LinkedIn free profile tips", url: "https://www.linkedin.com/learning/", kind: "course" },
    ],
  },
  {
    match: ["marketing", "seo", "ads", "social", "content"],
    resources: [
      { name: "Google Digital Garage (free)", url: "https://learndigital.withgoogle.com/digitalgarage", kind: "cert" },
      { name: "HubSpot Academy (free certs)", url: "https://academy.hubspot.com/", kind: "course" },
      { name: "Google Analytics Academy", url: "https://analytics.google.com/analytics/academy/", kind: "course" },
    ],
  },
  {
    match: ["finance", "modeling", "valuation", "accounting"],
    resources: [
      { name: "Investopedia — free tutorials", url: "https://www.investopedia.com/", kind: "docs" },
      { name: "CFI free courses", url: "https://corporatefinanceinstitute.com/free-courses/", kind: "course" },
    ],
  },
];

// Category-agnostic pads so every milestone carries at least one actionable link.
const CATEGORY_PADS: Record<string, LearningResource[]> = {
  LEARNING: [
    { name: "roadmap.sh — pick your path", url: "https://roadmap.sh/", kind: "roadmap" },
    { name: "YouTube · freeCodeCamp full courses", url: "https://www.youtube.com/@freecodecamp/playlists", kind: "course" },
    { name: "CS50x — Harvard (free)", url: "https://cs50.harvard.edu/x/", kind: "course" },
  ],
  CODING: [
    { name: "LeetCode problems", url: "https://leetcode.com/problemset/", kind: "practice" },
    { name: "GeeksforGeeks practice", url: "https://www.geeksforgeeks.org/", kind: "practice" },
    { name: "HackerRank — free challenges", url: "https://www.hackerrank.com/domains", kind: "practice" },
  ],
  PROJECT: [
    { name: "Build ideas → real repos (free)", url: "https://github.com/collections/project-ideas", kind: "docs" },
    { name: "FreeCodeCamp project prompts", url: "https://www.freecodecamp.org/", kind: "practice" },
  ],
  PROFILE: [
    { name: "Build a free GitHub portfolio", url: "https://docs.github.com/en/get-started", kind: "docs" },
    { name: "LinkedIn free profile review tips", url: "https://www.linkedin.com/help/linkedin/", kind: "docs" },
  ],
  INTERVIEW: [
    { name: "Mock interview practice (free)", url: "https://www.pramp.com/", kind: "practice" },
    { name: "Interview prep videos (YouTube)", url: "https://www.youtube.com/results?search_query=interview+preparation+for+freshers", kind: "course" },
  ],
  OPPORTUNITY: [
    { name: "Internshala — free student listings", url: "https://internshala.com/internships", kind: "community" },
    { name: "Unstop — competitions & jobs", url: "https://unstop.com/", kind: "community" },
    { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/", kind: "community" },
  ],
};

const GENERIC_ROADMAP = { name: "roadmap.sh — find your path", url: "https://roadmap.sh/", kind: "roadmap" as const };

function normalize(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function topicMatches(topic: string): LearningResource[] {
  const t = normalize(topic);
  for (const group of TOPIC_RESOURCES) {
    if (group.match.some((m) => t.includes(normalize(m)))) {
      return group.resources;
    }
  }
  return [];
}

function dedupe(resources: LearningResource[]): LearningResource[] {
  const seen = new Set<string>();
  const out: LearningResource[] = [];
  for (const r of resources) {
    const key = r.url;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

/**
 * Deterministic, role-aware resource list for a milestone. Always includes:
 * the role's roadmap.sh path (or a generic path), topic-specific free courses
 * when the topic matches, and a category-level practice/docs pad. Max 4.
 */
export function resourcesFor(role: string, category: string, topic?: string): LearningResource[] {
  const rolePath = ROLE_ROADMAP_PATHS[role];
  const roadmap = rolePath
    ? [{ name: `roadmap.sh — ${role} path`, url: rolePath, kind: "roadmap" as const }]
    : [GENERIC_ROADMAP];

  const matched = topic ? topicMatches(topic) : [];
  const pads = CATEGORY_PADS[category] ?? CATEGORY_PADS.LEARNING;

  return dedupe([...roadmap, ...matched, ...pads]).slice(0, 4);
}