export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // index of correct option
  topic: string;
}

export const TECHNICAL_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "t1",
    question: "Which data structure uses FIFO (First In First Out) ordering?",
    options: ["Stack", "Queue", "Tree", "Hash Map"],
    answer: 1,
    topic: "Data Structures",
  },
  {
    id: "t2",
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
    topic: "Algorithms",
  },
  {
    id: "t3",
    question: "Which SQL clause is used to filter rows after aggregation?",
    options: ["WHERE", "HAVING", "ORDER BY", "GROUP BY"],
    answer: 1,
    topic: "SQL",
  },
  {
    id: "t4",
    question: "What does a primary key do in a database table?",
    options: ["Allows duplicate values", "Uniquely identifies each row", "Sorts the table", "Speeds up all queries"],
    answer: 1,
    topic: "DBMS",
  },
  {
    id: "t5",
    question: "Which of these is NOT a Python data type?",
    options: ["List", "Tuple", "Struct", "Dictionary"],
    answer: 2,
    topic: "Python",
  },
  {
    id: "t6",
    question: "What does HTTP status code 404 indicate?",
    options: ["Server error", "Not found", "Unauthorized", "Success"],
    answer: 1,
    topic: "Web",
  },
  {
    id: "t7",
    question: "Which OS component manages process scheduling?",
    options: ["CPU cache", "Kernel", "BIOS", "Compiler"],
    answer: 1,
    topic: "OS",
  },
  {
    id: "t8",
    question: "In OOP, what is encapsulation?",
    options: ["Inheriting from a class", "Hiding internal details of an object", "Creating multiple instances", "Overloading methods"],
    answer: 1,
    topic: "OOP",
  },
  {
    id: "t9",
    question: "Which protocol is used to send email?",
    options: ["HTTP", "FTP", "SMTP", "TCP"],
    answer: 2,
    topic: "Networking",
  },
  {
    id: "t10",
    question: "What is the output of: 2 ** 3 in Python?",
    options: ["6", "8", "9", "Error"],
    answer: 1,
    topic: "Python",
  },
];

export const APTITUDE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "a1",
    question: "If a train travels 60 km in 45 minutes, what is its speed in km/hr?",
    options: ["70", "80", "90", "100"],
    answer: 1,
    topic: "Quantitative",
  },
  {
    id: "a2",
    question: "The average of 5 numbers is 12. If one number is removed, the average becomes 11. What was the removed number?",
    options: ["15", "16", "17", "18"],
    answer: 1,
    topic: "Quantitative",
  },
  {
    id: "a3",
    question: "All roses are flowers. Some flowers fade quickly. Which conclusion follows?",
    options: ["All roses fade quickly", "Some roses fade quickly", "Some flowers are not roses", "Cannot be determined"],
    answer: 3,
    topic: "Logical Reasoning",
  },
  {
    id: "a4",
    question: "Find the odd one out: 121, 144, 169, 190",
    options: ["121", "144", "169", "190"],
    answer: 3,
    topic: "Logical Reasoning",
  },
  {
    id: "a5",
    question: "Choose the correctly spelt word:",
    options: ["Accomodate", "Accommodate", "Acommodate", "Accomadate"],
    answer: 1,
    topic: "Verbal",
  },
  {
    id: "a6",
    question: "If 3 workers can build a wall in 12 days, how many days will 6 workers take?",
    options: ["4", "6", "8", "24"],
    answer: 1,
    topic: "Quantitative",
  },
  {
    id: "a7",
    question: "A is taller than B. C is shorter than B. Who is the shortest?",
    options: ["A", "B", "C", "Cannot be determined"],
    answer: 2,
    topic: "Logical Reasoning",
  },
  {
    id: "a8",
    question: "The synonym of 'abundant' is:",
    options: ["Scarce", "Plentiful", "Rare", "Limited"],
    answer: 1,
    topic: "Verbal",
  },
  {
    id: "a9",
    question: "What is 15% of 240?",
    options: ["30", "36", "40", "45"],
    answer: 1,
    topic: "Quantitative",
  },
  {
    id: "a10",
    question: "Which word is closest in meaning to 'candid'?",
    options: ["Secretive", "Frank", "Vague", "Diplomatic"],
    answer: 1,
    topic: "Verbal",
  },
];

