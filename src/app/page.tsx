import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Map,
  CalendarCheck,
  FileText,
  Globe,
  GitBranch,
  FolderGit2,
  Code2,
  Target,
  Trophy,
  ExternalLink,
  Mic2,
  Gauge,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  ListChecks,
  Compass,
  Rocket,
  RefreshCw,
  Zap,
  Star,
  Heart,
} from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { READINESS_DIMENSIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Career OS — Free AI-Powered Career Readiness Platform for Students",
  description:
    "From Day 1 of graduation to placement. Assess skills, build projects, practice interviews, and track your career journey — all in one free platform for students.",
  openGraph: {
    title: "Career OS — Free AI-Powered Career Readiness Platform",
    description:
      "From Day 1 of graduation to placement. Assess skills, build projects, practice interviews, and track your career journey.",
    type: "website",
    url: "/",
  },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://careeros.in";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Career OS",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "AI-powered career preparation and placement readiness platform for students. Track skills, build projects, practice interviews, and get personalized career coaching.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "AI-powered skill assessment",
    "Personalized career roadmap",
    "Mock interview practice",
    "Coding problem tracking",
    "Resume and LinkedIn review",
    "Weekly adaptive task system",
    "Career coaching chat",
    "Job and internship tracker",
  ],
  author: {
    "@type": "Organization",
    name: "Career OS",
    url: SITE_URL,
  },
};

const TRUST = ["Free for students", "No card required", "5-minute Day-1 setup"];

const STATS = [
  { value: "8+", label: "Degree programs", color: "from-violet-500 to-purple-600" },
  { value: "7", label: "Career tracks", color: "from-blue-500 to-cyan-500" },
  { value: "12-wk", label: "Adaptive roadmap", color: "from-emerald-500 to-teal-500" },
  { value: "9", label: "Readiness dimensions", color: "from-amber-500 to-orange-500" },
  { value: "6", label: "Opportunity gateways", color: "from-rose-500 to-pink-500" },
];

const JOURNEY = [
  {
    when: "Day 1",
    title: "Onboard & assess",
    text: "Your current course, target career, interests and daily hours. An adaptive AI assessment grades your skills against your goal.",
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    when: "Week 1",
    title: "Pick your goal",
    text: "Software Developer, Data Analyst, AI/ML, UI/UX, Product, Finance or Marketing — the system builds a role-specific skill tree.",
    icon: Compass,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    when: "Weeks 1–12",
    title: "Follow your roadmap",
    text: "Four phases — Foundation, Core Skills, Build & Profile, Placement Sprint — with learning, coding, project and profile tasks each week.",
    icon: Map,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    when: "Every day",
    title: "Execute the plan",
    text: "A small daily to-do list: learn, code, build, polish your profiles, practice aptitude. Missed tasks roll over with priorities.",
    icon: ListChecks,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    when: "Every week",
    title: "Review & adapt",
    text: "An AI weekly report reads your actual progress, finds your top 3 weaknesses and regenerates the next week's priorities.",
    icon: RefreshCw,
    gradient: "from-rose-400 to-pink-500",
  },
  {
    when: "Placement",
    title: "Get placement ready",
    text: "Aptitude, DSA, technical MCQs, mock interviews, company prep — and a readiness score with exactly what to fix next.",
    icon: Rocket,
    gradient: "from-cyan-400 to-blue-500",
  },
];

const PHASES = [
  { name: "Assess", label: "Phase 1 of 4", text: "AI skill assessment and profile audit create your starting evidence.", icon: Gauge, color: "text-emerald-600 bg-emerald-50" },
  { name: "Plan", label: "Phase 2 of 4", text: "The engine maps the exact skills, projects and milestones for your goal.", icon: Map, color: "text-blue-600 bg-blue-50" },
  { name: "Execute", label: "Phase 3 of 4", text: "Daily tasks across learning, coding, projects, profiles and practice.", icon: ListChecks, color: "text-violet-600 bg-violet-50" },
  { name: "Review", label: "Phase 4 of 4", text: "Weekly reports detect weak areas and regenerate the next plan.", icon: RefreshCw, color: "text-amber-600 bg-amber-50" },
];

