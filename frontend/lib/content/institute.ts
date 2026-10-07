/**
 * Verified CAITECH institutional content.
 * Metrics and contact from the live public site — do not invent extras.
 */

export const instituteMetrics = [
  { value: "512+", label: "Active students" },
  { value: "25+", label: "Lecturers" },
  { value: "34+", label: "Courses" },
  { value: "17+", label: "Affiliations" },
] as const;

export const instituteContact = {
  email: "info@caitech.co.ke",
  phones: ["+254 722 206 259", "+254 724 730 966"] as const,
  addressLines: [
    "KTDA Plaza, 10th Floor",
    "Moi Avenue, Nairobi CBD",
    "Kenya",
  ] as const,
  mapsQuery: "KTDA Plaza Moi Avenue Nairobi",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=KTDA+Plaza+Moi+Avenue+Nairobi",
} as const;

export const instituteVision =
  "To be a world Class Institutional Hub of ICT, Arts and Design";

export const instituteMission =
  "Educate a diverse student population to become creative thinkers contributing through creative professional work.";

/** Real homepage testimonials — exact wording from client site. */
export const testimonials = [
  {
    quote:
      "Thanks to Caitech, I gained confidence and secured my dream job immediately after my graduation.",
    name: "Stacy",
  },
  {
    quote:
      "Caitech provided me with practical skills and real industry exposure that transformed my career path.",
    name: "Ken",
  },
  {
    quote:
      "The flexible class schedules at Caitech allowed me to balance work, family, and my studies.",
    name: "Mary",
  },
] as const;

export type Discipline = {
  id: string;
  number: string;
  name: string;
  shortName: string;
  summary: string;
  tools: readonly string[];
  image: string;
  imageAlt: string;
};

export const disciplines: readonly Discipline[] = [
  {
    id: "cad",
    number: "01",
    name: "School of Computer Aided Designs and Technology",
    shortName: "CAD + Design",
    summary:
      "Drafting, documentation and digital design workflows used across architecture, engineering and construction.",
    tools: ["AutoCAD", "Revit", "Civil 3D", "BIM"],
    image: "/images/home/discipline-cad-v2.jpg",
    imageAlt:
      "Architectural plans and drafting workspace for computer-aided design",
  },
  {
    id: "eng-fundamentals",
    number: "02",
    name: "Engineering Fundamental Skills",
    shortName: "Engineering fundamentals",
    summary:
      "Core engineering literacy for production environments — analysis habits, technical drawing and practical method.",
    tools: ["Technical drawing", "Analysis", "Practical labs"],
    image: "/images/home/discipline-engineering-v2.jpg",
    imageAlt:
      "Engineering lab technician working with technical equipment",
  },
  {
    id: "electronics",
    number: "03",
    name: "General Electronics Repairs Course",
    shortName: "Electronics repairs",
    summary:
      "Diagnosis, board-level practice and service workflows for electronics and mobile equipment.",
    tools: ["Diagnostics", "Board repair", "Mobile service"],
    image: "/images/home/discipline-electronics-v2.jpg",
    imageAlt: "Close-up of electronic circuit board and component work",
  },
  {
    id: "creative",
    number: "04",
    name: "School of Creative and Performing Art",
    shortName: "Creative & performing arts",
    summary:
      "Creative practice supported by professional production tools and performance craft.",
    tools: ["Production", "Performance", "Studio craft"],
    image: "/images/home/discipline-creative-v2.jpg",
    imageAlt: "Art studio with paints and creative materials",
  },
  {
    id: "ict",
    number: "05",
    name: "School of Information and Communication Technology",
    shortName: "ICT",
    summary:
      "Networks, systems, cybersecurity foundations and administration for working infrastructure.",
    tools: ["Networking", "Linux", "Cybersecurity", "Systems"],
    image: "/images/home/discipline-ict-v2.jpg",
    imageAlt: "Server room racks and network cabling for ICT infrastructure",
  },
  {
    id: "design-tech",
    number: "06",
    name: "School of Designs Technology",
    shortName: "Design technology",
    summary:
      "Applied design tools for product, interior and built-environment work.",
    tools: ["Interior design", "Visualization", "Design software"],
    image: "/images/home/discipline-design-v2.jpg",
    imageAlt:
      "Modern interior design space with furniture and finishes",
  },
  {
    id: "building",
    number: "07",
    name: "School of Building Technology",
    shortName: "Building technology",
    summary:
      "Construction documentation, quantities and digital methods for building projects.",
    tools: ["Construction docs", "QS", "Site practice"],
    image: "/images/home/discipline-building-v2.jpg",
    imageAlt: "Construction workers on a building site with hard hats",
  },
  {
    id: "data",
    number: "08",
    name: "Data Analytic Courses",
    shortName: "Data analytics",
    summary:
      "SQL, Python and analysis habits for operational and decision-ready data work.",
    tools: ["Python", "SQL", "Analytics"],
    image: "/images/home/discipline-data-v2.jpg",
    imageAlt: "Analytics dashboards and charts on screens in a data workspace",
  },
  {
    id: "engineering",
    number: "09",
    name: "School of Engineering",
    shortName: "Engineering",
    summary:
      "Applied engineering tracks spanning civil, structural and related industry software.",
    tools: ["Civil", "Structural", "Project methods"],
    image: "/images/home/discipline-engineering-applied-v2.jpg",
    imageAlt:
      "City infrastructure and structural engineering at scale",
  },
  {
    id: "media",
    number: "10",
    name: "School of Media and Communication Technology",
    shortName: "Media & communication tech",
    summary:
      "Production tools and technical media pipelines for modern communication work.",
    tools: ["Media production", "Editing", "Communication tech"],
    image: "/images/home/discipline-media-v2.jpg",
    imageAlt: "Professional camera and media production equipment",
  },
] as const;