export const COMMUNICATION_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "c1",
    question: "In a professional email, how would you start it?",
    options: ["Hey buddy,", "Dear [Name],", "Yo,", "Listen,"],
    answer: 1,
    topic: "Email Etiquette",
  },
  {
    id: "c2",
    question: "What is the best way to answer 'Tell me about yourself' in an interview?",
    options: [
      "Recite your full life story",
      "Give a structured 60-second summary of your education, skills and goal",
      "List every certification you have",
      "Talk about your hobbies only",
    ],
    answer: 1,
    topic: "Interviews",
  },
  {
    id: "c3",
    question: "What does active listening require?",
    options: [
      "Waiting for your turn to speak",
      "Understanding, then responding thoughtfully",
      "Nodding without understanding",
      "Interrupting to clarify",
    ],
    answer: 1,
    topic: "Communication",
  },
  {
    id: "c4",
    question: "Which is the clearest sentence?",
    options: [
      "The report was submitted by me after completion.",
      "I submitted the report after completing it.",
      "The report, which I submitted, after it was completed.",
      "Submitted by me, the report, after completion.",
    ],
    answer: 1,
    topic: "Verbal",
  },
  {
    id: "c5",
    question: "How should you handle a question you don't know in an interview?",
    options: [
      "Make something up",
      "Say you don't know, then explain how you'd find the answer",
      "Stay silent",
      "Blame your college syllabus",
    ],
    answer: 1,
    topic: "Interviews",
  },
  {
    id: "c6",
    question: "Which of these is a strong STAR-format behavioral answer component?",
    options: [
      "Situation, Task, Action, Result",
      "Start, Time, Attitude, Restart",
      "Say, Think, Answer, Review",
      "Sell, Tell, Apply, Reach",
    ],
    answer: 0,
    topic: "Behavioral",
  },
  {
    id: "c7",
    question: "When presenting a project, you should first:",
    options: [
      "Jump into code details",
      "State the problem your project solves",
      "Show the awards you won",
      "Apologize for shortcomings",
    ],
    answer: 1,
    topic: "Presentation",
  },
  {
    id: "c8",
    question: "What is the professional way to decline an offer?",
    options: [
      "Ignore the email",
      "Thank them and politely decline with a reason",
      "Accept and not show up",
      "Criticize the offer",
    ],
    answer: 1,
    topic: "Professionalism",
  },
  {
    id: "c9",
    question: "Which tone is best for a cover letter?",
    options: [
      "Overly casual and funny",
      "Confident, concise and role-focused",
      "Desperate and pleading",
      "Formal to the point of being cold",
    ],
    answer: 1,
    topic: "Writing",
  },
  {
    id: "c10",
    question: "In a team conflict, the best approach is to:",
    options: [
      "Argue until you win",
      "Discuss calmly and focus on the problem",
      "Complain to the manager",
      "Avoid the person entirely",
    ],
    answer: 1,
    topic: "Teamwork",
  },
];

// ============ BUSINESS DEGREES: MARKETING ============

