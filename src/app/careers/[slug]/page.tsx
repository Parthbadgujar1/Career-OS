import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteUrl } from "@/lib/site";

interface CareerTrack {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  skills: string[];
  roadmap: string[];
  avgSalary: string;
  openings: string;
  keywords: string[];
}

const TRACKS: CareerTrack[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    description: "Full-stack development, system design, and coding interview preparation.",
    longDescription:
      "Software engineering remains the most in-demand career path for fresh graduates. Career OS provides a structured roadmap covering data structures, algorithms, system design, full-stack projects, and mock technical interviews — all adaptive to your current skill level.",
    skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "System Design", "Git", "Data Structures"],
    roadmap: [
      "Core programming fundamentals",
      "Data structures & algorithms (80+ problems)",
      "Full-stack project build",
      "System design basics",
      "Mock technical interviews (10+ sessions)",
    ],
    avgSalary: "₹6-12 LPA (fresher)",
    openings: "50,000+ annually",
    keywords: ["software engineer", "full stack developer", "coding interview", "programming", "web developer"],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    description: "SQL, Python, Excel, data visualization, and business analytics.",
    longDescription:
      "Data analysts transform raw data into actionable business insights. Career OS guides you through SQL mastery, Python for data analysis, Excel power-user techniques, visualization tools like Tableau and Power BI, and real-world portfolio projects that demonstrate your analytical thinking.",
    skills: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Statistics", "Pandas", "Data Visualization"],
    roadmap: [
      "SQL fundamentals and advanced queries",
      "Python for data analysis (Pandas, NumPy)",
      "Excel power features and pivot tables",
      "Data visualization with Tableau/Power BI",
      "Capstone business analytics project",
    ],
    avgSalary: "₹4-8 LPA (fresher)",
    openings: "30,000+ annually",
    keywords: ["data analyst", "business analyst", "SQL", "data visualization", "analytics"],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    description: "Product thinking, user research, roadmap planning, and stakeholder management.",
    longDescription:
      "Product management blends technology, business, and user experience. Career OS helps you build a PM portfolio through user research exercises, feature prioritization frameworks, PRD writing, roadmap planning, and mock stakeholder presentations — preparing you for campus and off-campus PM roles.",
    skills: ["User Research", "PRD Writing", "Feature Prioritization", "Analytics", "Roadmapping", "A/B Testing", "SQL"],
    roadmap: [
      "Product thinking fundamentals",
      "User research and persona development",
      "PRD and feature specification writing",
      "Analytics and metric-driven decisions",
      "Portfolio: 2 product case studies",
    ],
    avgSalary: "₹8-15 LPA (fresher)",
    openings: "15,000+ annually",
    keywords: ["product manager", "product management", "PM interview", "roadmap", "user research"],
  },
  {
    slug: "marketing",
    title: "Digital Marketing",
    description: "SEO, SEM, social media, content strategy, and analytics.",
    longDescription:
      "Digital marketing is a fast-growing field requiring both creative and analytical skills. Career OS covers SEO fundamentals, paid advertising, social media strategy, content marketing, email campaigns, and analytics — with hands-on project templates to build your portfolio.",
    skills: ["SEO", "Google Ads", "Social Media", "Content Strategy", "Email Marketing", "Google Analytics", "Copywriting"],
    roadmap: [
      "SEO and content fundamentals",
      "Paid advertising (Google Ads, Meta Ads)",
      "Social media strategy and execution",
      "Analytics and conversion tracking",
      "Portfolio: 3 campaign case studies",
    ],
    avgSalary: "₹3-7 LPA (fresher)",
    openings: "25,000+ annually",
    keywords: ["digital marketing", "SEO", "social media marketing", "content marketing", "Google Ads"],
  },
  {
    slug: "finance",
    title: "Finance & Banking",
    description: "Financial modeling, accounting, valuation, and BFSI interview prep.",
    longDescription:
      "Finance careers in banking, consulting, and fintech demand strong analytical and quantitative skills. Career OS prepares you with financial modeling practice, accounting fundamentals, valuation techniques, and mock interviews covering aptitude and case study rounds.",
    skills: ["Financial Modeling", "Excel", "Accounting", "Valuation", "SQL", "Aptitude", "Bloomberg", "Excel VBA"],
    roadmap: [
      "Accounting and financial statements",
      "Financial modeling fundamentals",
      "DCF and valuation techniques",
      "Aptitude and numerical reasoning",
      "Mock case study interviews",
    ],
    avgSalary: "₹5-10 LPA (fresher)",
    openings: "20,000+ annually",
    keywords: ["finance", "banking", "financial analyst", "BFSI", "investment banking"],
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "User research, wireframing, prototyping, and design systems.",
    longDescription:
      "UI/UX design combines empathy, creativity, and technical understanding. Career OS guides you through user research methods, wireframing and prototyping workflows, Figma mastery, design system thinking, and portfolio projects that showcase your design process end-to-end.",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "UI Design", "Usability Testing"],
    roadmap: [
      "Design thinking and user research",
      "Wireframing and low-fidelity prototypes",
      "Figma mastery and component design",
      "High-fidelity UI and design systems",
      "Portfolio: 2 complete case studies",
    ],
    avgSalary: "₹4-9 LPA (fresher)",
    openings: "18,000+ annually",
    keywords: ["UI UX designer", "product design", "Figma", "UX research", "design portfolio"],
  },
  {
    slug: "hr",
    title: "Human Resources",
    description: "Recruitment, employee relations, HR analytics, and campus hiring.",
    longDescription:
      "Human Resources professionals shape company culture and talent strategy. Career OS helps you master recruitment processes, HR analytics, employee engagement strategies, labor law basics, and interview techniques specific to HR and people-operations roles.",
    skills: ["Recruitment", "HR Analytics", "Employee Relations", "Labor Law", "Payroll", "Excel", "Communication"],
    roadmap: [
      "HR fundamentals and labor law basics",
      "Recruitment and talent acquisition",
      "HR analytics and metrics",
      "Employee engagement and retention",
      "Mock HR case study interviews",
    ],
    avgSalary: "₹3-6 LPA (fresher)",
    openings: "12,000+ annually",
    keywords: ["human resources", "HR", "recruitment", "talent acquisition", "people operations"],
  },
];

