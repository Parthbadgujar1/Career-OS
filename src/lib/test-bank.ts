export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export const PROGRESS_TEST_QUESTIONS = 30;
export const PROGRESS_TEST_MINUTES = 30;

export const EASY_QUESTIONS: TestQuestion[] = [
  { id: "e1", question: "Which data structure follows FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1, topic: "Data Structures", difficulty: "EASY" },
  { id: "e2", question: "Which data structure follows LIFO?", options: ["Stack", "Queue", "Array", "Hash Map"], answer: 0, topic: "Data Structures", difficulty: "EASY" },
  { id: "e3", question: "Which is NOT a valid Python data type?", options: ["List", "Tuple", "Struct", "Dictionary"], answer: 2, topic: "Python", difficulty: "EASY" },
  { id: "e4", question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: 1, topic: "Algorithms", difficulty: "EASY" },
  { id: "e5", question: "Which SQL keyword retrieves data?", options: ["GET", "SELECT", "FETCH", "PULL"], answer: 1, topic: "SQL", difficulty: "EASY" },
  { id: "e6", question: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], answer: 2, topic: "Web", difficulty: "EASY" },
  { id: "e7", question: "Which command deletes a table in SQL?", options: ["DELETE", "DROP", "REMOVE", "CLEAR"], answer: 1, topic: "SQL", difficulty: "EASY" },
  { id: "e8", question: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Processing Unit"], answer: 1, topic: "OS", difficulty: "EASY" },
  { id: "e9", question: "Which Python function returns the length of a list?", options: ["len()", "size()", "length()", "count()"], answer: 0, topic: "Python", difficulty: "EASY" },
  { id: "e10", question: "Which tag is used for the largest heading in HTML?", options: ["<h6>", "<h1>", "<head>", "<big>"], answer: 1, topic: "Web", difficulty: "EASY" },
  { id: "e11", question: "Which of these is a relational database?", options: ["MongoDB", "PostgreSQL", "Redis", "Cassandra"], answer: 1, topic: "DBMS", difficulty: "EASY" },
  { id: "e12", question: "Which is the correct way to declare a variable in JavaScript?", options: ["var x = 5", "x := 5", "int x = 5", "let x = 5"], answer: 3, topic: "JavaScript", difficulty: "EASY" },
  { id: "e13", question: "What is the result of 2 ** 3 in Python?", options: ["6", "8", "9", "5"], answer: 1, topic: "Python", difficulty: "EASY" },
  { id: "e14", question: "Which protocol is used for sending email?", options: ["HTTP", "SMTP", "FTP", "SNMP"], answer: 1, topic: "Networks", difficulty: "EASY" },
  { id: "e15", question: "Which SQL clause is used to sort results?", options: ["ORDER BY", "SORT BY", "GROUP BY", "FILTER"], answer: 0, topic: "SQL", difficulty: "EASY" },
  { id: "e16", question: "Which keyword in Java defines a constant variable?", options: ["const", "final", "static", "fixed"], answer: 1, topic: "Java", difficulty: "EASY" },
  { id: "e17", question: "Which of the following is an operating system?", options: ["Google Chrome", "Linux", "MySQL", "Git"], answer: 1, topic: "OS", difficulty: "EASY" },
  { id: "e18", question: "What is the output of console.log(typeof null) in JavaScript?", options: ["null", "object", "undefined", "number"], answer: 1, topic: "JavaScript", difficulty: "EASY" },
  { id: "e19", question: "A transaction that fails to complete is said to be:", options: ["Rolled back", "Committed", "Normalized", "Indexed"], answer: 0, topic: "DBMS", difficulty: "EASY" },
  { id: "e20", question: "Which of these is NOT a sorting algorithm?", options: ["Bubble Sort", "Merge Sort", "Binary Sort", "Quick Sort"], answer: 2, topic: "Algorithms", difficulty: "EASY" },
  { id: "e21", question: "What is 15% of 200?", options: ["25", "30", "35", "20"], answer: 1, topic: "Quant", difficulty: "EASY" },
  { id: "e22", question: "If x = 4, what does x++ evaluate to in Java (post-increment)?", options: ["5", "4", "6", "3"], answer: 1, topic: "Java", difficulty: "EASY" },
  { id: "e23", question: "Which CSS property changes text color?", options: ["font-style", "color", "text-color", "background"], answer: 1, topic: "Web", difficulty: "EASY" },
  { id: "e24", question: "Which data type stores true/false in most languages?", options: ["Integer", "Boolean", "String", "Float"], answer: 1, topic: "Programming", difficulty: "EASY" },
  { id: "e25", question: "Which layer does a router operate at?", options: ["Physical", "Network", "Session", "Application"], answer: 1, topic: "Networks", difficulty: "EASY" },
  { id: "e26", question: "What does 'git commit' do?", options: ["Deletes files", "Records a snapshot of changes", "Uploads to internet", "Creates a branch"], answer: 1, topic: "Git", difficulty: "EASY" },
  { id: "e27", question: "Which is the antonym of 'transparent'?", options: ["Clear", "Opaque", "Bright", "Visible"], answer: 1, topic: "Verbal", difficulty: "EASY" },
  { id: "e28", question: "If 3 machines produce 30 items in 3 hours, 1 machine produces how many in 1 hour?", options: ["10", "3", "1", "9"], answer: 1, topic: "Quant", difficulty: "EASY" },
  { id: "e29", question: "Which HTML tag creates a line break?", options: ["<br>", "<lb>", "<break>", "<newline>"], answer: 0, topic: "Web", difficulty: "EASY" },
  { id: "e30", question: "Which of the following is a valid SQL command to add a new row?", options: ["INSERT INTO", "ADD ROW", "UPDATE", "ALTER"], answer: 0, topic: "SQL", difficulty: "EASY" },
];

export const MEDIUM_QUESTIONS: TestQuestion[] = [
  { id: "m1", question: "Which data structure is best for implementing a priority queue?", options: ["Stack", "Heap", "Queue", "Linked List"], answer: 1, topic: "Data Structures", difficulty: "MEDIUM" },
  { id: "m2", question: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n²)", "O(log n)", "O(n)"], answer: 1, topic: "Algorithms", difficulty: "MEDIUM" },
  { id: "m3", question: "Which SQL clause filters rows BEFORE grouping?", options: ["HAVING", "WHERE", "FILTER", "GROUP BY"], answer: 1, topic: "SQL", difficulty: "MEDIUM" },
  { id: "m4", question: "What does an INNER JOIN return?", options: ["All rows from left table", "Only matching rows from both tables", "All rows from both tables", "Only unmatched rows"], answer: 1, topic: "SQL", difficulty: "MEDIUM" },
  { id: "m5", question: "Which of these is NOT a principle of OOP?", options: ["Encapsulation", "Inheritance", "Polymorphism", "Compilation"], answer: 3, topic: "OOP", difficulty: "MEDIUM" },
  { id: "m6", question: "What is the time complexity of accessing an array element by index?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], answer: 1, topic: "Data Structures", difficulty: "MEDIUM" },
  { id: "m7", question: "In JavaScript, what is a closure?", options: ["A function with access to its outer scope", "A closed source file", "A data structure", "An error type"], answer: 0, topic: "JavaScript", difficulty: "MEDIUM" },
  { id: "m8", question: "Which isolation level prevents dirty reads?", options: ["READ UNCOMMITTED", "READ COMMITTED", "READ ONLY", "DIRTY READ"], answer: 1, topic: "DBMS", difficulty: "MEDIUM" },
  { id: "m9", question: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], answer: 2, topic: "Algorithms", difficulty: "MEDIUM" },
  { id: "m10", question: "What is the purpose of an index in a database?", options: ["Increase redundancy", "Speed up queries", "Encrypt data", "Limit access"], answer: 1, topic: "DBMS", difficulty: "MEDIUM" },
  { id: "m11", question: "Which HTTP method is idempotent?", options: ["POST", "GET", "DELETE", "PATCH"], answer: 1, topic: "Web", difficulty: "MEDIUM" },
  { id: "m12", question: "Which protocol guarantees reliable delivery?", options: ["UDP", "TCP", "IP", "ICMP"], answer: 1, topic: "Networks", difficulty: "MEDIUM" },
  { id: "m13", question: "What does 'virtual memory' allow?", options: ["Faster CPU", "Using disk as RAM extension", "More monitors", "Faster internet"], answer: 1, topic: "OS", difficulty: "MEDIUM" },
  { id: "m14", question: "What is a deadlock?", options: ["Two processes waiting on each other forever", "A crash of the OS", "A slow network", "A compile error"], answer: 0, topic: "OS", difficulty: "MEDIUM" },
  { id: "m15", question: "In Python, what is the difference between a list and a tuple?", options: ["Lists are immutable, tuples mutable", "Tuples are immutable, lists mutable", "No difference", "Tuples can only hold numbers"], answer: 1, topic: "Python", difficulty: "MEDIUM" },
  { id: "m16", question: "Which normal form eliminates partial dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 1, topic: "DBMS", difficulty: "MEDIUM" },
  { id: "m17", question: "What is the output of '5' + 3 in JavaScript?", options: ["8", "'53'", "53", "Error"], answer: 1, topic: "JavaScript", difficulty: "MEDIUM" },
  { id: "m18", question: "Which data structure uses hash functions for O(1) average lookup?", options: ["Hash Map", "Array", "Stack", "Tree"], answer: 0, topic: "Data Structures", difficulty: "MEDIUM" },
  { id: "m19", question: "Which type of testing verifies the entire application end-to-end?", options: ["Unit", "Integration", "System", "Smoke"], answer: 2, topic: "Testing", difficulty: "MEDIUM" },
  { id: "m20", question: "What is the worst-case time to insert into a binary search tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, topic: "Data Structures", difficulty: "MEDIUM" },
  { id: "m21", question: "A shop marks an item up by 25% and sells at 100. Cost price is?", options: ["75", "80", "85", "70"], answer: 1, topic: "Quant", difficulty: "MEDIUM" },
  { id: "m22", question: "Which SQL statement removes duplicate rows in a query?", options: ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT ONLY", "SELECT NOCOPY"], answer: 1, topic: "SQL", difficulty: "MEDIUM" },
  { id: "m23", question: "What is recursion?", options: ["A function calling itself", "A loop inside a loop", "An infinite loop", "A type of array"], answer: 0, topic: "Algorithms", difficulty: "MEDIUM" },
  { id: "m24", question: "Which layer of the OSI model handles encryption?", options: ["Transport", "Presentation", "Session", "Network"], answer: 1, topic: "Networks", difficulty: "MEDIUM" },
  { id: "m25", question: "In Java, which keyword is used to inherit a class?", options: ["extends", "implements", "inherits", "using"], answer: 0, topic: "Java", difficulty: "MEDIUM" },
  { id: "m26", question: "Which design principle states that classes should be open for extension but closed for modification?", options: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Dependency Inversion"], answer: 1, topic: "Design", difficulty: "MEDIUM" },
  { id: "m27", question: "The synonym of 'meticulous' is:", options: ["Careless", "Detail-oriented", "Hasty", "Rough"], answer: 1, topic: "Verbal", difficulty: "MEDIUM" },
  { id: "m28", question: "Which of these best describes a REST API?", options: ["Client-server, stateless, resource-based", "Stateful socket connection", "Batch file transfer", "Binary protocol"], answer: 0, topic: "Web", difficulty: "MEDIUM" },
  { id: "m29", question: "Which git command creates a new branch and switches to it?", options: ["git branch", "git checkout -b", "git switch-only", "git new-branch"], answer: 1, topic: "Git", difficulty: "MEDIUM" },
  { id: "m30", question: "If A is twice B and B is 10, what is A + B?", options: ["20", "30", "15", "25"], answer: 1, topic: "Quant", difficulty: "MEDIUM" },
];

export const HARD_QUESTIONS: TestQuestion[] = [
  { id: "h1", question: "Which graph traversal uses a stack (implicitly or explicitly)?", options: ["BFS", "DFS", "Topological via queue", "None"], answer: 1, topic: "Algorithms", difficulty: "HARD" },
  { id: "h2", question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, topic: "Algorithms", difficulty: "HARD" },
  { id: "h3", question: "Which SQL clause is evaluated after GROUP BY?", options: ["WHERE", "HAVING", "SELECT", "FROM"], answer: 1, topic: "SQL", difficulty: "HARD" },
  { id: "h4", question: "What is the result of the expression: null === undefined in JavaScript?", options: ["true", "false", "TypeError", "NaN"], answer: 1, topic: "JavaScript", difficulty: "HARD" },
  { id: "h5", question: "Which scheduling algorithm minimizes average waiting time?", options: ["FCFS", "SJF", "Round Robin", "Priority"], answer: 1, topic: "OS", difficulty: "HARD" },
  { id: "h6", question: "In DBMS, which normal form requires every non-key attribute to depend on the whole primary key?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 1, topic: "DBMS", difficulty: "HARD" },
  { id: "h7", question: "Which TCP handshake is used to terminate a connection?", options: ["SYN-ACK", "FIN-ACK", "RST-ACK", "ACK-ACK"], answer: 1, topic: "Networks", difficulty: "HARD" },
  { id: "h8", question: "What is the amortized time complexity of inserting into a dynamic array?", options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], answer: 1, topic: "Data Structures", difficulty: "HARD" },
  { id: "h9", question: "Which algorithm finds the shortest path in a graph with negative weights?", options: ["Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Prim's"], answer: 1, topic: "Algorithms", difficulty: "HARD" },
  { id: "h10", question: "What is the time complexity of building a heap from an array?", options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], answer: 0, topic: "Algorithms", difficulty: "HARD" },
  { id: "h11", question: "Which isolation level uses range locks and can cause phantom reads to be prevented?", options: ["READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE", "READ UNCOMMITTED"], answer: 2, topic: "DBMS", difficulty: "HARD" },
  { id: "h12", question: "In C++/Python, which of these algorithms runs in O(n log n) worst case and is stable?", options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], answer: 2, topic: "Algorithms", difficulty: "HARD" },
  { id: "h13", question: "Which principle of CAP theorem states the system remains operational during partitions?", options: ["Consistency", "Availability", "Partition tolerance", "Durability"], answer: 2, topic: "Design", difficulty: "HARD" },
  { id: "h14", question: "What happens when a process in a deadlock is part of a circular wait?", options: ["It completes", "It waits forever", "It restarts", "It crashes"], answer: 1, topic: "OS", difficulty: "HARD" },
  { id: "h15", question: "Which SQL function computes a running total?", options: ["SUM() OVER ()", "TOTAL()", "CUMULATIVE()", "AGGREGATE()"], answer: 0, topic: "SQL", difficulty: "HARD" },
  { id: "h16", question: "Which data structure supports efficient insertion and search in O(log n)?", options: ["AVL Tree", "Singly Linked List", "Static Array", "Stack"], answer: 0, topic: "Data Structures", difficulty: "HARD" },
  { id: "h17", question: "Which HTTP header is used for content negotiation?", options: ["Accept", "Content-Encoding", "Location", "ETag"], answer: 0, topic: "Web", difficulty: "HARD" },
  { id: "h18", question: "What does the 'yield' keyword do in Python generators?", options: ["Stops execution permanently", "Pauses and returns a value", "Throws an error", "Deletes a variable"], answer: 1, topic: "Python", difficulty: "HARD" },
  { id: "h19", question: "Which type of join returns all rows from the left table and matches from the right?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], answer: 1, topic: "SQL", difficulty: "HARD" },
  { id: "h20", question: "In Java, which collection provides thread-safe behavior by default?", options: ["HashMap", "Hashtable", "ArrayList", "HashSet"], answer: 1, topic: "Java", difficulty: "HARD" },
  { id: "h21", question: "A train crosses a pole in 15s at 72 km/h. Train length is?", options: ["300m", "200m", "400m", "150m"], answer: 0, topic: "Quant", difficulty: "HARD" },
  { id: "h22", question: "Which algorithm detects cycles in a directed graph?", options: ["BFS", "DFS with recursion stack", "Dijkstra", "Kruskal"], answer: 1, topic: "Algorithms", difficulty: "HARD" },
  { id: "h23", question: "Which protocol is used to translate domain names to IP addresses?", options: ["DNS", "DHCP", "ARP", "NAT"], answer: 0, topic: "Networks", difficulty: "HARD" },
  { id: "h24", question: "What is a 'race condition'?", options: ["Two threads racing for CPU speed", "Output depends on the order of execution", "A network delay", "A type of loop"], answer: 1, topic: "OS", difficulty: "HARD" },
  { id: "h25", question: "Which of these is true about a B-tree?", options: ["Self-balancing multi-way tree", "Binary search tree", "Heap", "Linked structure with one child"], answer: 0, topic: "Data Structures", difficulty: "HARD" },
  { id: "h26", question: "In Python, which method is called when an object is used in a with statement?", options: ["__enter__", "__exit__", "close()", "open()"], answer: 0, topic: "Python", difficulty: "HARD" },
  { id: "h27", question: "Which normal form guarantees no transitive dependency on a non-key attribute?", options: ["2NF", "3NF", "1NF", "BCNF"], answer: 1, topic: "DBMS", difficulty: "HARD" },
  { id: "h28", question: "What is the time complexity of finding the median of two sorted arrays using an optimal divide-and-conquer?", options: ["O(n+m)", "O(log(min(n,m)))", "O(n log m)", "O(nm)"], answer: 1, topic: "Algorithms", difficulty: "HARD" },
  { id: "h29", question: "Which caching strategy evicts the least recently used item?", options: ["FIFO", "LRU", "LFU", "MRU"], answer: 1, topic: "Design", difficulty: "HARD" },
  { id: "h30", question: "If the sum of a number and its reciprocal is 2, the number is?", options: ["0", "1", "2", "3"], answer: 1, topic: "Quant", difficulty: "HARD" },
];

export const TEST_BANK = {
  EASY: EASY_QUESTIONS,
  MEDIUM: MEDIUM_QUESTIONS,
  HARD: HARD_QUESTIONS,
} as const;

export type TestDifficulty = keyof typeof TEST_BANK;