export const MARKETING_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "m1",
    question: "What are the 4Ps of the marketing mix?",
    options: ["People, Process, Physical, Promotion", "Product, Price, Place, Promotion", "Planning, Pricing, Positioning, Producing", "Profit, Product, Promotion, Place"],
    answer: 1,
    topic: "Marketing Fundamentals",
  },
  {
    id: "m2",
    question: "What does SWOT analysis evaluate?",
    options: [
      "Sales, Workforce, Output, Transactions",
      "Strengths, Weaknesses, Opportunities, Threats",
      "Strategy, Workflow, Organization, Targets",
      "Supply, Warehousing, Order, Transport",
    ],
    answer: 1,
    topic: "Strategic Marketing",
  },
  {
    id: "m3",
    question: "What is brand positioning?",
    options: [
      "Where the brand logo is placed on packaging",
      "How a brand is perceived in consumers' minds relative to competitors",
      "The physical location of a store",
      "The price tier of a product",
    ],
    answer: 1,
    topic: "Branding",
  },
  {
    id: "m4",
    question: "What is the main goal of SEO?",
    options: [
      "To design website layouts",
      "To improve organic (non-paid) visibility in search engines",
      "To run paid ad campaigns",
      "To send bulk emails",
    ],
    answer: 1,
    topic: "Digital Marketing",
  },
  {
    id: "m5",
    question: "What is customer segmentation?",
    options: [
      "Dividing customers into distinct groups based on shared characteristics",
      "Counting total customers",
      "Setting the same price for everyone",
      "Manufacturing in batches",
    ],
    answer: 0,
    topic: "Market Research",
  },
  {
    id: "m6",
    question: "What is a USP (Unique Selling Proposition)?",
    options: [
      "A discount offered to all customers",
      "The one benefit that makes a product different from competitors",
      "A type of sales tax",
      "A government regulation on products",
    ],
    answer: 1,
    topic: "Branding",
  },
  {
    id: "m7",
    question: "What is content marketing?",
    options: [
      "Placing ads on TV",
      "Creating and distributing valuable content to attract and retain a target audience",
      "Cold-calling potential customers",
      "Selling products at a discount",
    ],
    answer: 1,
    topic: "Digital Marketing",
  },
  {
    id: "m8",
    question: "In the marketing funnel, which stage comes right after Awareness?",
    options: ["Purchase", "Interest", "Loyalty", "Advocacy"],
    answer: 1,
    topic: "Consumer Behaviour",
  },
  {
    id: "m9",
    question: "What is the primary purpose of market research?",
    options: [
      "To design products",
      "To gather insights about consumer needs, preferences and market conditions",
      "To set up a factory",
      "To hire employees",
    ],
    answer: 1,
    topic: "Market Research",
  },
  {
    id: "m10",
    question: "What is B2C marketing?",
    options: [
      "Business-to-Community marketing",
      "Business-to-Consumer marketing — selling directly to individual buyers",
      "Brand-to-Consumer marketing",
      "Bulk-to-Customer marketing",
    ],
    answer: 1,
    topic: "Marketing Fundamentals",
  },
];

// ============ BUSINESS DEGREES: FINANCE ============

