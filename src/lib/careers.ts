import "server-only";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { generateWithFailover } from "@/lib/ai/client";
import {
  ROLE_INTERESTS,
  ROLE_SKILL_CATEGORIES,
  INTERESTS,
  type DimensionKey,
} from "@/lib/constants";

// ── Career Profiles (hybrid: hardcoded registry + AI fallback) ─────────────
// Known careers resolve deterministically from this registry. Careers that
// aren't listed are resolved by AI once (cached in-memory) and merged with
// sensible defaults — the "AI fallback" half of the hybrid strategy.

export interface CareerProfile {
  role: string;
  title: string;
  summary: string;
  skillAreas: string[]; // SKILL_CATEGORY_LABELS keys, priority order
  coreSkills: string[];
  interests: string[]; // INTERESTS entries
  evidence: string[]; // proof types employers look for
  industries: string[];
  path: string; // junior → senior trajectory
  focusDimension: DimensionKey; // readiness dimension this career leans on most
  recommendedResources: string[];
}

const PROFILE_BLUEPRINT = (
  role: string,
  opts: Pick<CareerProfile, "summary" | "coreSkills" | "evidence" | "industries" | "path" | "focusDimension" | "recommendedResources">
): CareerProfile => ({
  role,
  title: role,
  skillAreas: (ROLE_SKILL_CATEGORIES[role] ?? ["SOFT_SKILLS"]).slice(),
  interests: (ROLE_INTERESTS[role] ?? []).filter((i) => (INTERESTS as readonly string[]).includes(i)),
  ...opts,
});

