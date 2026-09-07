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

// ── Academic year math for year-wise roadmaps ──────────────────────────────
// Roadmaps span the student's remaining college years; weeks are grouped back
// into academic years so the plan reads "Year 1 → Year 2 → ..." not "week 51".

export const WEEKS_PER_YEAR = 52;

export function academicYearsForDegree(degree?: string | null): number {
  const d = (degree ?? "").toLowerCase();
  if (/(mbbs|bds|barch)/.test(d)) return 5;
  if (/(b\.?tech|btech|b\.?e\b|be\b|engineering)/.test(d)) return 4;
  if (/(m\.?tech|mtech|m\.?ca|mca|m\.?ba|mba|m\.?sc|msc|pgdm)/.test(d)) return 2;
  if (/(b\.?sc|bsc|bca|b\.?ba|bba|b\.?com|bcom|b\.?a\b|ba\b)/.test(d)) return 3;
  return 3;
}

/** "1st Year" → 1, "Final Year" → 0 (unknown single-digit year). */
export function yearIndexFromLabel(year?: string | null): number {
  const y = (year ?? "").toLowerCase().replace("year", "").trim();
  if (/^1/.test(y)) return 1;
  if (/^2/.test(y)) return 2;
  if (/^3/.test(y)) return 3;
  if (/^4/.test(y)) return 4;
  if (/final|last|final year/.test(y)) return 0;
  return parseInt(y, 10) > 0 && parseInt(y, 10) <= 5 ? parseInt(y, 10) : 0;
}

/** Full degree years, with unknown/final year treated as the last year. */
export function totalDegreeYears(degree?: string | null, year?: string | null): number {
  const total = academicYearsForDegree(degree);
  const idx = yearIndexFromLabel(year);
  return idx > 0 ? Math.min(idx, total) : total;
}

/** Years of the degree still ahead, including the current one (min 1). */
export function remainingAcademicYears(year?: string | null, degree?: string | null): number {
  const total = academicYearsForDegree(degree);
  const idx = yearIndexFromLabel(year);
  const current = idx > 0 ? Math.min(idx, total) : total;
  return Math.max(1, total - current + 1);
}

