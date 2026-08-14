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
];

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