const REGISTRY: Record<string, CareerProfile> = {
  "Software Developer": PROFILE_BLUEPRINT("Software Developer", {
    summary:
      "Builds, tests and maintains applications across the stack. Companies expect strong DSA fundamentals, clean coding habits and at least one deployable project.",
    coreSkills: ["Data Structures", "Algorithms", "SQL", "Git", "OOP", "Problem Solving", "REST APIs"],
    evidence: ["GitHub with real projects", "LeetCode/HackerRank consistency", "Internship or coursework projects"],
    industries: ["IT Services", "Product / SaaS", "Fintech", "Startups", "E-commerce"],
    path: "Software Developer → Senior Engineer → Tech Lead / Engineering Manager",
    focusDimension: "coreSkills",
    recommendedResources: ["GeeksforGeeks", "LeetCode", "CS50", "roadmap.sh/computer-science"],
  }),

  "Frontend Developer": PROFILE_BLUEPRINT("Frontend Developer", {
    summary:
      "Builds the user-facing layer of web products. Recruiting emphasizes a live portfolio, responsive design and real React experience.",
    coreSkills: ["HTML/CSS", "JavaScript", "React", "TypeScript", "Tailwind", "Responsive Design", "Web Performance"],
    evidence: ["Portfolio website", "Deployed React app", "Open source or UI component work"],
    industries: ["Product / SaaS", "E-commerce", "Startups", "IT Services"],
    path: "Frontend Developer → Senior Frontend → Frontend Lead / UI Engineer",
    focusDimension: "projects",
    recommendedResources: ["The Odin Project", "React docs", "Frontend Mentor", "web.dev"],
  }),

  "Backend Developer": PROFILE_BLUEPRINT("Backend Developer", {
    summary:
      "Builds the server side: APIs, databases, security and performance. Hiring stresses systems design basics, SQL and scalability thinking.",
    coreSkills: ["Node/Python/Java", "SQL & NoSQL", "REST/GraphQL", "Caching", "System Design", "Security", "Testing"],
    evidence: ["Deployed API project", "Database schema design work", "DSA consistency on platforms"],
    industries: ["Product / SaaS", "Fintech", "IT Services", "Startups"],
    path: "Backend Developer → Senior Backend → Architect / Backend Lead",
    focusDimension: "coreSkills",
    recommendedResources: ["roadmap.sh/backend", "System Design Primer", "PostgreSQL exercises", "Designing Data-Intensive Applications"],
  }),

  "Full-Stack Developer": PROFILE_BLUEPRINT("Full-Stack Developer", {
    summary:
      "Owns features end to end — UI, API, database and deployment. Stands out by shipping complete products rather than isolated components.",
    coreSkills: ["HTML/CSS/JS", "React", "Node/Python", "SQL", "REST APIs", "Git & Deployments"],
    evidence: ["End-to-end shipped product", "Clean GitHub with READMEs", "Live deployed demos"],
    industries: ["Startups", "Product / SaaS", "E-commerce", "IT Services"],
    path: "Full-Stack Developer → Senior Full-Stack → Lead Engineer",
    focusDimension: "projects",
    recommendedResources: ["The Odin Project", "roadmap.sh/full-stack", "Next.js docs"],
  }),

  "Mobile App Developer": PROFILE_BLUEPRINT("Mobile App Developer", {
    summary:
      "Builds iOS/Android apps. A published app in any store is the strongest possible signal for a fresh grad.",
    coreSkills: ["Kotlin/Java or Swift", "React Native/Flutter", "App Lifecycle", "REST APIs", "Offline Storage", "Play/App Store publishing"],
    evidence: ["Published app", "UI/UX-driven app project", "GitHub with mobile repos"],
    industries: ["Product / SaaS", "Startups", "Gaming", "Health Tech"],
    path: "Mobile Developer → Senior Mobile → Mobile Lead",
    focusDimension: "projects",
    recommendedResources: ["Android Developer docs", "Swift/Kotlin track", "Flutter cookbook"],
  }),

  "Data Analyst": PROFILE_BLUEPRINT("Data Analyst", {
    summary:
      "Turns raw data into decisions. Hiring focuses on SQL, Excel/Power BI and the ability to tell a clear story from numbers.",
    coreSkills: ["SQL", "Excel", "Python (pandas)", "Power BI/Tableau", "Statistics", "Data Cleaning", "Dashboards"],
    evidence: ["SQL/Python analysis projects", "Dashboard portfolio", "Case-study reports"],
    industries: ["IT Services", "Fintech", "Banking", "E-commerce", "Consulting"],
    path: "Data Analyst → Senior Analyst → Analytics Lead / BI Manager",
    focusDimension: "coreSkills",
    recommendedResources: ["Mode Analytics SQL tutorial", "Kaggle datasets", "LeetCode SQL"],
  }),

  "Data Scientist": PROFILE_BLUEPRINT("Data Scientist", {
    summary:
      "Builds models that generate insight or prediction. Strong stats, Python ML and at least one well-documented project matter most.",
    coreSkills: ["Python (numpy/pandas)", "Statistics", "ML Algorithms", "Feature Engineering", "Model Evaluation", "SQL"],
    evidence: ["Kaggle notebooks", "End-to-end ML project", "Published analysis"],
    industries: ["AI & ML", "Product / SaaS", "Health Tech", "Fintech", "Consulting"],
    path: "Data Scientist → Senior DS → Lead Data Scientist / DS Manager",
    focusDimension: "coreSkills",
    recommendedResources: ["Kaggle Learn", "StatQuest", "Hands-On ML (Géron)"],
  }),

  "AI/ML Engineer": PROFILE_BLUEPRINT("AI/ML Engineer", {
    summary:
      "Productionizes ML — trains, evaluates and deploys models at scale. Deep learning frameworks and deployment skills are key differentiators.",
    coreSkills: ["Python", "PyTorch/TensorFlow", "ML Pipeline Design", "Model Deployment", "LLMs/RAG", "Docker"],
    evidence: ["Deployed model API", "Deep learning project (CV/NLP)", "Kaggle competition experience"],
    industries: ["AI & ML", "Product / SaaS", "Health Tech", "Fintech"],
    path: "ML Engineer → Senior ML Engineer → ML Lead / MLE Manager",
    focusDimension: "coreSkills",
    recommendedResources: ["Fast.ai", "DeepLearning.AI", "Hugging Face docs"],
  }),

  "DevOps Engineer": PROFILE_BLUEPRINT("DevOps Engineer", {
    summary:
      "Automates build, test and deployment pipelines and keeps systems reliable. Linux, CI/CD and cloud basics are table stakes.",
    coreSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/Azure/GCP", "Terraform", "Monitoring"],
    evidence: ["CI/CD pipeline project", "Infrastructure-as-code repo", "Cloud certification"],
    industries: ["IT Services", "Product / SaaS", "Startups", "Fintech"],
    path: "DevOps Engineer → Senior DevOps → SRE / Platform Lead",
    focusDimension: "coreSkills",
    recommendedResources: ["roadmap.sh/devops", "KodeKloud", "AWS free tier labs"],
  }),

  "Cloud Engineer": PROFILE_BLUEPRINT("Cloud Engineer", {
    summary:
      "Designs and operates cloud infrastructure. Cloud certifications plus hands-on deployments carry the most weight.",
    coreSkills: ["AWS/Azure/GCP", "IaaS/PaaS", "Networking", "Security", "Cost Optimization", "IaC (Terraform)"],
    evidence: ["Deployed cloud architecture", "Infrastructure-as-code project", "Cloud certification badge"],
    industries: ["IT Services", "Product / SaaS", "Startups"],
    path: "Cloud Engineer → Senior Cloud Engineer → Cloud Architect",
    focusDimension: "coreSkills",
    recommendedResources: ["AWS Skill Builder", "Cloud resume challenge", "Terraform docs"],
  }),

  "Cyber Security Analyst": PROFILE_BLUEPRINT("Cyber Security Analyst", {
    summary:
      "Protects systems from attacks — monitors, tests and responds. Practical labs, CTF experience and certifications signal readiness.",
    coreSkills: ["Networking", "Operating Systems", "Vulnerability Assessment", "SIEM Tools", "Cryptography", "Incident Response"],
    evidence: ["CTF writeups", "Security lab projects", "TryHackMe/HackTheBox progress"],
    industries: ["Cybersecurity", "IT Services", "Banking", "Fintech"],
    path: "Security Analyst → Security Engineer → SOC Lead / Security Architect",
    focusDimension: "coreSkills",
    recommendedResources: ["TryHackMe", "HackTheBox", "Professor Messer (Security+)"],
  }),

  "Embedded Systems Engineer": PROFILE_BLUEPRINT("Embedded Systems Engineer", {
    summary:
      "Programs microcontrollers and hardware-software interfaces. Practical hardware projects make candidates stand out.",
    coreSkills: ["C/C++", "Microcontrollers", "RTOS", "Circuit Basics", "Sensors & Actuators", "UART/SPI/I2C"],
    evidence: ["Hardware project builds", "Firmware with documentation", "GitHub embedded repos"],
    industries: ["Automotive", "Consumer Electronics", "Health Tech", "IoT"],
    path: "Embedded Engineer → Senior Embedded → Firmware Architect",
    focusDimension: "projects",
    recommendedResources: ["Embedded systems MOOC", "STM32/Arduino project tutorials", "Barr Group blog"],
  }),

  "UI/UX Designer": PROFILE_BLUEPRINT("UI/UX Designer", {
    summary:
      "Designs intuitive digital products. A polished case-study portfolio is the single most important asset.",
    coreSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Usability Testing"],
    evidence: ["3+ case-study portfolio", "Redesigned product project", "Design challenge work"],
    industries: ["Product / SaaS", "Startups", "E-commerce"],
    path: "UI/UX Designer → Senior Designer → Design Lead / Product Designer",
    focusDimension: "projects",
    recommendedResources: ["Google UX Certificate", "Figma Learn", "NN/g articles"],
  }),

  "Product Manager": PROFILE_BLUEPRINT("Product Manager", {
    summary:
      "Owns product vision and prioritization across teams. Analytical thinking, communication and shipped outcomes win offers.",
    coreSkills: ["Market Research", "PRDs & Prioritization", "Analytics & Metrics", "Stakeholder Management", "Agile/Scrum", "A/B Testing"],
    evidence: ["Product teardowns", "Case-study competitions", "Shipped feature documentation"],
    industries: ["Product / SaaS", "Startups", "Fintech", "E-commerce"],
    path: "Associate PM → Product Manager → Senior PM / Group PM",
    focusDimension: "roleReadiness",
    recommendedResources: ["Lenny's Newsletter", "Cracking the PM Interview", "Google PM certificate"],
  }),

  "Business Analyst": PROFILE_BLUEPRINT("Business Analyst", {
    summary:
      "Bridges business needs and data/solutions. SQL, requirements writing and stakeholder communication are the core toolkit.",
    coreSkills: ["SQL", "Excel/BI", "Requirements Gathering", "Process Mapping", "Stakeholder Communication", "Data Interpretation"],
    evidence: ["Analysis reports", "Dashboard projects", "Process documentation"],
    industries: ["Banking", "Consulting", "IT Services", "Fintech"],
    path: "Business Analyst → Senior BA → Product Owner / Consulting roles",
    focusDimension: "roleReadiness",
    recommendedResources: ["BABOK overview", "SQL for business analysts", "LinkedIn Learning BA path"],
  }),

  "Marketing Analyst": PROFILE_BLUEPRINT("Marketing Analyst", {
    summary:
      "Measures and optimizes marketing performance with data. Digital analytics, dashboards and campaign reporting form the core.",
    coreSkills: ["Google Analytics", "Excel/SQL", "Campaign Metrics", "Dashboards", "Content & SEO Basics", "A/B Testing"],
    evidence: ["Campaign reports", "Analytics dashboards", "Marketing case studies"],
    industries: ["E-commerce", "Marketing", "D2C/Brands", "Startups"],
    path: "Marketing Analyst → Growth Analyst → Marketing Manager / Growth Lead",
    focusDimension: "roleReadiness",
    recommendedResources: ["Google Analytics Academy", "HubSpot Academy", "CXL blog"],
  }),

  "Finance Analyst": PROFILE_BLUEPRINT("Finance Analyst", {
    summary:
      "Models company performance and supports investment/financial decisions. Excel/modeling and financial statement fluency are essential.",
    coreSkills: ["Financial Modeling", "Excel/VBA", "Financial Statements", "Valuation Basics", "SQL", "PowerPoint Storytelling"],
    evidence: ["Modeling projects", "Company analysis reports", "CFA L1 progress (optional)"],
    industries: ["Banking", "Finance", "Consulting", "Investment"],
    path: "Finance Analyst → Senior Analyst → Associate / FP&A roles",
    focusDimension: "roleReadiness",
    recommendedResources: ["Breaking Into Wall Street", "CFI courses", "Wall Street Prep"],
  }),

  "HR Specialist": PROFILE_BLUEPRINT("HR Specialist", {
    summary:
      "Manages talent: recruitment, onboarding and employee engagement. People skills plus process knowledge drive success.",
    coreSkills: ["Recruitment & Sourcing", "Employee Relations", "HRIS", "Onboarding", "Communication", "Employment Law Basics"],
    evidence: ["Recruitment project/internship", "HR process documentation", "Certified HR course"],
    industries: ["IT Services", "Product / SaaS", "Staffing"],
    path: "HR Specialist → HR Business Partner → HR Manager",
    focusDimension: "roleReadiness",
    recommendedResources: ["SHRM resources", "LinkedIn Recruiter learning", "HR course on Coursera"],
  }),

  "Operations Manager": PROFILE_BLUEPRINT("Operations Manager", {
    summary:
      "Runs day-to-day processes and improves efficiency. Process design, quantitative analysis and cross-team coordination matter most.",
    coreSkills: ["Process Optimization", "Data Analysis", "Vendor Management", "Supply Chain Basics", "Project Management", "SOP Writing"],
    evidence: ["Ops improvement project", "Case studies", "Project management cert"],
    industries: ["E-commerce", "Manufacturing", "Logistics", "Startups"],
    path: "Operations Associate → Operations Manager → Director of Operations",
    focusDimension: "roleReadiness",
    recommendedResources: ["Coursera operations courses", "The Goal (book)", "PMI basics"],
  }),

  "Sales & Business Development": PROFILE_BLUEPRINT("Sales & Business Development", {
    summary:
      "Finds and closes partnerships and revenue. Communication, negotiation and pipeline discipline are the deal-makers.",
    coreSkills: ["Lead Generation", "Pitching", "Negotiation", "CRM Management", "Relationship Building", "Prospecting"],
    evidence: ["Sales internship results", "Partnership case study", "CRM certifications"],
    industries: ["SaaS", "Staffing", "Consulting", "Startups"],
    path: "SDR → BDR → Account Executive / BD Manager",
    focusDimension: "roleReadiness",
    recommendedResources: ["HubSpot Sales Academy", "Sales reading list", "LinkedIn Sales Navigator tutorials"],
  }),

  "Digital Marketing Specialist": PROFILE_BLUEPRINT("Digital Marketing Specialist", {
    summary:
      "Runs campaigns across paid, organic and social channels. Measurable campaign results and platform certifications carry the most weight.",
    coreSkills: ["SEO", "Google/Meta Ads", "Content Marketing", "Analytics", "Email Marketing", "Social Media"],
    evidence: ["Live campaign results", "Blog/SEO portfolio", "Google/Meta certificates"],
    industries: ["E-commerce", "D2C/Brands", "Startups", "Marketing"],
    path: "Digital Marketing Specialist → Marketing Manager → Head of Marketing",
    focusDimension: "roleReadiness",
    recommendedResources: ["Google Digital Garage", "Meta Blueprint", "HubSpot Academy"],
  }),

  "Management Consultant": PROFILE_BLUEPRINT("Management Consultant", {
    summary:
      "Solves strategic problems for clients with frameworks and data. Case interviews are the deciding factor in hiring.",
    coreSkills: ["Case Frameworks", "Data Analysis", "Excel Modeling", "Slide Writing", "Stakeholder Communication", "Hypothesis-Driven Thinking"],
    evidence: ["Case competition wins", "Consulting club projects", "Structured internship"],
    industries: ["Consulting", "Banking", "Startups"],
    path: "Analyst → Consultant → Engagement Manager → Partner",
    focusDimension: "roleReadiness",
    recommendedResources: ["CaseStreet", "Crafting Cases", "Consulting club prep", "Tuck lifetime access"],
  }),

  "Supply Chain Analyst": PROFILE_BLUEPRINT("Supply Chain Analyst", {
    summary:
      "Optimizes the flow of goods and data. Excel, SQL and process/financial analysis dominate entry-level work.",
    coreSkills: ["Supply Chain Basics", "SQL/Excel", "Demand Planning", "Inventory Optimization", "Data Analysis", "ERP Basics"],
    evidence: ["Supply chain analysis project", "Dashboard projects", "SCM certification"],
    industries: ["E-commerce", "Manufacturing", "Logistics"],
    path: "Supply Chain Analyst → Senior Analyst → Planning Lead / SC Manager",
    focusDimension: "roleReadiness",
    recommendedResources: ["Coursera SCM specialization", "APICS basics", "Kaggle supply chain datasets"],
  }),

  "Investment Banker": PROFILE_BLUEPRINT("Investment Banker", {
    summary:
      "Advises on M&A, capital raising and financing. Excel modeling, valuation fluency and relentless attention to detail are expected.",
    coreSkills: ["Financial Modeling", "Valuation (DCF, comps)", "Excel/M&A", "Pitch Books", "Industry Research", "Deadline Discipline"],
    evidence: ["Modeling projects", "Company analysis", "Finance club / case participation"],
    industries: ["Banking", "Investment", "Finance"],
    path: "Analyst → Associate → VP → MD",
    focusDimension: "roleReadiness",
    recommendedResources: ["Breaking Into Wall Street", "Rosenbaum & Pearl (Valuation)", "BIWS modeling tests"],
  }),

  "QA / Test Engineer": PROFILE_BLUEPRINT("QA / Test Engineer", {
    summary:
      "Ensures software quality through manual and automated testing. Attention to detail and scripting skills separate strong candidates.",
    coreSkills: ["Manual Testing", "Automation (Selenium/Playwright)", "Test Cases & Plans", "Bug Tracking", "API Testing", "Basic Scripting"],
    evidence: ["Automation framework project", "Test documentation", "Bug reports portfolio"],
    industries: ["IT Services", "Product / SaaS", "Startups"],
    path: "QA Engineer → SDET → QA Lead",
    focusDimension: "coding",
    recommendedResources: ["Test Automation University", "Playwright docs", "ISTQB foundation"],
  }),

  "Research Analyst": PROFILE_BLUEPRINT("Research Analyst", {
    summary:
      "Gathers and interprets data to inform decisions or further research. Methodical rigor and clear reporting are the core skills.",
    coreSkills: ["Data Collection", "Statistical Analysis", "Excel/Python", "Research Writing", "Literature Review", "Critical Thinking"],
    evidence: ["Research paper/project", "Data analysis reports", "Academic poster"],
    industries: ["Consulting", "Research", "Finance", "Health"],
    path: "Research Analyst → Senior Research Analyst → Research Lead",
    focusDimension: "coreSkills",
    recommendedResources: ["Google Scholar workflows", "Kaggle Learn", "University stats courses"],
  }),

  "Research Scientist": PROFILE_BLUEPRINT("Research Scientist", {
    summary:
      "Advances knowledge through experiments and publications — common in AI and sciences. A thesis, paper or strong portfolio matters.",
    coreSkills: ["Deep Research", "Python/Stats", "Experimental Design", "Paper Writing", "Model/Data Analysis", "Presentation"],
    evidence: ["Publications/preprints", "Thesis project", "Reproducible code repos"],
    industries: ["AI & ML", "Academia", "Health Tech", "Research Labs"],
    path: "Research Scientist → Senior Scientist → Principal / Lab Lead",
    focusDimension: "coreSkills",
    recommendedResources: ["ArXiv reading", "Fast.ai", "Latent Space / academic newsletters"],
  }),

  "Research Engineer": PROFILE_BLUEPRINT("Research Engineer", {
    summary:
      "Turns research into working systems. Strong engineering plus ML fundamentals produce high-demand candidates.",
    coreSkills: ["Python", "Deep Learning", "Software Engineering", "Experimentation", "MLOps Basics", "Reproducibility"],
    evidence: ["Reproduced paper implementations", "Open source ML contributions", "End-to-end ML system"],
    industries: ["AI & ML", "Product / SaaS", "Startups"],
    path: "Research Engineer → Senior RE → Applied Research Lead",
    focusDimension: "coreSkills",
    recommendedResources: ["Hugging Face courses", "The Annotated Transformer", "MLOps zoomcamp"],
  }),

  "Statistician": PROFILE_BLUEPRINT("Statistician", {
    summary:
      "Designs studies and models that quantify uncertainty. Statistical theory plus R/Python mastery define strong candidates.",
    coreSkills: ["Probability", "Statistical Inference", "Regression", "Experimental Design", "R/Python", "Data Visualization"],
    evidence: ["Statistical analysis projects", "Simulation/modeling work", "Research collaborations"],
    industries: ["Health", "Finance", "Consulting", "Research"],
    path: "Statistician → Senior Statistician → Principal / DS roles",
    focusDimension: "coreSkills",
    recommendedResources: ["StatQuest", "PennState Stat501", "Kaggle statistical competitions"],
  }),

  "Bioinformatics Analyst": PROFILE_BLUEPRINT("Bioinformatics Analyst", {
    summary:
      "Analyzes biological data — genomes, sequences, expression. Computation plus biology fluency is the differentiator.",
    coreSkills: ["Python/R", "Genomics Tools (BLAST, Bioconductor)", "Statistics", "Sequence Analysis", "Databases", "Cloud HPC Basics"],
    evidence: ["Bioinformatics project", "Genomic data analysis", "Open source bio repos"],
    industries: ["Health Tech", "Research", "Biotech"],
    path: "Bioinformatics Analyst → Senior Analyst → Bioinformatician / Scientist",
    focusDimension: "coreSkills",
    recommendedResources: ["Rosalind problems", "Bioconductor docs", "NCBI tutorials"],
  }),

  "Business Development Manager": PROFILE_BLUEPRINT("Business Development Manager", {
    summary:
      "Drives revenue partnerships and market expansion. Relationship-building, strategic thinking and measurable wins matter most.",
    coreSkills: ["Market Research", "Partnership Strategy", "Negotiation", "Pitching", "Pipeline Management", "Cross-functional Leadership"],
    evidence: ["BD project/internship results", "Partnership case studies", "MBA/domain coursework"],
    industries: ["SaaS", "IT Services", "Consulting", "Startups"],
    path: "BD Associate → BD Manager → Director of BD",
    focusDimension: "roleReadiness",
    recommendedResources: ["Forbes/HBR sales & BD reads", "LinkedIn Learning BD", "HubSpot Sales Academy"],
  }),
};