export const FINANCE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "f1",
    question: "What is the formula for profit?",
    options: ["Revenue + Costs", "Revenue - Costs", "Revenue × Costs", "Revenue / Costs"],
    answer: 1,
    topic: "Accounting Basics",
  },
  {
    id: "f2",
    question: "What is ROI?",
    options: [
      "Rate of Inflation",
      "Return on Investment — the gain relative to the cost of an investment",
      "Revenue Over Income",
      "Risk of Interest",
    ],
    answer: 1,
    topic: "Financial Analysis",
  },
  {
    id: "f3",
    question: "What does a balance sheet show?",
    options: [
      "Monthly sales figures",
      "Assets, liabilities and shareholder equity at a point in time",
      "Employee salaries",
      "Customer reviews",
    ],
    answer: 1,
    topic: "Accounting Basics",
  },
  {
    id: "f4",
    question: "What is cash flow?",
    options: [
      "The speed of water in a pipe",
      "The movement of money in and out of a business over a period",
      "The number of coins a business has",
      "The interest rate on a loan",
    ],
    answer: 1,
    topic: "Financial Analysis",
  },
  {
    id: "f5",
    question: "What is depreciation?",
    options: [
      "An increase in asset value over time",
      "The gradual decrease in the value of a tangible asset over its useful life",
      "A type of tax refund",
      "A rise in stock prices",
    ],
    answer: 1,
    topic: "Accounting Basics",
  },
  {
    id: "f6",
    question: "What does a P&L statement report?",
    options: [
      "Payroll and Leave",
      "Profit and Loss — revenues earned and expenses incurred over a period",
      "Products and Logistics",
      "People and Leadership",
    ],
    answer: 1,
    topic: "Financial Reporting",
  },
  {
    id: "f7",
    question: "What is EBITDA?",
    options: [
      "Earnings Before Interest, Taxes, Depreciation and Amortization",
      "Equity Before Income, Tax, Debt and Assets",
      "Estimated Budget for IT, Technology, Development and Analytics",
      "Earnings Before International Trade and Digital Assets",
    ],
    answer: 0,
    topic: "Financial Reporting",
  },
  {
    id: "f8",
    question: "What does 'time value of money' mean?",
    options: [
      "Old money is worth less than new money",
      "A sum of money today is worth more than the same sum in the future due to earning potential",
      "Coins are worth more than notes",
      "Money loses value every day",
    ],
    answer: 1,
    topic: "Financial Concepts",
  },
  {
    id: "f9",
    question: "What is a budget?",
    options: [
      "A type of bank loan",
      "A financial plan that outlines expected income and expenses over a set period",
      "An employee benefit",
      "A product discount",
    ],
    answer: 1,
    topic: "Financial Planning",
  },
  {
    id: "f10",
    question: "What is the purpose of financial forecasting?",
    options: [
      "To predict future financial outcomes and guide strategic decisions",
      "To calculate last year's taxes",
      "To count cash in the register",
      "To design the company logo",
    ],
    answer: 0,
    topic: "Financial Planning",
  },
];

// ============ BUSINESS DEGREES: BUSINESS FUNDAMENTALS ============

export const BUSINESS_FUNDAMENTALS_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "b1",
    question: "What is a business model?",
    options: [
      "A physical model of a building",
      "How an organisation creates, delivers and captures value",
      "A type of business card",
      "A marketing campaign",
    ],
    answer: 1,
    topic: "Strategy",
  },
  {
    id: "b2",
    question: "What is a KPI?",
    options: [
      "Key Personal Interest",
      "Key Performance Indicator — a measurable value that shows progress toward a goal",
      "Knowledge Process Integration",
      "Key Product Inventory",
    ],
    answer: 1,
    topic: "Management",
  },
  {
    id: "b3",
    question: "What is supply chain management?",
    options: [
      "Managing the company's bank accounts",
      "Overseeing the flow of goods from raw materials to the end customer",
      "Designing the company website",
      "Managing employee benefits",
    ],
    answer: 1,
    topic: "Operations",
  },
  {
    id: "b4",
    question: "What is project management?",
    options: [
      "Managing a single employee",
      "Planning, executing and closing projects to achieve specific goals on time and within budget",
      "Designing project reports",
      "Running a factory",
    ],
    answer: 1,
    topic: "Operations",
  },
  {
    id: "b5",
    question: "What does HR planning involve?",
    options: [
      "Designing office furniture",
      "Forecasting an organisation's future human resource needs and ensuring the right people are in the right roles",
      "Filing tax returns",
      "Creating social media posts",
    ],
    answer: 1,
    topic: "Human Resources",
  },
  {
    id: "b6",
    question: "What is stakeholder management?",
    options: [
      "Managing the company's stock price",
      "Identifying, analysing and engaging with people who have an interest in a project or organisation",
      "Managing仓库 inventory",
      "Writing code for a website",
    ],
    answer: 1,
    topic: "Strategy",
  },
  {
    id: "b7",
    question: "What is change management?",
    options: [
      "Exchanging currency",
      "A structured approach to transitioning individuals and organisations from a current state to a desired future state",
      "Changing a light bulb",
      "Updating software",
    ],
    answer: 1,
    topic: "Management",
  },
  {
    id: "b8",
    question: "What is organisational structure?",
    options: [
      "The building layout of the office",
      "The system that outlines how activities, roles and responsibilities are directed and coordinated",
      "The company's dress code",
      "The type of chairs used",
    ],
    answer: 1,
    topic: "Management",
  },
  {
    id: "b9",
    question: "What does OKR stand for?",
    options: [
      "Office Key Requirements",
      "Objectives and Key Results — a goal-setting framework",
      "Operational Knowledge Review",
      "Online Knowledge Repository",
    ],
    answer: 1,
    topic: "Strategy",
  },
  {
    id: "b10",
    question: "What is business ethics?",
    options: [
      "The cost of running a business",
      "Moral principles and values that guide behaviour and decision-making in the business world",
      "A type of business license",
      "The company's profit margin",
    ],
    answer: 1,
    topic: "Ethics",
  },
];