export type FeaturedProgramme = {
  slug: string;
  number: string;
  title: string;
  school: string;
  blurb: string;
  href: string;
  image: string;
  imageAlt: string;
};

/**
 * Editorial featured programmes from verified public CAITECH catalogue names.
 * No invented prices, durations, or instructors.
 * Swappable for Django course API once seeded (same shape via mapper).
 */
export const featuredProgrammes: readonly FeaturedProgramme[] = [
  {
    slug: "diploma-computer-aided-designs",
    number: "01",
    title: "Diploma in Computer Aided Designs (CAD)",
    school: "CAD & Design Technology",
    blurb: "Drafting and documentation workflows for architecture, engineering and construction studios.",
    href: "/courses/diploma-computer-aided-designs",
    image: "/images/home/programme-cad.jpg",
    imageAlt: "CAD workstation with technical drawings on screen",
  },
  {
    slug: "diploma-civil-engineering",
    number: "02",
    title: "Diploma in Civil Engineering",
    school: "Engineering",
    blurb: "Civil engineering fundamentals for infrastructure, site practice and technical documentation.",
    href: "/courses/diploma-civil-engineering",
    image: "/images/home/programme-civil.jpg",
    imageAlt: "Civil engineering and infrastructure context",
  },
  {
    slug: "diploma-data-science",
    number: "03",
    title: "Diploma Data Science",
    school: "Data Analytics",
    blurb: "Data skills for analysis, insight and technical decision support.",
    href: "/courses/diploma-data-science",
    image: "/images/home/programme-data.jpg",
    imageAlt: "Data science work on multiple screens",
  },
  {
    slug: "diploma-building-technology",
    number: "04",
    title: "Diploma in Building Technology",
    school: "Building Technology",
    blurb: "Building technology for construction documentation and practical project delivery.",
    href: "/courses/diploma-building-technology",
    image: "/images/home/programme-building.jpg",
    imageAlt: "Building technology and construction environment",
  },
  {
    slug: "diploma-information-technology",
    number: "05",
    title: "Diploma Information Technology",
    school: "ICT",
    blurb: "IT foundations spanning systems, networks and applied digital infrastructure.",
    href: "/courses/diploma-information-technology",
    image: "/images/home/programme-ict.jpg",
    imageAlt: "Information technology lab environment",
  },
  {
    slug: "diploma-architecture-technology",
    number: "06",
    title: "Diploma in Architecture Technology",
    school: "Architecture Technology",
    blurb: "Architectural technology for drawings, models and built-environment communication.",
    href: "/courses/diploma-architecture-technology",
    image: "/images/home/programme-architecture.jpg",
    imageAlt: "Architecture drawings and modelling workstation",
  },
] as const;