export function getCareerProfile(role: string): CareerProfile | null {
  return REGISTRY[role] ?? null;
}

export function hasHardcodedCareer(role: string): boolean {
  return role in REGISTRY;
}

// ── AI fallback for careers outside the registry ───────────────────────────
// Generated once per role and cached in-memory so repeated calls don't burn AI.

const aiProfileCache = new Map<string, CareerProfile>();

function capList(list: string[], max: number): string[] {
  return list.slice(0, max);
}

export async function getCareerProfileAsync(
  role: string,
  context?: { degree?: string; specialization?: string; industry?: string }
): Promise<CareerProfile> {
  const cached = aiProfileCache.get(role);
  if (cached) return cached;

  const hardcoded = getCareerProfile(role);
  if (hardcoded) {
    aiProfileCache.set(role, hardcoded);
    return hardcoded;
  }

  const existing = REGISTRY[role];
  if (existing) {
    aiProfileCache.set(role, existing);
    return existing;
  }

  // Known skill-area/interests mappings are still honored deterministically;
  // only the narrative parts come from AI.
  const base = PROFILE_BLUEPRINT(role, {
    summary: `${role} — a career that combines the skills, projects and evidence listed below to become job-ready for this role.`,
    coreSkills: [],
    evidence: ["Projects demonstrating this role's core skills", "Relevant internships or freelance work", "A tailored resume + LinkedIn profile"],
    industries: ["IT Services", "Product / SaaS"],
    path: `Junior ${role} → ${role} → Senior ${role}`,
    focusDimension: "roleReadiness",
    recommendedResources: [],
  });

  try {
    const { object } = await generateWithFailover(
      (model) =>
        generateObject({
          model,
          schema: z.object({
            summary: z.string(),
            coreSkills: z.array(z.string()).min(3).max(12),
            evidence: z.array(z.string()).min(3).max(6),
            industries: z.array(z.string()).min(2).max(6),
            path: z.string(),
            recommendedResources: z.array(z.string()).max(6),
          }),
          prompt: `You are a career advisor. The student wants the target career "${role}".${
            context?.degree ? `\nDegree: ${context.degree}` : ""
          }${context?.specialization ? `\nSpecialization: ${context.specialization}` : ""}${
            context?.industry ? `\nPreferred industry: ${context.industry}` : ""
          }
Generate a concise career profile for this role with:
- summary: 1-2 sentences on what the role does and what hiring managers expect from a fresh graduate (tone: practical, specific).
- coreSkills: the 6-10 most important skills/technologies to become job-ready.
- evidence: 3-5 kinds of proof that make a fresh graduate stand out (projects, portfolios, certifications, internships).
- industries: 2-6 industries that hire most for this role.
- path: the junior → senior progression line for this role.
- recommendedResources: up to 6 free or low-cost learning resources for a student.`,
          temperature: 0.5,
        }),
      "CAREER_PROFILE_FALLBACK",
    );
    const profile: CareerProfile = {
      ...base,
      summary: object.summary || base.summary,
      coreSkills: capList(object.coreSkills, 12),
      evidence: capList(object.evidence, 6),
      industries: capList(object.industries, 6),
      path: object.path || base.path,
      recommendedResources: capList(object.recommendedResources, 6),
    };
    aiProfileCache.set(role, profile);
    return profile;
  } catch (e) {
    console.error("[careers] AI fallback failed, using defaults", e);
    return base;
  }
}

// Convenience used for personalized prompts across the app.
export async function careerContextFor(
  profile: { degree?: string | null; specialization?: string | null; targetRole?: string | null; preferredIndustries?: string | null }
): Promise<string> {
  if (!profile.targetRole) return "No target career selected yet.";
  const cp = await getCareerProfileAsync(profile.targetRole, {
    degree: profile.degree ?? undefined,
    specialization: profile.specialization ?? undefined,
    industry: (() => {
      try {
        const arr = JSON.parse(profile.preferredIndustries ?? "[]") as string[];
        return arr[0] ?? undefined;
      } catch {
        return undefined;
      }
    })(),
  });
  return [
    `Target career: ${cp.role}.`,
    `What it involves: ${cp.summary}`,
    `Priority skill areas: ${cp.skillAreas.join(", ")}`,
    `Core skills employers expect: ${cp.coreSkills.join(", ") || "not specified"}`,
    `Proof employers look for: ${cp.evidence.join(", ")}`,
  ].join("\n");
}