// ============ B.Sc / M.Sc: DATA & ANALYTICS ============

export const DATA_ANALYTICS_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "d1",
    question: "What is the difference between data and information?",
    options: [
      "They are the same thing",
      "Data is raw facts; information is processed and organised data",
      "Information is always numeric; data is always text",
      "Data comes from the internet; information comes from books",
    ],
    answer: 1,
    topic: "Data Concepts",
  },
  {
    id: "d2",
    question: "What is SQL primarily used for?",
    options: [
      "Creating graphic designs",
      "Querying and managing data in relational databases",
      "Building mobile apps",
      "Sending emails",
    ],
    answer: 1,
    topic: "SQL",
  },
  {
    id: "d3",
    question: "What is the purpose of data visualisation?",
    options: [
      "To encrypt data",
      "To present data in graphical or visual formats so patterns and insights are easier to understand",
      "To delete old records",
      "To compress files",
    ],
    answer: 1,
    topic: "Data Visualisation",
  },
  {
    id: "d4",
    question: "What is correlation?",
    options: [
      "When one variable directly causes another to change",
      "A statistical relationship between two variables that move together",
      "A type of database query",
      "A method of data entry",
    ],
    answer: 1,
    topic: "Statistics",
  },
  {
    id: "d5",
    question: "What is a pivot table?",
    options: [
      "A type of office furniture",
      "A data summarisation tool in spreadsheets that groups and rearranges data to find patterns",
      "A database backup method",
      "A chart type",
    ],
    answer: 1,
    topic: "Excel & Spreadsheets",
  },
  {
    id: "d6",
    question: "What does 'data cleaning' involve?",
    options: [
      "Deleting all old data",
      "Detecting and correcting (or removing) corrupt, inaccurate or irrelevant records from a dataset",
      "Shredding paper documents",
      "Installing antivirus software",
    ],
    answer: 1,
    topic: "Data Preparation",
  },
  {
    id: "d7",
    question: "What is descriptive statistics?",
    options: [
      "Making up stories about data",
      "Methods for summarising and describing the main features of a dataset",
      "Predicting future trends",
      "Storing data in the cloud",
    ],
    answer: 1,
    topic: "Statistics",
  },
  {
    id: "d8",
    question: "What is A/B testing?",
    options: [
      "Testing two versions of something to see which performs better",
      "Grading students A through B",
      "Checking blood type",
      "A type of software bug",
    ],
    answer: 0,
    topic: "Analytics",
  },
  {
    id: "d9",
    question: "What is a data pipeline?",
    options: [
      "A water pipe in a data centre",
      "A series of steps that move and transform data from a source system to a destination",
      "A type of network cable",
      "A method of data entry",
    ],
    answer: 1,
    topic: "Data Engineering",
  },
  {
    id: "d10",
    question: "What is the primary goal of data analytics?",
    options: [
      "To store more data",
      "To discover useful information, draw conclusions and support decision-making",
      "To delete unnecessary files",
      "To design databases",
    ],
    answer: 1,
    topic: "Data Concepts",
  },
];

export interface AssessmentSet {
  type: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
}