/** How many weeks a full remaining-college plan should cover. */
export function recommendedRoadmapWeeks(year?: string | null, degree?: string | null): number {
  return remainingAcademicYears(year, degree) * WEEKS_PER_YEAR;
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

// Client-safe career info used to render "About this career" cards in the onboarding wizard.
// Mirrors the server-side careers registry summaries in concise form.
export const CAREER_BLURBS: Record<string, { what: string; skills: string[] }> = {
  "Software Developer": {
    what: "Builds and maintains the applications and systems companies run on — web, desktop and backend.",
    skills: ["Data Structures & Algorithms", "SQL", "Git", "OOP", "REST APIs", "Problem Solving"],
  },
  "Frontend Developer": {
    what: "Builds the interfaces users see — turning designs into responsive, fast web apps.",
    skills: ["HTML/CSS & JavaScript", "React", "TypeScript", "Tailwind", "Responsive Design", "Web Performance"],
  },
  "Backend Developer": {
    what: "Builds the servers, databases and APIs that power applications securely at scale.",
    skills: ["Node / Python / Java", "SQL & NoSQL", "REST / GraphQL", "System Design", "Caching", "Security & Testing"],
  },
  "Full-Stack Developer": {
    what: "Owns the whole product — frontend, backend, database and deployment.",
    skills: ["HTML/CSS/JS", "React", "Node / Python", "SQL", "REST APIs", "Git & Deployments"],
  },
  "Data Analyst": {
    what: "Turns raw data into decisions — cleaning, analysing and visualising it for stakeholders.",
    skills: ["SQL", "Excel", "Python (pandas)", "Power BI / Tableau", "Statistics", "Dashboards"],
  },
  "Data Scientist": {
    what: "Models and predicts — applying statistics and machine learning to business problems.",
    skills: ["Python (numpy/pandas)", "Statistics", "ML Algorithms", "Feature Engineering", "Model Evaluation", "SQL"],
  },
  "AI/ML Engineer": {
    what: "Ships machine learning systems — covering everything from the model to production.",
    skills: ["Python", "PyTorch / TensorFlow", "ML Pipeline Design", "Model Deployment", "LLMs / RAG", "Docker"],
  },
  "DevOps Engineer": {
    what: "Automates and operates infrastructure so teams can ship quickly and reliably.",
    skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS / Azure / GCP", "Terraform", "Monitoring"],
  },
  "QA / Test Engineer": {
    what: "Guards product quality by designing test plans and automating checks.",
    skills: ["Manual Testing", "Automation (Selenium / Playwright)", "Test Case Design", "Bug Tracking", "API Testing", "Scripting"],
  },
  "Cyber Security Analyst": {
    what: "Protects systems and data — finding and fixing vulnerabilities before attackers do.",
    skills: ["Networking", "Operating Systems", "Vulnerability Assessment", "SIEM Tools", "Cryptography", "Incident Response"],
  },
  "Cloud Engineer": {
    what: "Designs and runs scalable cloud infrastructure with cost and reliability in mind.",
    skills: ["AWS / Azure / GCP", "IaaS / PaaS", "Networking", "Security", "Cost Optimization", "Infrastructure as Code"],
  },
  "Mobile App Developer": {
    what: "Builds iOS and Android apps users love — from UI to stores to updates.",
    skills: ["Kotlin / Java / Swift", "React Native / Flutter", "App Lifecycle", "REST APIs", "Offline Storage", "Store Publishing"],
  },
  "Product Manager": {
    what: "Finds what users need and leads a team to build and ship it.",
    skills: ["Market Research", "PRDs & Prioritization", "Analytics & Metrics", "Stakeholder Management", "Agile / Scrum", "A/B Testing"],
  },
  "UI/UX Designer": {
    what: "Designs intuitive, accessible products — from research and wireframes to polished interfaces.",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Usability Testing"],
  },
  "Research Analyst": {
    what: "Distills data and literature into sharp, structured research insights.",
    skills: ["Data Collection", "Statistical Analysis", "Excel / Python", "Research Writing", "Literature Review", "Critical Thinking"],
  },
  "Statistician": {
    what: "Designs experiments and models data to draw statistically sound conclusions.",
    skills: ["Probability", "Statistical Inference", "Regression", "Experimental Design", "R / Python", "Data Visualization"],
  },
  "Bioinformatics Analyst": {
    what: "Combines biology with computation to analyse genomic and biomedical data.",
    skills: ["Python / R", "Genomics Tools (BLAST, Bioconductor)", "Statistics", "Sequence Analysis", "Databases", "Cloud HPC"],
  },
  "HR Specialist": {
    what: "Owns the people side — hiring talent, onboarding them and supporting culture.",
    skills: ["Sourcing & Recruitment", "Employee Relations", "HRIS", "Onboarding", "Communication", "Employment Law Basics"],
  },
  "Operations Manager": {
    what: "Runs day-to-day operations so teams deliver consistently and efficiently.",
    skills: ["Process Optimization", "Data Analysis", "Vendor Management", "Supply Chain Basics", "Project Management", "SOP Writing"],
  },
  "Sales & Business Development": {
    what: "Finds, pitches and closes opportunities that grow the business.",
    skills: ["Lead Generation", "Pitching", "Negotiation", "CRM Management", "Relationship Building", "Prospecting"],
  },
  "Digital Marketing Specialist": {
    what: "Grows audiences and revenue through performance marketing and content.",
    skills: ["SEO", "Google / Meta Ads", "Content Marketing", "Analytics", "Email Marketing", "Social Media"],
  },
  "Management Consultant": {
    what: "Solves complex business problems for clients with structured, hypothesis-driven analysis.",
    skills: ["Case Frameworks", "Data Analysis", "Excel Modeling", "Slide Writing", "Stakeholder Communication", "Problem Structuring"],
  },
  "Supply Chain Analyst": {
    what: "Optimises how products move — from demand planning to delivery.",
    skills: ["Demand Planning", "SQL / Excel", "Inventory Optimization", "Data Analysis", "ERP Basics", "Logistics"],
  },
  "Investment Banker": {
    what: "Advises on deals — financing, acquisitions and valuations.",
    skills: ["Financial Modeling", "Valuation (DCF / comps)", "Excel / M&A", "Pitch Books", "Industry Research", "Deadline Discipline"],
  },
  "Business Development Manager": {
    what: "Builds partnerships and revenue deals that scale the company.",
    skills: ["Market Research", "Partnership Strategy", "Negotiation", "Pitching", "Pipeline Management", "Cross-functional Leadership"],
  },
  "Research Engineer": {
    what: "Bridges research and software — turning new ideas into working systems.",
    skills: ["Python", "Deep Learning", "Software Engineering", "Experimentation", "MLOps Basics", "Reproducibility"],
  },
  "Embedded Systems Engineer": {
    what: "Programs the hardware inside devices — from microcontrollers to firmware.",
    skills: ["C / C++", "Microcontrollers", "RTOS", "Circuit Basics", "Sensors & Actuators", "UART / SPI / I2C"],
  },
  "Research Scientist": {
    what: "Advances the field — designing studies, experiments and analyses.",
    skills: ["Deep Research", "Python / Stats", "Experimental Design", "Paper Writing", "Data Analysis", "Presentation"],
  },
  "Finance Analyst": {
    what: "Analyses financials and models outcomes to guide business decisions.",
    skills: ["Financial Modeling", "Excel / VBA", "Financial Statements", "Valuation Basics", "SQL", "PowerPoint Storytelling"],
  },
  "Marketing Analyst": {
    what: "Measures campaigns and customers to grow performance with data.",
    skills: ["Google Analytics", "Excel / SQL", "Campaign Metrics", "Dashboards", "Content & SEO Basics", "A/B Testing"],
  },
  "Business Analyst": {
    what: "Bridges business and tech — turning requirements into solutions.",
    skills: ["SQL", "Excel / BI", "Requirements Gathering", "Process Mapping", "Stakeholder Communication", "Data Interpretation"],
  },
};

// Real-world market data for each career — entry-level figures, demand outlook,
// first job titles and growth path. Used in the onboarding career explorer.
export const CAREER_MARKET: Record<string, { salary: string; demand: string; jobTitles: string[]; trajectory: string }> = {
  "Software Developer": { salary: "₹3–8 LPA", demand: "Very High", jobTitles: ["Software Engineer", "Application Developer", "Platform Engineer (entry)"], trajectory: "Software Developer → Senior Engineer → Tech Lead / EM" },
  "Frontend Developer": { salary: "₹3–7 LPA", demand: "Very High", jobTitles: ["Frontend Engineer", "UI Developer", "React Developer"], trajectory: "Frontend → Senior Frontend → Frontend Lead / UI Engineer" },
  "Backend Developer": { salary: "₹4–9 LPA", demand: "Very High", jobTitles: ["Backend Engineer", "API Developer", "Java / Node Developer"], trajectory: "Backend → Senior Backend → Architect / Backend Lead" },
  "Full-Stack Developer": { salary: "₹4–10 LPA", demand: "Very High", jobTitles: ["Full-Stack Engineer", "MERN / MEAN Developer", "Product Engineer"], trajectory: "Full-Stack → Senior → Tech Lead / Product Engineer" },
  "Data Analyst": { salary: "₹3–7 LPA", demand: "Very High", jobTitles: ["Data Analyst", "Business Intelligence Analyst", "MIS Analyst"], trajectory: "Analyst → Senior Analyst → Analytics Lead" },
  "Data Scientist": { salary: "₹5–12 LPA", demand: "High", jobTitles: ["Data Scientist", "ML Engineer (entry)", "Applied Scientist"], trajectory: "Data Scientist → Senior → Principal / Lead" },
  "AI/ML Engineer": { salary: "₹6–14 LPA", demand: "Very High", jobTitles: ["ML Engineer", "NLP Engineer", "AI Engineer"], trajectory: "ML Engineer → Senior → Lead / Applied AI Engineer" },
  "DevOps Engineer": { salary: "₹4–10 LPA", demand: "High", jobTitles: ["DevOps Engineer", "Cloud Automation Engineer", "SRE (entry)"], trajectory: "DevOps → Senior → SRE / Platform Lead" },
  "QA / Test Engineer": { salary: "₹3–6 LPA", demand: "Growing", jobTitles: ["QA Engineer", "SDET", "Test Analyst"], trajectory: "Test Engineer → SDET → QA Lead" },
  "Cyber Security Analyst": { salary: "₹4–9 LPA", demand: "Very High", jobTitles: ["Security Analyst", "SOC Analyst", "GRC Analyst"], trajectory: "Analyst → Senior Analyst → Security Lead / Architect" },
  "Cloud Engineer": { salary: "₹4–10 LPA", demand: "High", jobTitles: ["Cloud Engineer", "Platform Engineer", "Infrastructure Engineer"], trajectory: "Cloud Engineer → Senior → Cloud Architect" },
  "Mobile App Developer": { salary: "₹3–8 LPA", demand: "High", jobTitles: ["Android Developer", "iOS Developer", "Flutter Developer"], trajectory: "Mobile Dev → Senior → Tech Lead" },
  "Product Manager": { salary: "₹6–15 LPA", demand: "High", jobTitles: ["Associate Product Manager", "Product Analyst", "APM (early career)"], trajectory: "APM → Product Manager → Senior PM / GPM" },
  "UI/UX Designer": { salary: "₹3–8 LPA", demand: "High", jobTitles: ["UI Designer", "UX Designer", "Product Designer"], trajectory: "UX Designer → Senior → Design Lead / Head of Design" },
  "Research Analyst": { salary: "₹3–6 LPA", demand: "Growing", jobTitles: ["Research Analyst", "Market Research Analyst", "Equity Research Analyst"], trajectory: "Analyst → Senior Analyst → Research Lead" },
  "Statistician": { salary: "₹4–8 LPA", demand: "Growing", jobTitles: ["Statistician", "Quant Analyst", "Data Scientist (statistics)"], trajectory: "Statistician → Senior → Principal Statistician" },
  "Bioinformatics Analyst": { salary: "₹4–8 LPA", demand: "Niche", jobTitles: ["Bioinformatics Analyst", "Computational Biologist", "Genomics Analyst"], trajectory: "Analyst → Senior → Research Scientist" },
  "HR Specialist": { salary: "₹3–6 LPA", demand: "Growing", jobTitles: ["HR Executive", "Recruitment Specialist", "HR Generalist"], trajectory: "HR Specialist → HR Manager → HR Business Partner" },
  "Operations Manager": { salary: "₹5–12 LPA", demand: "High", jobTitles: ["Operations Executive", "Operations Manager", "Process Lead"], trajectory: "Ops Executive → Manager → Director / COO track" },
  "Sales & Business Development": { salary: "₹3–8 LPA", demand: "High", jobTitles: ["SDR", "Business Development Executive", "Account Executive"], trajectory: "SDR → Account Executive → Sales Manager" },
  "Digital Marketing Specialist": { salary: "₹3–7 LPA", demand: "Very High", jobTitles: ["Digital Marketing Executive", "SEO / SEM Specialist", "Performance Marketer"], trajectory: "Specialist → Manager → Growth Lead" },
  "Management Consultant": { salary: "₹8–16 LPA", demand: "High", jobTitles: ["Business Analyst (consulting)", "Associate Consultant", "Analyst"], trajectory: "Analyst → Consultant → Engagement Manager" },
  "Supply Chain Analyst": { salary: "₹4–8 LPA", demand: "Growing", jobTitles: ["Supply Chain Analyst", "Demand Planner", "Logistics Analyst"], trajectory: "Analyst → Planner → Operations Manager" },
  "Investment Banker": { salary: "₹10–20 LPA", demand: "Niche", jobTitles: ["IB Analyst", "Equity Research Analyst", "Deal Analyst"], trajectory: "Analyst → Associate → VP" },
  "Business Development Manager": { salary: "₹5–12 LPA", demand: "High", jobTitles: ["BDM", "Partnership Manager", "Corporate Sales Executive"], trajectory: "BD Executive → BDM → Head of Business Development" },
  "Research Engineer": { salary: "₹6–14 LPA", demand: "High", jobTitles: ["Research Engineer", "Applied ML Engineer", "Deep Learning Engineer"], trajectory: "Engineer → Senior → Lead / Principal Researcher" },
  "Embedded Systems Engineer": { salary: "₹4–9 LPA", demand: "Growing", jobTitles: ["Embedded Engineer", "Firmware Engineer", "SoC / VLSI Engineer"], trajectory: "Embedded Engineer → Senior → Systems Architect" },
  "Research Scientist": { salary: "₹6–15 LPA", demand: "Niche", jobTitles: ["Research Scientist", "R&D Scientist", "Postdoc / PhD-track"], trajectory: "Researcher → Senior → Principal Scientist" },
  "Finance Analyst": { salary: "₹4–9 LPA", demand: "High", jobTitles: ["Finance Analyst", "FP&A Analyst", "Credit Analyst"], trajectory: "Analyst → Senior → Finance Manager" },
  "Marketing Analyst": { salary: "₹4–8 LPA", demand: "High", jobTitles: ["Marketing Analyst", "Growth Analyst", "CRM Analyst"], trajectory: "Analyst → Senior → Marketing Manager" },
  "Business Analyst": { salary: "₹4–9 LPA", demand: "Very High", jobTitles: ["Business Analyst", "IT / Functional Analyst", "Consulting Analyst"], trajectory: "Analyst → Senior → Product / Program Manager" },
};

export const DEMAND_RANK: Record<string, number> = {
  "Very High": 0,
  High: 1,
  Growing: 2,
  Niche: 3,
};

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
  { key: "careerActivities", label: "Hackathons / Events / Opportunities", weight: 5 },
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
