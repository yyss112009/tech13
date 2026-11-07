/**
 * Tech Dada - Data Repository & Storage Manager (English Edition)
 * Includes Standards, Mediums, Notes, Problems, and Notifications
 */

const DEFAULT_STANDARDS = [
  {
    id: "std-8",
    name: "8th Standard",
    badge: "Foundation Level",
    color: "from-blue-600 to-cyan-500",
    icon: "backpack",
    desc: "Comprehensive study notes for General Science, Mathematics, English, and Social Sciences with chapter-wise solved exercises.",
    totalNotes: 14
  },
  {
    id: "std-9",
    name: "9th Standard",
    badge: "Pre-Board Prep",
    color: "from-emerald-600 to-teal-500",
    icon: "book-open",
    desc: "In-depth notes on Science & Technology, Algebra, Geometry, and Languages designed for strong conceptual clarity.",
    totalNotes: 18
  },
  {
    id: "std-10",
    name: "10th Standard",
    badge: "SSC Board Special",
    color: "from-purple-600 to-pink-500",
    icon: "graduation-cap",
    desc: "Board Exam Master Pack: Formula sheets, previous years' question banks, topper handwritten notes, and high-weightage topics.",
    totalNotes: 26
  }
];

const MEDIUMS = [
  {
    id: "marathi",
    name: "Marathi Medium",
    subtitle: "Complete State Board curriculum explained simply in Marathi",
    tagline: "Marathi medium textbooks, question papers & notes",
    icon: "book-marked",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "semi-english",
    name: "Semi-English Medium",
    subtitle: "Maths & Science in English, Social Sciences in Marathi",
    tagline: "Semi-English medium syllabus & handwritten guides",
    icon: "globe",
    color: "from-indigo-500 to-blue-600"
  }
];

const INITIAL_NOTES = [
  // 10th Standard - Marathi Medium
  {
    id: "note-10-m-1",
    standardId: "std-10",
    mediumId: "marathi",
    subject: "Science & Technology Part 1",
    title: "Chapter 1: Gravitation - Complete Notes & Formulas (Marathi Medium)",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 12,
    size: "2.4 MB",
    downloads: 1284,
    date: "2026-10-15",
    description: "Kepler's Three Laws, Newton's Universal Law of Gravitation, Free Fall, Acceleration due to gravity (g), and Escape Velocity with solved questions.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-10-m-2",
    standardId: "std-10",
    mediumId: "marathi",
    subject: "Mathematics Part 1 (Algebra)",
    title: "Chapter 2: Quadratic Equations - Factoring & Formula Method",
    chapter: "Chapter 2",
    author: "Tech Dada",
    pages: 16,
    size: "3.1 MB",
    downloads: 2150,
    date: "2026-10-18",
    description: "Easy tricks to solve quadratic equations, value of discriminant (Delta), nature of roots, and application-based word problems.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-10-m-3",
    standardId: "std-10",
    mediumId: "marathi",
    subject: "Mathematics Part 2 (Geometry)",
    title: "Chapter 2: Pythagoras Theorem & Geometric Proofs",
    chapter: "Chapter 2",
    author: "Tech Dada",
    pages: 14,
    size: "2.2 MB",
    downloads: 1840,
    date: "2026-10-25",
    description: "Proof of Pythagoras Theorem, Similarity of Right Angled Triangles, Geometric Mean Theorem, and Apollonius Theorem with step-by-step proofs.",
    fileUrl: null,
    isSample: true
  },

  // 10th Standard - Semi-English Medium
  {
    id: "note-10-s-1",
    standardId: "std-10",
    mediumId: "semi-english",
    subject: "Science & Technology Part 1",
    title: "Chapter 1: Gravitation - Full Notes, Formulas & Solved Numericals",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 15,
    size: "3.2 MB",
    downloads: 3410,
    date: "2026-10-20",
    description: "Comprehensive notes covering Kepler's 3 Laws, Universal Law of Gravitation, Mass vs Weight, and Escape Velocity with Board Exam sample questions.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-10-s-2",
    standardId: "std-10",
    mediumId: "semi-english",
    subject: "Mathematics Part 1 (Algebra)",
    title: "Chapter 1: Linear Equations in Two Variables - Cramer's Rule",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 18,
    size: "2.9 MB",
    downloads: 2890,
    date: "2026-10-24",
    description: "Step-by-step solutions for Determinant method (Cramer's Rule), graphical method, and word problems based on age, distance, and numbers.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-10-s-3",
    standardId: "std-10",
    mediumId: "semi-english",
    subject: "Science & Technology Part 2",
    title: "Chapter 2: Life Processes in Living Organisms Part 1",
    chapter: "Chapter 2",
    author: "Tech Dada",
    pages: 12,
    size: "2.6 MB",
    downloads: 1560,
    date: "2026-10-28",
    description: "Detailed cellular respiration flowcharts (Glycolysis, Krebs Cycle, ETC) and labeled diagrams for Mitosis and Meiosis cell division phases.",
    fileUrl: null,
    isSample: true
  },

  // 9th Standard - Marathi Medium
  {
    id: "note-9-m-1",
    standardId: "std-9",
    mediumId: "marathi",
    subject: "Science & Technology",
    title: "Chapter 1: Laws of Motion - Newton's Laws & Equations",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 11,
    size: "2.1 MB",
    downloads: 1120,
    date: "2026-10-10",
    description: "Speed, velocity, acceleration, Newton's 3 laws of motion, and law of conservation of momentum with solved numerical problems.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-9-m-2",
    standardId: "std-9",
    mediumId: "marathi",
    subject: "Mathematics Part 1",
    title: "Chapter 1: Sets - Venn Diagrams & Operations on Sets",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 9,
    size: "1.8 MB",
    downloads: 870,
    date: "2026-10-12",
    description: "Types of sets, union and intersection of sets, complement of a set, and problem-solving through Venn diagrams.",
    fileUrl: null,
    isSample: true
  },

  // 9th Standard - Semi-English
  {
    id: "note-9-s-1",
    standardId: "std-9",
    mediumId: "semi-english",
    subject: "Science & Technology",
    title: "Chapter 1: Laws of Motion - Equations & Practical Problems",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 13,
    size: "2.5 MB",
    downloads: 1450,
    date: "2026-10-14",
    description: "Distance-time graphs, graphical derivations of the 3 kinematic equations, and practical numerical examples.",
    fileUrl: null,
    isSample: true
  },

  // 8th Standard - Marathi Medium
  {
    id: "note-8-m-1",
    standardId: "std-8",
    mediumId: "marathi",
    subject: "General Science",
    title: "Chapter 1: Living World & Classification of Microbes",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 8,
    size: "1.7 MB",
    downloads: 950,
    date: "2026-10-05",
    description: "Robert Whittaker's Five Kingdom classification system, characteristics of bacteria, viruses, fungi, and protozoa.",
    fileUrl: null,
    isSample: true
  },
  {
    id: "note-8-m-2",
    standardId: "std-8",
    mediumId: "marathi",
    subject: "Mathematics",
    title: "Chapter 1: Rational & Irrational Numbers",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 10,
    size: "1.9 MB",
    downloads: 1320,
    date: "2026-10-08",
    description: "Representing irrational numbers on a number line, decimal representation of rational numbers, and practice questions.",
    fileUrl: null,
    isSample: true
  },

  // 8th Standard - Semi-English
  {
    id: "note-8-s-1",
    standardId: "std-8",
    mediumId: "semi-english",
    subject: "General Science",
    title: "Chapter 1: Living World & Classification of Microbes (English)",
    chapter: "Chapter 1",
    author: "Tech Dada",
    pages: 9,
    size: "1.9 MB",
    downloads: 1080,
    date: "2026-10-09",
    description: "Kingdom Monera, Protista, Fungi, Plantae, and Animalia with clear classification diagrams and summary notes.",
    fileUrl: null,
    isSample: true
  }
];