export const ASSESSMENT_SETS: AssessmentSet[] = [
  {
    type: "TECHNICAL",
    title: "Technical Fundamentals",
    description: "10 questions on DSA, databases, OOP, OS and web basics.",
    questions: TECHNICAL_QUESTIONS,
  },
  {
    type: "APTITUDE",
    title: "Aptitude & Reasoning",
    description: "Quantitative, logical and verbal ability — like placement tests.",
    questions: APTITUDE_QUESTIONS,
  },
  {
    type: "COMMUNICATION",
    title: "Communication & Soft Skills",
    description: "Interview etiquette, emails and behavioral readiness.",
    questions: COMMUNICATION_QUESTIONS,
  },
  {
    type: "MARKETING",
    title: "Marketing & Digital Strategy",
    description: "Brand positioning, SEO, market research and the 4Ps.",
    questions: MARKETING_QUESTIONS,
  },
  {
    type: "FINANCE",
    title: "Finance & Accounting Basics",
    description: "P&L, cash flow, ROI, depreciation and financial planning.",
    questions: FINANCE_QUESTIONS,
  },
  {
    type: "BUSINESS",
    title: "Business & Management Fundamentals",
    description: "Strategy, KPIs, project management, HR and operations.",
    questions: BUSINESS_FUNDAMENTALS_QUESTIONS,
  },
  {
    type: "DATA",
    title: "Data & Analytics Fundamentals",
    description: "SQL, statistics, data cleaning, visualisation and analytics concepts.",
    questions: DATA_ANALYTICS_QUESTIONS,
  },
];

// Select the right three assessments based on the student's degree
export function getAssessmentSetsForProfile(degree: string | null | undefined): AssessmentSet[] {
  const d = (degree ?? "").toLowerCase();

  // Business degrees
  if (d.includes("bba") || d.includes("mba")) {
    return [
      ASSESSMENT_SETS.find((s) => s.type === "BUSINESS")!,
      ASSESSMENT_SETS.find((s) => s.type === "MARKETING")!,
      ASSESSMENT_SETS.find((s) => s.type === "COMMUNICATION")!,
    ];
  }

  // Science / research degrees
  if (d.includes("b.sc") || d.includes("m.sc")) {
    return [
      ASSESSMENT_SETS.find((s) => s.type === "DATA")!,
      ASSESSMENT_SETS.find((s) => s.type === "APTITUDE")!,
      ASSESSMENT_SETS.find((s) => s.type === "COMMUNICATION")!,
    ];
  }

  // Technical degrees (B.Tech, B.E, BCA, MCA, M.Tech) — default
  return [
    ASSESSMENT_SETS.find((s) => s.type === "TECHNICAL")!,
    ASSESSMENT_SETS.find((s) => s.type === "APTITUDE")!,
    ASSESSMENT_SETS.find((s) => s.type === "COMMUNICATION")!,
  ];
}

// ============ PLACEMENT PREP: APTITUDE PRACTICE SETS ============

export interface PracticeSet {
  key: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
}

