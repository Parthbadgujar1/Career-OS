import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const SKILLS: { name: string; category: string }[] = [
  { name: "Python", category: "LANGUAGES" },
  { name: "Java", category: "LANGUAGES" },
  { name: "C++", category: "LANGUAGES" },
  { name: "JavaScript", category: "LANGUAGES" },
  { name: "TypeScript", category: "LANGUAGES" },
  { name: "SQL", category: "DATA" },
  { name: "Pandas", category: "DATA" },
  { name: "Excel", category: "DATA" },
  { name: "Power BI", category: "DATA" },
  { name: "Tableau", category: "DATA" },
  { name: "Data Structures", category: "CS_FUNDAMENTALS" },
  { name: "Algorithms", category: "CS_FUNDAMENTALS" },
  { name: "Operating Systems", category: "CS_FUNDAMENTALS" },
  { name: "DBMS", category: "CS_FUNDAMENTALS" },
  { name: "Computer Networks", category: "CS_FUNDAMENTALS" },
  { name: "OOP", category: "CS_FUNDAMENTALS" },
  { name: "React", category: "TOOLS" },
  { name: "Node.js", category: "TOOLS" },
  { name: "Git & GitHub", category: "TOOLS" },
  { name: "Docker", category: "TOOLS" },
  { name: "Machine Learning", category: "AI" },
  { name: "Deep Learning", category: "AI" },
  { name: "Statistics", category: "AI" },
  { name: "Communication", category: "SOFT_SKILLS" },
  { name: "Aptitude", category: "SOFT_SKILLS" },
  { name: "Resume Writing", category: "SOFT_SKILLS" },
  { name: "Interview Skills", category: "SOFT_SKILLS" },
  { name: "Leadership", category: "SOFT_SKILLS" },
  { name: "SEO & SEM", category: "MARKETING" },
  { name: "Social Media Marketing", category: "MARKETING" },
  { name: "Content Marketing", category: "MARKETING" },
  { name: "Email Marketing", category: "MARKETING" },
  { name: "Digital Ads", category: "MARKETING" },
  { name: "Branding", category: "MARKETING" },
  { name: "Financial Modeling", category: "FINANCE" },
  { name: "Accounting Basics", category: "FINANCE" },
  { name: "Corporate Finance", category: "FINANCE" },
  { name: "Investments", category: "FINANCE" },
  { name: "Risk Management", category: "FINANCE" },
  { name: "Business Strategy", category: "BUSINESS" },
  { name: "Market Research", category: "BUSINESS" },
  { name: "Operations & Supply Chain", category: "BUSINESS" },
  { name: "HR & People Operations", category: "BUSINESS" },
  { name: "P&L Analysis", category: "BUSINESS" },
  { name: "Negotiation", category: "BUSINESS" },
  { name: "Figma", category: "DESIGN" },
  { name: "Wireframing & Prototyping", category: "DESIGN" },
  { name: "UX Research", category: "DESIGN" },
  { name: "Design Systems", category: "DESIGN" },
  { name: "AWS", category: "CLOUD" },
  { name: "Azure", category: "CLOUD" },
  { name: "Kubernetes", category: "CLOUD" },
  { name: "CI/CD", category: "CLOUD" },
  { name: "Linux", category: "CLOUD" },
  { name: "Network Security", category: "CYBER" },
  { name: "Ethical Hacking", category: "CYBER" },
  { name: "Penetration Testing", category: "CYBER" },
  { name: "SIEM & SOC", category: "CYBER" },
  { name: "React Native", category: "MOBILE" },
  { name: "Flutter", category: "MOBILE" },
  { name: "Kotlin", category: "MOBILE" },
  { name: "Swift", category: "MOBILE" },
];

