/**
 * Locked Phase 1 marketing copy. Edit here only — not inline in JSX.
 * No fake stats, testimonials, partners, or accreditation claims.
 */

export const site = {
  name: "CAITECH Global Institute",
  shortName: "CAITECH",
  tagline: "Technical education for working practice",
  description:
    "CAITECH Global Institute delivers career-relevant training in CAD, engineering, ICT, electronics, construction technology, and applied digital skills — taught for real project work.",
} as const;

export const hero = {
  eyebrow: "CAITECH Global Institute",
  title: "Technical skill for work that ships.",
  lede:
    "CAD, engineering, ICT, electronics, and construction technology — taught for work that actually gets done on site, in studio, and in industry teams.",
  primaryCta: { label: "Browse courses", href: "/courses" },
  secondaryCta: { label: "Explore AI Path", href: "/ai-path" },
  meta: ["Nairobi CBD", "Practice-led", "Technical training"],
  figureLabel: "Fig. 01 — Hands-on technical practice",
} as const;

export const schools = {
  eyebrow: "Learning areas",
  title: "Schools and disciplines",
  lede: "Study paths aligned to real technical domains — not a generic course marketplace.",
  exploreCta: "Explore programmes",
  items: [
    {
      name: "Computer Aided Design & Technology",
      summary: "2D/3D drafting, BIM-adjacent workflows, and visualization.",
    },
    {
      name: "Engineering Fundamental Skills",
      summary: "Core engineering literacy for production environments.",
    },
    {
      name: "General Electronics Repairs",
      summary: "Diagnosis, board-level practice, and service workflows.",
    },
    {
      name: "ICT",
      summary: "Networks, systems, cybersecurity foundations, and administration.",
    },
    {
      name: "Design Technology",
      summary: "Applied design tools for product and built-environment work.",
    },
    {
      name: "Building Technology",
      summary: "Construction documentation and digital construction methods.",
    },
    {
      name: "Data Analytics",
      summary: "SQL, Python, and analysis habits for operational data.",
    },
    {
      name: "Media & Communication Technology",
      summary: "Production tools and technical media pipelines.",
    },
    {
      name: "Creative & Performing Arts",
      summary: "Creative practice supported by professional tooling.",
    },
    {
      name: "Engineering",
      summary: "Applied engineering tracks for industry software and methods.",
    },
  ],
} as const;

export const featured = {
  eyebrow: "Courses",
  title: "Featured programs",
  emptyTitle: "Catalog loading soon",
  emptyBody:
    "Course listings connect to the live CAITECH catalog. Browse all programs when the API is available, or contact the institute for current intakes.",
  ctaLabel: "View all courses",
  ctaHref: "/courses",
} as const;

/** About page — Who we are */
export const positioning = {
  eyebrow: "Who we are",
  body: [
    "CAITECH Global Institute is a Nairobi-based technical institute for CAD, engineering, ICT, electronics, construction technology, and applied digital skills.",
    "Programmes are organised around the tools and workflows used on live projects — drafting sets, coordinated models, site packs, and production deliverables — not a separate certification framework.",
  ],
} as const;

export const why = {
  eyebrow: "Why CAITECH",
  title: "Built for competent work.",
  lede: "Not vague digital skills, theory-only diplomas, or imported curricula that ignore how work ships in Kenya.",
  chips: ["Named tools", "Job-task modules", "Local payments"] as const,
  items: [
    {
      id: "tools",
      title: "Named tools. Real files.",
      body: "You learn the software the job file opens in — not a generic “digital skills” track.",
      proof: {
        kind: "tools" as const,
        labels: [
          "AutoCAD",
          "Civil 3D",
          "ArchiCAD",
          "Revit",
          "Python",
          "SQL",
        ],
      },
    },
    {
      id: "career",
      title: "Taught to the deliverable.",
      body: "Modules map to work product employers recognize — not chapter checklists.",
      proof: {
        kind: "deliverables" as const,
        labels: [
          "Drawings",
          "Models",
          "Configs",
          "Repairs",
          "Datasets",
        ],
      },
    },
    {
      id: "kenya",
      title: "Built around how Kenya pays.",
      body: "Pricing and checkout match local reality, including M-Pesa-oriented payment.",
      proof: {
        kind: "payments" as const,
        primary: "M-Pesa",
        secondary: "Local pricing · KES",
      },
    },
  ],
} as const;

export const practical = {
  eyebrow: "Practice",
  title: "Career-relevant practice",
  body: "Programs emphasize drawings you can issue, networks you can configure, boards you can diagnose, and data you can query — skills that transfer into studios, sites, and ops teams.",
} as const;

export const aiPath = {
  eyebrow: "AI Learning Path",
  title: "Find a path that fits your background.",
  body: "Answer a short set of questions about your goals and experience. Get a structured course sequence — not a chatbot monologue.",
  ctaLabel: "Start AI Path",
  ctaHref: "/ai-path",
} as const;

export const blogTeaser = {
  eyebrow: "Resources",
  title: "From the institute",
  emptyBody: "Articles and technical notes will appear here as they are published.",
  ctaLabel: "Read the blog",
  ctaHref: "/blog",
} as const;

export const finalCta = {
  title: "Start with a course that matches the work you want to do.",
  body: "Explore the catalog, or use AI Path if you want a structured recommendation.",
  primary: { label: "Browse courses", href: "/courses" },
  secondary: { label: "Talk to us", href: "/contact" },
} as const;

export const stubPages = {
  courses: {
    eyebrow: "Catalog",
    title: "Courses",
    description:
      "Technical programs across CAD, engineering, ICT, electronics, construction technology, and applied digital skills.",
  },
  about: {
    eyebrow: "Institute",
    title: "About CAITECH",
    description:
      "CAITECH Global Institute trains people for competent technical work — software, systems, and shop-floor practice.",
  },
  aiPath: {
    eyebrow: "Guidance",
    title: "AI Learning Path",
    description:
      "A structured discovery flow that recommends courses from your goals and background. Full experience ships in a later phase.",
  },
  blog: {
    eyebrow: "Resources",
    title: "Blog",
    description: "Technical notes and institute updates.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Contact",
    description:
      "Reach the institute for intakes, corporate training, and program questions. Direct email and phone will appear here once published.",
  },
  faq: {
    eyebrow: "Help",
    title: "FAQ",
    description: "Common questions about enrollment, delivery, and payments.",
  },
  login: {
    eyebrow: "Account",
    title: "Log in",
    description: "Access your CAITECH account.",
  },
  register: {
    eyebrow: "Account",
    title: "Register",
    description: "Create a student account to enroll and track progress.",
  },
  forgotPassword: {
    eyebrow: "Account",
    title: "Forgot password",
    description: "Request a password reset link.",
  },
  resetPassword: {
    eyebrow: "Account",
    title: "Reset password",
    description: "Choose a new password.",
  },
  cart: {
    eyebrow: "Checkout",
    title: "Cart",
    description: "Review courses before payment.",
  },
  checkout: {
    eyebrow: "Checkout",
    title: "Checkout",
    description: "Complete enrollment payment securely via the CAITECH payment flow.",
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy policy",
    description: "How CAITECH handles personal data.",
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of use",
    description: "Terms governing use of the CAITECH platform and programs.",
  },
  paymentsReturn: {
    eyebrow: "Payments",
    title: "Payment status",
    description: "Confirming your payment with the institute.",
  },
} as const;