export const APTITUDE_PRACTICE_SETS: PracticeSet[] = [
  {
    key: "quant",
    title: "Quantitative Aptitude",
    description: "Percentages, ratios, work-time, profit & loss — the staples of every placement test.",
    questions: [
      {
        id: "pq1",
        question: "A shopkeeper sells an item at 20% profit. If the cost price is ₹500, what is the selling price?",
        options: ["₹550", "₹600", "₹620", "₹640"],
        answer: 1,
        topic: "Percentages",
      },
      {
        id: "pq2",
        question: "The ratio of ages of A and B is 4:5. If B is 25, what is A's age?",
        options: ["18", "20", "22", "24"],
        answer: 1,
        topic: "Ratios",
      },
      {
        id: "pq3",
        question: "A pipe fills a tank in 6 hours and another empties it in 12 hours. Together, how long to fill the tank?",
        options: ["6 hours", "9 hours", "12 hours", "18 hours"],
        answer: 2,
        topic: "Work & Time",
      },
      {
        id: "pq4",
        question: "If the price of a shirt increases from ₹400 to ₹480, what is the percentage increase?",
        options: ["15%", "18%", "20%", "25%"],
        answer: 2,
        topic: "Percentages",
      },
      {
        id: "pq5",
        question: "A car travels 120 km in 2 hours. What is its average speed?",
        options: ["50 km/hr", "55 km/hr", "60 km/hr", "65 km/hr"],
        answer: 2,
        topic: "Speed & Distance",
      },
      {
        id: "pq6",
        question: "What is the simple interest on ₹2000 at 5% per annum for 2 years?",
        options: ["₹100", "₹150", "₹200", "₹250"],
        answer: 2,
        topic: "Simple Interest",
      },
    ],
  },
  {
    key: "logical",
    title: "Logical Reasoning",
    description: "Series, puzzles, syllogisms and arrangements used in aptitude rounds.",
    questions: [
      {
        id: "pl1",
        question: "Find the next number: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "46"],
        answer: 1,
        topic: "Number Series",
      },
      {
        id: "pl2",
        question: "All pens are books. All books are tables. Which conclusion follows?",
        options: ["All tables are pens", "All pens are tables", "Some tables are not books", "No pen is a table"],
        answer: 1,
        topic: "Syllogisms",
      },
      {
        id: "pl3",
        question: "If CAT is coded as DBU, how is DOG coded?",
        options: ["EPH", "EOH", "FQH", "EPI"],
        answer: 0,
        topic: "Coding-Decoding",
      },
      {
        id: "pl4",
        question: "Pointing to a photo, Ram says, 'She is the daughter of my grandfather's only son.' Who is she?",
        options: ["Ram's mother", "Ram's sister", "Ram's aunt", "Ram's cousin"],
        answer: 1,
        topic: "Blood Relations",
      },
      {
        id: "pl5",
        question: "In a row of 40 students, A is 12th from the left. What is his position from the right?",
        options: ["27th", "28th", "29th", "30th"],
        answer: 2,
        topic: "Ranking",
      },
      {
        id: "pl6",
        question: "Which pair is different from the others?",
        options: ["9 : 81", "7 : 49", "6 : 36", "5 : 20"],
        answer: 3,
        topic: "Odd One Out",
      },
    ],
  },
  {
    key: "verbal",
    title: "Verbal Ability",
    description: "Synonyms, antonyms, sentence correction and reading comprehension essentials.",
    questions: [
      {
        id: "pv1",
        question: "Choose the antonym of 'transparent':",
        options: ["Clear", "Opaque", "Bright", "Visible"],
        answer: 1,
        topic: "Antonyms",
      },
      {
        id: "pv2",
        question: "Choose the correctly spelt word:",
        options: ["Occurrence", "Occurence", "Ocurrence", "Occurence"],
        answer: 0,
        topic: "Spelling",
      },
      {
        id: "pv3",
        question: "The synonym of 'meticulous' is:",
        options: ["Careless", "Detail-oriented", "Hasty", "Rough"],
        answer: 1,
        topic: "Synonyms",
      },
      {
        id: "pv4",
        question: "Choose the grammatically correct sentence:",
        options: [
          "He don't like coffee.",
          "He doesn't likes coffee.",
          "He doesn't like coffee.",
          "He do not likes coffee.",
        ],
        answer: 2,
        topic: "Sentence Correction",
      },
      {
        id: "pv5",
        question: "The idiom 'to beat around the bush' means:",
        options: [
          "To talk about the main point directly",
          "To avoid the main topic",
          "To work in a garden",
          "To speak very quickly",
        ],
        answer: 1,
        topic: "Idioms",
      },
      {
        id: "pv6",
        question: "Choose the word closest in meaning to 'consensus':",
        options: ["Conflict", "Agreement", "Dispute", "Debate"],
        answer: 1,
        topic: "Synonyms",
      },
    ],
  },
];
