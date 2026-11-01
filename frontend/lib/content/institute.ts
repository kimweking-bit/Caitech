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

/** Official Phase 3 catalogue taxonomy (matches API category slugs). */
export const disciplines: readonly Discipline[] = [
  {
    id: "mep-building-services",
    number: "01",
    name: "MEP & Building Services",
    shortName: "MEP",
    summary:
      "Mechanical, electrical, and plumbing systems for modern commercial and industrial facilities.",
    tools: ["HVAC", "Electrical design", "Plumbing coordination"],
    image: "/images/home/discipline-building-v2.jpg",
    imageAlt: "MEP and building services training",
  },
  {
    id: "architecture-bim-digital-construction",
    number: "02",
    name: "Architecture, BIM & Digital Construction",
    shortName: "Architecture & BIM",
    summary:
      "Architectural technology, BIM workflows, and digital construction practice for studio and site teams.",
    tools: ["BIM", "Revit", "Digital delivery"],
    image: "/images/home/discipline-cad-v2.jpg",
    imageAlt: "Architecture and BIM training",
  },
  {
    id: "quantity-surveying-cost-management",
    number: "03",
    name: "Quantity Surveying & Cost Management",
    shortName: "QS & Cost",
    summary:
      "Cost planning, BOQ production, and commercial management across the project lifecycle.",
    tools: ["Measurement", "Estimation", "Cost control"],
    image: "/images/home/discipline-engineering-v2.jpg",
    imageAlt: "Quantity surveying and cost management",
  },
  {
    id: "project-management-infrastructure",
    number: "04",
    name: "Project Management & Infrastructure",
    shortName: "Project Management",
    summary:
      "Planning, controls, and leadership for infrastructure and built-environment projects.",
    tools: ["Planning", "Controls", "Infrastructure delivery"],
    image: "/images/home/nairobi.jpg",
    imageAlt: "Project management and infrastructure",
  },
  {
    id: "industrial-engineering-automation",
    number: "05",
    name: "Industrial Engineering & Automation",
    shortName: "Industrial & Automation",
    summary:
      "Industrial methods, automation, and operational improvement for plants and production lines.",
    tools: ["Automation", "Industrial methods", "Operations"],
    image: "/images/home/discipline-electronics-v2.jpg",
    imageAlt: "Industrial engineering and automation",
  },
  {
    id: "renewable-energy-sustainability",
    number: "06",
    name: "Renewable Energy & Sustainability",
    shortName: "Renewables",
    summary:
      "Renewable generation, energy efficiency, and sustainability practice for technical teams.",
    tools: ["Solar", "Energy efficiency", "Sustainability"],
    image: "/images/home/discipline-engineering-v2.jpg",
    imageAlt: "Renewable energy and sustainability",
  },
  {
    id: "engineering-finance-investment",
    number: "07",
    name: "Engineering Finance & Investment",
    shortName: "Engineering Finance",
    summary:
      "Financial appraisal, investment analysis, and commercial decision-making for engineering ventures.",
    tools: ["Project finance", "Investment analysis", "Appraisal"],
    image: "/images/home/discipline-data-v2.jpg",
    imageAlt: "Engineering finance and investment",
  },
  {
    id: "corporate-strategy-leadership",
    number: "08",
    name: "Corporate Strategy & Leadership",
    shortName: "Strategy & Leadership",
    summary:
      "Strategy, leadership, and organisational capability for technical and corporate teams.",
    tools: ["Strategy", "Leadership", "Organisational growth"],
    image: "/images/home/discipline-creative-v2.jpg",
    imageAlt: "Corporate strategy and leadership",
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

/** Featured programmes used when API featured list is empty. */
export const featuredProgrammes: readonly FeaturedProgramme[] = [
  {
    slug: "revit-architecture",
    number: "01",
    title: "Revit Architecture",
    school: "Architecture & BIM",
    blurb: "BIM modelling and documentation for architectural delivery teams.",
    href: "/courses/revit-architecture",
    image: "/images/home/discipline-cad-v2.jpg",
    imageAlt: "Revit Architecture training",
  },
  {
    slug: "autocad-2d-3d",
    number: "02",
    title: "AutoCAD 2D & 3D",
    school: "Architecture & BIM",
    blurb: "Professional drafting and modelling foundations for technical work.",
    href: "/courses/autocad-2d-3d",
    image: "/images/home/discipline-cad-v2.jpg",
    imageAlt: "AutoCAD training",
  },
  {
    slug: "quantity-surveying",
    number: "03",
    title: "Quantity Surveying Essentials",
    school: "QS & Cost",
    blurb: "Measurement, BOQ, and cost control for commercial project teams.",
    href: "/courses/quantity-surveying",
    image: "/images/home/discipline-engineering-v2.jpg",
    imageAlt: "Quantity surveying training",
  },
] as const;

/**
 * Stack — industry software taught / used.
 * Four categories · twelve tools. Exact homepage Stack copy.
 */
export type ToolClusterId =
  | "drafting"
  | "bim"
  | "civil"
  | "viz-data";

export type ToolItem = {
  name: string;
  /** Role / purpose line under the tool name. */
  label: string;
  cluster: ToolClusterId;
};

export type ToolClusterSurface = "dark" | "light";

export type ToolCluster = {
  id: ToolClusterId;
  title: string;
  blurb: string;
  /** Optional courses catalogue category slug for card navigation. */
  categoryId?: string;
  surface: ToolClusterSurface;
  image: { src: string; alt: string };
};

export const toolClusters: readonly ToolCluster[] = [
  {
    id: "drafting",
    title: "Drafting & documentation",
    blurb: "2D/3D CAD for production drawings.",
    categoryId: "architecture-bim-digital-construction",
    surface: "dark",
    image: {
      src: "/images/home/stack-drafting-plan.jpg",
      alt: "Technical architectural floor-plan drawing",
    },
  },
  {
    id: "bim",
    title: "BIM & architecture",
    blurb: "Authoring, coord, early design.",
    categoryId: "architecture-bim-digital-construction",
    surface: "light",
    image: {
      src: "/images/home/stack-bim-model.jpg",
      alt: "Multi-storey building form for BIM and architecture context",
    },
  },
  {
    id: "civil",
    title: "Civil & infrastructure",
    blurb: "Roads, sites, water networks.",
    categoryId: "project-management-infrastructure",
    surface: "light",
    image: {
      src: "/images/home/stack-civil-road.jpg",
      alt: "Aerial highway interchange representing civil infrastructure work",
    },
  },
  {
    id: "viz-data",
    title: "Visualization & computation",
    blurb: "Presentation, script, data.",
    surface: "dark",
    image: {
      src: "/images/home/stack-viz-render.jpg",
      alt: "Architectural visualization of a modern residence at dusk",
    },
  },
];

export const toolsBehindWork: readonly ToolItem[] = [
  { name: "AutoCAD", label: "CAD drafting", cluster: "drafting" },
  { name: "MicroStation", label: "CAD / Infrastructure", cluster: "drafting" },
  { name: "Revit", label: "BIM / Architecture", cluster: "bim" },
  { name: "Archicad", label: "Architecture", cluster: "bim" },
  { name: "SketchUp", label: "Conceptual design", cluster: "bim" },
  { name: "Navisworks", label: "Coordination", cluster: "bim" },
  { name: "Civil 3D", label: "Civil design", cluster: "civil" },
  { name: "OpenRoads", label: "Civil design", cluster: "civil" },
  { name: "WaterGEMS", label: "Water networks", cluster: "civil" },
  { name: "Lumion", label: "Visualization", cluster: "viz-data" },
  { name: "Python", label: "Programming", cluster: "viz-data" },
  { name: "SQL", label: "Data", cluster: "viz-data" },
];

/** Outcomes path — verb → line → in-practice micro. Sequential, not peers. */
export const outcomes = [
  {
    verb: "Design",
    line: "Drawings and models that hold up on site and in review.",
    practice: "GA drawings · details · model views",
  },
  {
    verb: "Coordinate",
    line: "Cross-discipline work on shared BIM and delivery standards.",
    practice: "Federated models · clash notes · issue logs",
  },
  {
    verb: "Deliver",
    line: "Brief to package with tools used in Kenyan industry.",
    practice: "IFC / DWG sets · submittals · site packs",
  },
  {
    verb: "Lead",
    line: "Own cost, schedule, and technical calls with confidence.",
    practice: "Scope · programme · technical sign-off",
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
    src: "/images/home/why-studio-competent-v3.jpg",
    alt: "Engineer at a laptop reviewing technical work — hands-on digital practice at CAITECH",
  },
  nairobi: {
    src: "/images/home/nairobi.jpg",
    alt: "Nairobi city skyline and urban fabric",
  },
} as const;