const MODULES = [
  { title: "AI Onboarding & Assessment", text: "Your current course, target career, interests and daily hours produce your initial readiness score and gap analysis.", icon: Sparkles, gradient: "from-violet-500 to-purple-600" },
  { title: "Personalized Roadmap", text: "A role-specific 12-week skill tree with prerequisites that adapts to your performance.", icon: Map, gradient: "from-blue-500 to-cyan-500" },
  { title: "Daily AI To-Do System", text: "Learning, coding, project, profile and opportunity tasks with automatic rollover.", icon: CalendarCheck, gradient: "from-emerald-500 to-teal-500" },
  { title: "Resume Builder & AI Review", text: "ATS-oriented analysis, missing-skill detection and role-specific suggestions.", icon: FileText, gradient: "from-amber-500 to-orange-500" },
  { title: "LinkedIn Review", text: "Headline, About, skills and completeness with positioning recommendations.", icon: Globe, gradient: "from-blue-500 to-indigo-500" },
  { title: "GitHub Review", text: "Repository quality, README and activity analysis with a portfolio readiness score.", icon: GitBranch, gradient: "from-slate-600 to-slate-800" },
  { title: "Project Engine", text: "Skill-gap-driven project picks with milestones that become resume evidence.", icon: FolderGit2, gradient: "from-rose-500 to-pink-600" },
  { title: "Coding Practice", text: "Daily problems on your weak topics with consistency and improvement analytics.", icon: Code2, gradient: "from-cyan-500 to-blue-600" },
  { title: "Placement Preparation", text: "Aptitude, DSA, technical subjects, MCQs, HR prep and company-specific plans.", icon: Target, gradient: "from-orange-500 to-red-500" },
  { title: "Hackathons & Events", text: "Competition discovery, participation tracking and an achievements portfolio.", icon: Trophy, gradient: "from-yellow-500 to-amber-500" },
  { title: "Opportunity Gateway", text: "Smart redirection to Internshala, LinkedIn, Naukri, Indeed and Unstop — with context.", icon: ExternalLink, gradient: "from-indigo-500 to-violet-500" },
  { title: "Free Interview System", text: "AI mock technical and HR interviews with scores, weak areas and next practice.", icon: Mic2, gradient: "from-pink-500 to-rose-500" },
];

const GATEWAYS = [
  { name: "Roadmap.sh", text: "Your role roadmap, placed inside your weekly plan", color: "#0a0a0a", bg: "bg-slate-900", url: "https://roadmap.sh" },
  { name: "Internshala", text: "Internships & trainings matched to your profile", color: "#14919b", bg: "bg-teal-600", url: "https://internshala.com" },
  { name: "LinkedIn", text: "Jobs, networking and profile improvement", color: "#0a66c2", bg: "bg-blue-600", url: "https://www.linkedin.com/jobs" },
  { name: "Naukri", text: "Role and eligibility-based job search", color: "#ff5733", bg: "bg-orange-500", url: "https://www.naukri.com" },
  { name: "Indeed", text: "Relevant job search redirection", color: "#2164f3", bg: "bg-blue-500", url: "https://in.indeed.com" },
  { name: "Unstop", text: "Quizzes, hackathons & hiring challenges", color: "#7b2ff7", bg: "bg-violet-600", url: "https://unstop.com" },
];

const SIGNALS = [
  { name: "A. Sharma", role: "Software Dev", score: 72, signal: "On track", tone: "success" as const },
  { name: "M. Khan", role: "AI/ML", score: 34, signal: "Falling behind", tone: "danger" as const },
  { name: "R. Patel", role: "Software Dev", score: 41, signal: "Needs support", tone: "warning" as const },
  { name: "N. Bose", role: "Data Analyst", score: 55, signal: "Needs support", tone: "warning" as const },
];

const TESTIMONIALS = [
  {
    quote: "I used to jump between tutorials, coding sites and resume tools with no idea what mattered. Week 3 in, I finally know exactly what to do every day.",
    author: "SB",
    role: "Second-year B.Tech CSE",
    target: "Target: Data Analyst",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "The weekly report caught that I was ignoring project work. Next week's plan rebalanced everything — my portfolio finally exists.",
    author: "FB",
    role: "Final-year BCA",
    target: "Target: Software Developer",
    color: "from-blue-500 to-cyan-500",
  },
  {
    quote: "As a mentor, I can finally see which students are quietly falling behind — with a clear list of who needs what kind of support.",
    author: "PC",
    role: "Placement Cell Coordinator",
    target: "College admin",
    color: "from-emerald-500 to-teal-500",
  },
];