const CODING_PROBLEMS = [
  { title: "Two Sum", topic: "Arrays", difficulty: "EASY", description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Each input has exactly one solution.", starterCode: "def two_sum(nums, target):\n    # write your solution\n    pass", solution: "Use a hash map to store complements." },
  { title: "Valid Parentheses", topic: "Stacks & queues", difficulty: "EASY", description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", starterCode: "def is_valid(s):\n    # write your solution\n    pass", solution: "Use a stack; pop on matching close brackets." },
  { title: "Best Time to Buy and Sell Stock", topic: "Arrays", difficulty: "EASY", description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve.", starterCode: "def max_profit(prices):\n    # write your solution\n    pass", solution: "Track min price and max profit in one pass." },
  { title: "Contains Duplicate", topic: "Hash maps", difficulty: "EASY", description: "Given an integer array nums, return true if any value appears at least twice, else false.", starterCode: "def contains_duplicate(nums):\n    # write your solution\n    pass", solution: "Use a set to detect duplicates in O(n)." },
  { title: "Reverse Linked List", topic: "Linked lists", difficulty: "EASY", description: "Given the head of a singly linked list, reverse the list and return the reversed list.", starterCode: "def reverse_list(head):\n    # write your solution\n    pass", solution: "Iterate with prev/curr pointers." },
  { title: "Merge Two Sorted Lists", topic: "Linked lists", difficulty: "EASY", description: "Merge two sorted linked lists and return the merged sorted list.", starterCode: "def merge_two_lists(l1, l2):\n    # write your solution\n    pass", solution: "Dummy node + two-pointer merge." },
  { title: "Binary Search", topic: "Algorithms", difficulty: "EASY", description: "Given a sorted array and a target, return the index of target or -1.", starterCode: "def binary_search(nums, target):\n    # write your solution\n    pass", solution: "Standard O(log n) binary search." },
  { title: "Climbing Stairs", topic: "Dynamic programming", difficulty: "EASY", description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. Return how many distinct ways you can climb to the top.", starterCode: "def climb_stairs(n):\n    # write your solution\n    pass", solution: "Fibonacci-style DP: f(n) = f(n-1) + f(n-2)." },
  { title: "Invert Binary Tree", topic: "Trees", difficulty: "EASY", description: "Given the root of a binary tree, invert the tree and return its root.", starterCode: "def invert_tree(root):\n    # write your solution\n    pass", solution: "Swap children recursively." },
  { title: "Valid Palindrome", topic: "Strings", difficulty: "EASY", description: "Given a string s, return true if it is a palindrome considering only alphanumeric characters.", starterCode: "def is_palindrome(s):\n    # write your solution\n    pass", solution: "Two pointers, skip non-alphanumerics." },
];

const QUIZZES = [
  { title: "SQL Basics Quiz", topic: "SQL", difficulty: "EASY", questionCount: 5 },
  { title: "DSA Fundamentals Quiz", topic: "DSA", difficulty: "MEDIUM", questionCount: 5 },
  { title: "DBMS Core Concepts Quiz", topic: "DBMS", difficulty: "MEDIUM", questionCount: 5 },
];

function quizQuestions(topic: string) {
  const banks: Record<string, { question: string; options: string[]; answer: number }[]> = {
    SQL: [
      { question: "Which SQL command is used to retrieve data?", options: ["SELECT", "GET", "FETCH", "PULL"], answer: 0 },
      { question: "Which clause filters rows before grouping?", options: ["HAVING", "WHERE", "FILTER", "GROUP BY"], answer: 1 },
      { question: "Which join returns only matching rows?", options: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "FULL JOIN"], answer: 1 },
      { question: "Which function counts rows in a group?", options: ["SUM()", "COUNT()", "AVG()", "TOTAL()"], answer: 1 },
      { question: "Which keyword removes duplicate rows?", options: ["UNIQUE", "DISTINCT", "ONLY", "FRESH"], answer: 1 },
    ],
    DSA: [
      { question: "Which data structure is LIFO?", options: ["Queue", "Stack", "Array", "Set"], answer: 1 },
      { question: "Worst-case time of linear search?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2 },
      { question: "Which structure stores key-value pairs?", options: ["Hash Map", "Stack", "Queue", "Tree"], answer: 0 },
      { question: "What is the height of a balanced BST with 7 nodes?", options: ["2", "3", "7", "4"], answer: 1 },
      { question: "Which sort is O(n log n) average?", options: ["Bubble", "Selection", "Insertion", "Merge"], answer: 3 },
    ],
    DBMS: [
      { question: "ACID stands for...", options: ["Atomicity, Consistency, Isolation, Durability", "Autonomy, Clarity, Integrity, Data", "Access, Control, Index, Delete", "All, Core, Integrated, Data"], answer: 0 },
      { question: "Which is a relational DBMS?", options: ["MongoDB", "PostgreSQL", "Redis", "Cassandra"], answer: 1 },
      { question: "A foreign key is used to...", options: ["Index a table", "Link two tables", "Delete data", "Encrypt data"], answer: 1 },
      { question: "Normalization reduces...", options: ["Query speed", "Data redundancy", "Table count", "Memory"], answer: 1 },
      { question: "Which is an aggregate function?", options: ["WHERE", "GROUP BY", "AVG()", "SELECT"], answer: 2 },
    ],
  };
  return banks[topic] ?? [];
}

const OPPORTUNITIES = [
  { title: "Data Analyst Internship", platform: "internshala", type: "INTERNSHIP", url: "https://internshala.com/internships/data-analytics-internship", description: "2-month data analyst internship for students with SQL + Python basics. Apply via Internshala.", tags: ["data analyst", "sql", "python"], eligibility: ["B.Tech", "B.Sc", "BCA", "MCA"] },
  { title: "Software Developer Jobs", platform: "linkedin", type: "JOB", url: "https://www.linkedin.com/jobs/software-developer-jobs", description: "Fresh-graduate software developer roles across India. Redirects to LinkedIn Jobs.", tags: ["software developer", "developer", "java", "python"], eligibility: ["B.Tech", "MCA", "M.Tech"] },
  { title: "Developer Learning Roadmaps", platform: "roadmap.sh", type: "EVENT", url: "https://roadmap.sh", description: "Structured role roadmaps for developers — frontend, backend, full-stack, DevOps and more.", tags: ["learning", "roadmap", "developer"], eligibility: [] },
  { title: "Unstop Hiring Challenges", platform: "unstop", type: "COMPETITION", url: "https://unstop.com", description: "Hiring challenges and competitions by top companies. Build your achievement portfolio.", tags: ["competition", "hackathon", "hiring"], eligibility: [] },
  { title: "Fresher Jobs Portal", platform: "naukri", type: "JOB", url: "https://www.naukri.com", description: "Browse fresher and internship jobs by role and location on Naukri.", tags: ["job", "fresher"], eligibility: [] },
  { title: "Indeed Jobs", platform: "indeed", type: "JOB", url: "https://www.indeed.com", description: "Search and apply to relevant jobs on Indeed.", tags: ["job"], eligibility: [] },
  { title: "Unstop Hackathons", platform: "unstop", type: "HACKATHON", url: "https://unstop.com/hackathons", description: "Discover national and college hackathons and register directly.", tags: ["hackathon", "competition"], eligibility: [] },
  { title: "AI/ML Internship", platform: "internshala", type: "INTERNSHIP", url: "https://internshala.com/internships/artificial-intelligence-internship", description: "AI/ML internships for students with Python and ML basics.", tags: ["ai", "ml", "python"], eligibility: ["B.Tech", "M.Tech", "MCA"] },
  { title: "Frontend Developer Internship", platform: "internshala", type: "INTERNSHIP", url: "https://internshala.com/internships/web-development-internship", description: "Web/frontend development internships for students learning React and JS.", tags: ["frontend", "react", "javascript"], eligibility: ["B.Tech", "BCA", "MCA", "B.Sc"] },
];

const EVENTS = [
  { title: "Monthly Career Webinar: Placement Readiness", type: "WEBINAR", description: "Live session on how placement readiness works and how to use your Career OS.", startsAt: new Date(Date.now() + 5 * 86400000) },
  { title: "National Hackathon — Build Your Portfolio Project", type: "HACKATHON", description: "48-hour hackathon to build a portfolio-worthy project. Team up with peers.", startsAt: new Date(Date.now() + 14 * 86400000) },
  { title: "Mock Interview Practice Session", type: "WORKSHOP", description: "Peer + mentor mock interviews with feedback. Open to all students.", startsAt: new Date(Date.now() + 21 * 86400000) },
  { title: "Doubt-Solving Session: DSA & Coding", type: "WORKSHOP", description: "Bring your coding doubts and get them solved live.", startsAt: new Date(Date.now() + 9 * 86400000) },
];

async function main() {
  console.log("Seeding database...");

  // Users
  const adminPassword = await hash("admin123", 10);
  const mentorPassword = await hash("mentor123", 10);
  const studentPassword = await hash("student123", 10);

  await prisma.user.upsert({
    where: { email: "admin@carrer.com" },
    update: {},
    create: { name: "Admin", email: "admin@carrer.com", passwordHash: adminPassword, role: "ADMIN" },
  });
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@carrer.com" },
    update: {},
    create: { name: "Mentor", email: "mentor@carrer.com", passwordHash: mentorPassword, role: "MENTOR" },
  });
  const student = await prisma.user.upsert({
    where: { email: "student@carrer.com" },
    update: {},
    create: { name: "Demo Student", email: "student@carrer.com", passwordHash: studentPassword, role: "STUDENT" },
  });

  // Skills
  const skillMap = new Map<string, string>();
  for (const [i, s] of SKILLS.entries()) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: { name: s.name, category: s.category, sortOrder: i },
    });
    skillMap.set(s.name, skill.id);
  }

  // Student profile
  const profile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      degree: "B.Tech",
      specialization: "Computer Science",
      year: "2nd Year",
      targetRole: "Data Analyst",
      interests: JSON.stringify(["Data & Analytics", "Competitive Programming"]),
      weeklyHours: 12,
      onboardedAt: new Date(),
      assessmentComplete: true,
      mentorId: mentor.id,
    },
  });

  // Sample skill ratings
  const sampleRatings: [string, number][] = [
    ["Python", 4], ["SQL", 2], ["Pandas", 3], ["Statistics", 2], ["Excel", 3],
    ["Data Structures", 2], ["Communication", 3], ["Aptitude", 3],
  ];
  for (const [name, rating] of sampleRatings) {
    const skillId = skillMap.get(name);
    if (!skillId) continue;
    await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: profile.id, skillId } },
      update: { selfRating: rating },
      create: { studentId: profile.id, skillId, selfRating: rating },
    });
  }

  // Coding problems
  for (const p of CODING_PROBLEMS) {
    const existing = await prisma.codingProblem.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.codingProblem.create({ data: p });
    }
  }

  // Quizzes
  for (const q of QUIZZES) {
    const existing = await prisma.quiz.findFirst({ where: { title: q.title } });
    if (!existing) {
      await prisma.quiz.create({
        data: { ...q, questions: JSON.stringify(quizQuestions(q.topic)) },
      });
    }
  }

  // Opportunities
  for (const op of OPPORTUNITIES) {
    const existing = await prisma.opportunity.findFirst({ where: { title: op.title } });
    if (!existing) {
      await prisma.opportunity.create({
        data: {
          title: op.title,
          platform: op.platform,
          type: op.type,
          url: op.url,
          description: op.description,
          tags: JSON.stringify(op.tags),
          eligibility: JSON.stringify(op.eligibility),
        },
      });
    }
  }

  // Events
  for (const ev of EVENTS) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.event.create({ data: ev });
    }
  }

  console.log("Seed complete.");
  console.log("  Admin  → admin@carrer.com / admin123");
  console.log("  Mentor → mentor@carrer.com / mentor123");
  console.log("  Student→ student@carrer.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