const INITIAL_PROBLEMS = [
  {
    id: "prob-1",
    studentName: "Rohan Patil",
    standard: "10th Standard (Marathi Medium)",
    message: "Dada, I am finding Kepler's 3 Laws of Gravitation difficult to understand. Could you please explain them simply along with exam diagrams?",
    image: null,
    timestamp: "2026-11-06 14:30",
    status: "replied",
    reply: "Hey Rohan! Don't worry, Kepler's 3 Laws are very straightforward:\n1. The orbit of a planet is an ellipse with the Sun at one of the foci.\n2. The line joining the planet and the Sun sweeps equal areas in equal intervals of time.\n3. The square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of a planet from the Sun (T² ∝ r³).\nCheck Page 3 of our 10th Science Part 1 Notes for the clear diagram!",
    repliedAt: "2026-11-06 16:15",
    adminName: "Tech Dada"
  },
  {
    id: "prob-2",
    studentName: "Snehal Kadam",
    standard: "10th Standard (Semi-English)",
    message: "Dada, in Quadratic Equations, when discriminant (b² - 4ac) < 0, what are the roots? Can we solve it further in 10th standard syllabus?",
    image: null,
    timestamp: "2026-11-07 10:15",
    status: "pending",
    reply: null,
    repliedAt: null,
    adminName: null
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    targetRole: "user",
    title: "Dada replied to your problem! 🎉",
    message: "Rohan Patil, Tech Dada has provided a detailed solution to your question on Kepler's Laws. Click to view.",
    relatedProblemId: "prob-1",
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: "notif-2",
    targetRole: "admin",
    title: "New Student Question Received! 📩",
    message: "Snehal Kadam (10th Standard Semi-English) asked a doubt about Quadratic Equations.",
    relatedProblemId: "prob-2",
    timestamp: "10 mins ago",
    read: false
  }
];

/**
 * Storage Helper using LocalStorage with fallback
 */
class AppStorage {
  static get(key, defaultValue) {
    try {
      const data = localStorage.getItem(`techdada_en_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn("LocalStorage read error, using default", e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(`techdada_en_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("LocalStorage write error", e);
    }
  }

  static init() {
    if (!localStorage.getItem("techdada_en_standards")) {
      this.set("standards", DEFAULT_STANDARDS);
    }
    if (!localStorage.getItem("techdada_en_notes")) {
      this.set("notes", INITIAL_NOTES);
    }
    if (!localStorage.getItem("techdada_en_problems")) {
      this.set("problems", INITIAL_PROBLEMS);
    }
    if (!localStorage.getItem("techdada_en_notifications")) {
      this.set("notifications", INITIAL_NOTIFICATIONS);
    }
  }

  static reset() {
    this.set("standards", DEFAULT_STANDARDS);
    this.set("notes", INITIAL_NOTES);
    this.set("problems", INITIAL_PROBLEMS);
    this.set("notifications", INITIAL_NOTIFICATIONS);
  }
}

// Global container
window.TechDadaData = {
  DEFAULT_STANDARDS,
  MEDIUMS,
  INITIAL_NOTES,
  INITIAL_PROBLEMS,
  INITIAL_NOTIFICATIONS,
  AppStorage
};