const FOOTER_PRODUCT = [
  { label: "Roadmap", href: "/app/roadmap" },
  { label: "Daily tasks", href: "/app/tasks" },
  { label: "Readiness score", href: "/app" },
  { label: "Weekly reports", href: "/app/reports" },
  { label: "Mock interviews", href: "/app/interviews" },
];
const FOOTER_PLATFORMS = [
  { label: "Roadmap.sh", href: "https://roadmap.sh", external: true },
  { label: "Internshala", href: "https://internshala.com", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/jobs", external: true },
  { label: "Naukri", href: "https://www.naukri.com", external: true },
  { label: "Unstop", href: "https://unstop.com", external: true },
];
const FOOTER_COLLEGES = [
  { label: "Mentor dashboards", href: "/mentor" },
  { label: "Intervention lists", href: "/admin#students" },
  { label: "Batch analytics", href: "/admin" },
  { label: "Weekly reports", href: "/mentor/reports" },
];

const badgeVariant = (tone: string) => {
  if (tone === "success") return "success" as const;
  if (tone === "warning") return "warning" as const;
  if (tone === "danger") return "danger" as const;
  return "secondary" as const;
};

export default async function LandingPage() {
  const session = await auth();
  const dashboardHref = session?.user
    ? session.user.role === "ADMIN"
      ? "/admin"
      : session.user.role === "MENTOR"
        ? "/mentor"
        : "/app"
    : "/register";

  return (
    <div className="flex-1 bg-white text-slate-900 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl animate-fade-in-down">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
              CO
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Career OS</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            {[
              { href: "#journey", label: "How it works" },
              { href: "#modules", label: "Modules" },
              { href: "#score", label: "Score" },
              { href: "#gateway", label: "Opportunities" },
              { href: "#colleges", label: "For colleges" },
              { href: "#testimonials", label: "Stories" },
            ].map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <Link href={dashboardHref}>
                <Button variant="gradient" size="sm">
                  <Zap className="h-3.5 w-3.5" /> Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pt-20 pb-16 lg:grid-cols-2">
        <div className="animate-fade-in-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 animate-pop-in">
            <GraduationCap className="h-3.5 w-3.5" />
            From Day 1 to Placement — one intelligent career OS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            <span className="animate-fade-in-up">Know what to learn.</span>
            <br />
            <span className="animate-fade-in-up delay-100">Know what to build.</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent text-gradient-animated animate-fade-in-up delay-200">
              Know what to do next.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 animate-fade-in-up delay-300">
            Career OS is built for college and university students across every degree program. It turns
            your degree, skills and career goal into a personalized 12-week roadmap, a daily action plan
            and an evidence-based placement readiness score.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-in-up delay-400">
            <Link href="/register">
              <Button size="xl" variant="gradient" className="group">
                Start your career OS — free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#journey">
              <Button size="lg" variant="outline">
                See how it works
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 animate-fade-in-up delay-500">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
        <div className="animate-slide-in-right delay-200">
          <DashboardPreview />
        </div>
        <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-aurora blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-aurora blur-3xl animate-aurora" style={{ animationDelay: "-8s" }} />
      </section>

      {/* ── Stats ── */}
      <section className="relative border-y border-slate-100/80 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s, i) => (
            <div key={s.label} className="animate-fade-in-up group" style={{ animationDelay: `${i * 100}ms` }}>
              <p className={`text-3xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent transition-transform group-hover:scale-110 sm:text-4xl`}>
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey ── */}
      <section id="journey" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">The student journey</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">From Day 1 to placement, one continuous loop</h2>
          <p className="mt-4 text-lg text-slate-600">
            No more disconnected platforms. CareerOS sequences everything — assessment, roadmap, daily
            tasks, projects, profiles, practice and placement prep — into one adaptive journey.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map((step, i) => (
            <Reveal key={step.title} delay={i * 80} className="h-full">
              <div className="group relative flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm card-interactive">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{step.when}</p>
                    <p className="text-[11px] font-medium text-slate-400">Step {i + 1}</p>
                  </div>
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Intelligence Layer ── */}
      <section className="relative border-y border-slate-100/80 bg-gradient-to-b from-slate-50/80 to-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">The intelligence layer</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Not another course site. An engine that decides.</h2>
            <p className="mt-4 text-lg text-slate-600">
              Every recommendation answers three questions: why this, why now, and what measurable
              improvement it should create.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {PHASES.map((p, i) => (
              <Reveal key={p.name} delay={i * 100} className="h-full">
                <div className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm card-interactive">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.color} transition-transform group-hover:scale-110`}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{p.label}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 animate-fade-in-up delay-400">
            <p className="text-sm leading-relaxed text-indigo-900">
              <span className="font-bold">Example:</span> a student targeting Data Analyst with strong
              Python basics, weak SQL and no portfolio gets SQL practice and a data-analysis project first
              — not advanced machine-learning content.
            </p>
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">12 major modules</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Everything a student needs, orchestrated in one place</h2>
          <p className="mt-4 text-lg text-slate-600">
            CareerOS is the control layer over the resources you already use — it decides when each one
            becomes useful and sends you there with context.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 80} className="h-full">
              <div className="group relative flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm card-interactive overflow-hidden">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Readiness Score ── */}
      <section id="score" className="relative border-y border-slate-100/80 bg-gradient-to-b from-slate-50/80 to-white py-20 scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="animate-fade-in-left">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Placement readiness score</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A score you can argue with — because it&apos;s evidence-based</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Nine weighted dimensions are computed from your actual activity — completed tasks, coding
              sessions, project progress, profile edits and opportunity interactions. Every point shows
              exactly which action raised or lowered it.
            </p>
            <div className="mt-6 space-y-2">
              {READINESS_DIMENSIONS.map((d, i) => (
                <Reveal key={d.key} delay={i * 50}>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md hover:translate-x-0.5">
                    <span className="text-sm font-medium text-slate-700">{d.label}</span>
                    <span className="text-sm font-bold text-indigo-600">{d.weight}%</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Weights shown are the default — configurable per role and institution.</p>
          </div>
          <div className="animate-slide-in-right">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/50">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Placement readiness</p>
                  <p className="mt-1 text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    58<span className="text-lg text-slate-400">/100</span>
                  </p>
                  <Badge variant="warning" className="mt-2 animate-pulse-soft">Building Momentum</Badge>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  <TrendingUp className="h-4 w-4" /> +6 this week
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Core technical skills", pct: 42, color: "from-violet-500 to-indigo-500" },
                  { label: "Coding / DSA", pct: 42, color: "from-blue-500 to-cyan-500" },
                  { label: "Projects / portfolio", pct: 42, color: "from-emerald-500 to-teal-500" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-medium text-slate-600">{row.label}</span>
                      <span className="font-bold text-slate-900">{row.pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${row.color} animate-progress-fill`}
                        style={{ width: `${row.pct}%`, animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-4 py-3">
                <p className="text-xs leading-relaxed text-amber-800">
                  <span className="font-bold">Biggest lever:</span> Projects &amp; portfolio — 2 of 8 project tasks completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Opportunity Gateway ── */}
      <section id="gateway" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Opportunity gateway</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">We don&apos;t rebuild the web. We route it.</h2>
          <p className="mt-4 text-lg text-slate-600">
            CareerOS tracks whether you viewed, saved or applied to each opportunity — and uses that as
            evidence in your readiness score.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GATEWAYS.map((g, i) => (
            <Reveal key={g.name} delay={(i % 3) * 80} className="h-full">
              <a
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3`}
                  style={{ backgroundColor: g.color }}
                >
                  {g.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    {g.name}
                    <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500">{g.text}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── For Colleges ── */}
      <section id="colleges" className="relative border-y border-slate-100/80 bg-gradient-to-b from-slate-50/80 to-white py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">For colleges &amp; mentors</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Institution intelligence without surveillance</h2>
            <p className="mt-4 text-lg text-slate-600">
              Batch, department and degree-level dashboards show task-completion trends, skill-gap
              distribution, readiness spread and participation — with actionable intervention lists for
              mentors.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              { value: "61", label: "Avg. readiness", gradient: "from-violet-500 to-purple-600" },
              { value: "74%", label: "Task completion", gradient: "from-emerald-500 to-teal-500" },
              { value: "12", label: "Need support", gradient: "from-amber-500 to-orange-500" },
              { value: "9", label: "Skill gaps tracked", gradient: "from-rose-500 to-pink-500" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="h-full">
                <div className="group flex h-full flex-col justify-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm card-interactive">
                  <p className={`text-3xl font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent transition-transform group-hover:scale-110`}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-fade-in-up delay-400">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Readiness</th>
                    <th className="px-5 py-3 font-semibold">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {SIGNALS.map((row, i) => (
                    <Reveal as="tr" key={row.name} delay={i * 60} className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.role}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${row.score}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{row.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={badgeVariant(row.tone)}>{row.signal}</Badge>
                      </td>
                    </Reveal>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 mb-4">
            <Heart className="h-3 w-3" /> Loved by students
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Built for consistency, not intensity</h2>
          <p className="mt-4 text-lg text-slate-600">
            Small daily tasks, visible progress, adaptive recommendations — the loop that keeps students coming back.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author} delay={i * 100} className="h-full">
              <div className="group relative flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm card-interactive">
                <div className="absolute -top-3 left-6 text-4xl text-slate-200 font-serif">&ldquo;</div>
                <p className="flex-1 pt-4 text-sm leading-relaxed text-slate-600">{t.quote}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-110`}>
                      {t.author}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.role}</p>
                      <p className="text-xs text-slate-400">{t.target}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float-delayed" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90 mb-6 backdrop-blur-sm">
              <Star className="h-3 w-3" /> Free for students
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Free for students. Always.</h2>
            <p className="mt-3 text-lg text-indigo-100">
              Start early. Build continuously. Get placement ready.
            </p>
            <p className="mt-3 text-sm text-indigo-200/80">
              Set up your Day-1 profile in five minutes. Your roadmap, daily plan and readiness score will be waiting.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-200">
            <Link href="/register">
              <Button size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl shadow-black/10 group">
                Build my career OS
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
                  CO
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Career OS</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                One intelligent system that continuously decides what a student should do next — from Day 1 to placement.
              </p>
            </div>
            <FooterCol title="Product" items={FOOTER_PRODUCT} />
            <FooterCol title="Platforms" items={FOOTER_PLATFORMS} />
            <FooterCol title="For colleges" items={FOOTER_COLLEGES} />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <p>&copy; 2026 CareerOS &middot; From Day 1 to Placement.</p>
            <div className="flex items-center gap-3 ml-auto">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Privacy-first
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-500">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-indigo-600"
              >
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-indigo-600">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardPreview() {
  const tasks = [
    { title: "Learn: SQL joins & aggregation", done: true },
    { title: "Solve: 2 SQL window-function problems", done: true },
    { title: "Project: Kaggle dataset exploration", done: false },
    { title: "Profile: ATS keywords for analytics", done: false },
  ];
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-indigo-200/50 animate-float">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-100/50 to-purple-100/50 blur-sm -z-10" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Placement readiness</p>
          <p className="text-sm font-semibold text-slate-700">Data Analyst &middot; Week 3</p>
        </div>
        <span className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
          careeros.app
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">58</span>
          <span className="mb-1.5 text-sm text-slate-400">/100</span>
        </div>
        <Badge variant="warning" className="animate-pulse-soft">Building Momentum</Badge>
      </div>
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Today&apos;s plan</p>
          <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
            <span className="animate-bounce-gentle inline-block">🔥</span> 6-day streak
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {tasks.map((t) => (
            <div key={t.title} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2.5">
                {t.done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[10px]">•</span>
                )}
                <span className={t.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}>{t.title}</span>
              </div>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${t.done ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                {t.done ? "DONE" : "TO DO"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-medium text-slate-500">Week 3 progress</span>
          <span className="font-bold text-slate-900">68%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-progress-fill" />
        </div>
      </div>
    </div>
  );
}