function getTrack(slug: string): CareerTrack | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) return {};

  return {
    title: `${track.title} Career Path — Skills, Roadmap & Interview Prep`,
    description: track.description,
    keywords: [...track.keywords, "career path", "campus placement", "fresher jobs"],
    openGraph: {
      title: `${track.title} Career Path | Career OS`,
      description: track.description,
      type: "website",
      url: `/careers/${track.slug}`,
    },
  };
}

export default async function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${track.title} Career Path`,
    description: track.description,
    url: `${siteUrl()}/careers/${track.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Career OS",
      url: siteUrl(),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-slate-100 bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Career <span className="text-violet-600">OS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">{track.title} Career Path</h1>
          <p className="text-lg text-slate-600 max-w-2xl">{track.longDescription}</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {track.openings}</span>
            <span className="flex items-center gap-1"><Target className="h-4 w-4" /> Avg. {track.avgSalary}</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Key Skills</h2>
          <div className="flex flex-wrap gap-2">
            {track.skills.map((s) => (
              <span key={s} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 border border-violet-200">{s}</span>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Your Roadmap with Career OS</h2>
          <ol className="space-y-3">
            {track.roadmap.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
                <span className="text-slate-700 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-surface p-8 text-center space-y-4 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Start Your {track.title} Journey Today</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Career OS gives you an adaptive roadmap, AI coaching, and weekly tasks — tailored to your current level. Free for students.
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Explore Other Career Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRACKS.filter((t) => t.slug !== track.slug).map((t) => (
              <Link key={t.slug} href={`/careers/${t.slug}`} className="rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:shadow-sm transition-all">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-surface py-8 text-center text-sm text-slate-500">
        <Link href="/" className="font-bold text-slate-900">Career OS</Link>
        <p className="mt-1">Free AI-powered career readiness for students</p>
      </footer>
    </div>
  );
}