/** Short discipline tags only — no marketing copy. */
export const toolsBehindWork = [
  { name: "AutoCAD", label: "CAD / Drafting" },
  { name: "Civil 3D", label: "Infrastructure" },
  { name: "Revit", label: "BIM / Architecture" },
  { name: "ArchiCAD", label: "BIM / Architecture" },
  { name: "Lumion", label: "Visualization" },
  { name: "Navisworks", label: "Coordination" },
  { name: "BIM", label: "Digital construction" },
  { name: "STAAD.Pro", label: "Structural" },
  { name: "WaterCAD", label: "Hydraulic design" },
  { name: "WaterGEMS", label: "Water networks" },
  { name: "MicroStation", label: "CAD / Infrastructure" },
  { name: "OpenRoads", label: "Civil design" },
  { name: "Python", label: "Programming" },
  { name: "SQL", label: "Data" },
  { name: "Linux", label: "Systems" },
  { name: "Wireshark", label: "Network analysis" },
  { name: "Nmap", label: "Security" },
  { name: "Cisco Packet Tracer", label: "Networking" },
  { name: "Metasploit", label: "Security" },
  { name: "Adobe tools", label: "Creative" },
] as const;

export const outcomes = [
  {
    verb: "Draw",
    detail: "Technical drawings, CAD documentation, architectural plans",
  },
  {
    verb: "Model",
    detail: "BIM, 3D modelling, digital construction",
  },
  {
    verb: "Analyse",
    detail: "Engineering calculations, data, structural systems",
  },
  {
    verb: "Configure",
    detail: "Networks, ICT systems, technical infrastructure",
  },
  {
    verb: "Repair",
    detail: "Electronics, mobile devices, technical equipment",
  },
  {
    verb: "Build",
    detail: "Construction, project execution, practical technical work",
  },
] as const;

export type EditorialArticle = {
  slug: string;
  title: string;
  category: string;
  href: string;
  excerpt: string;
  image?: string;
  featured?: boolean;
};

/** Real CAITECH blog topics — titles from existing public archive. */
export const editorialArticles: readonly EditorialArticle[] = [
  {
    slug: "why-bim-is-transforming-construction-across-africa",
    title: "Why BIM Is Transforming Construction Across Africa",
    category: "CAD / BIM",
    href: "/blog/why-bim-is-transforming-construction-across-africa",
    excerpt:
      "How building information modelling is changing documentation, coordination and delivery across African construction projects.",
    image: "/images/home/blog-bim.jpg",
    featured: true,
  },
  {
    slug: "autocad-vs-revit-which-one-should-you-learn-first",
    title: "AutoCAD vs Revit: Which One Should You Learn First?",
    category: "CAD / BIM",
    href: "/blog/autocad-vs-revit-which-one-should-you-learn-first",
    excerpt:
      "A practical guide to choosing your first drafting and modelling path.",
  },
  {
    slug: "what-courses-can-i-study-after-kcse-in-kenya",
    title: "What Courses Can I Study After KCSE in Kenya?",
    category: "Career",
    href: "/blog/what-courses-can-i-study-after-kcse-in-kenya",
    excerpt:
      "Technical programme options after secondary school — CAD, ICT, engineering and more.",
  },
] as const;

export const homeImages = {
  hero: {
    src: "/images/home/hero-lab-pcb-v4.jpg",
    alt: "Engineer inspecting a multilayer PCB under warm lab lighting at CAITECH",
  },
  outcomes: {
    src: "/images/home/outcomes.jpg",
    alt: "Hands-on technical training in a workshop environment",
  },
  nairobi: {
    src: "/images/home/nairobi.jpg",
    alt: "Nairobi city skyline and urban fabric",
  },
} as const;
