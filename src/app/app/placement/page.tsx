import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { AptitudePracticeCard } from "@/components/app/placement-practice";
import { APTITUDE_PRACTICE_SETS } from "@/lib/assessment-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fromJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

const COMPANIES = [
  {
    name: "TCS / Wipro / Infosys / HCL",
    sector: "IT Services",
    focus: ["Quantitative aptitude", "Logical reasoning", "Verbal ability", "Technical MCQs (C, OOP, DBMS)", "HR interview"],
    prep: ["aptitude", "coding", "interviews"],
  },
  {
    name: "Accenture / Cognizant / Capgemini",
    sector: "IT Consulting",
    focus: ["Aptitude + analytical writing", "Communication & group tasks", "Technical fundamentals", "Mock interviews"],
    prep: ["aptitude", "coding", "interviews"],
  },
  {
    name: "Amazon / Google / Microsoft",
    sector: "Product / FAANG",
    focus: ["DSA — arrays, hash maps, trees, DP", "Problem-solving speed", "System design basics", "Behavioral (STAR) rounds"],
    prep: ["coding", "interviews"],
  },
  {
    name: "Flipkart / Swiggy / Zomato",
    sector: "Product / E-commerce",
    focus: ["DSA + SQL", "Low-level & high-level design", "Product sense", "Data-analysis basics"],
    prep: ["coding", "interviews"],
  },
  {
    name: "Deloitte / PwC / EY",
    sector: "Consulting",
    focus: ["Numerical & logical reasoning", "Business case basics", "Communication", "HR + behavioral"],
    prep: ["aptitude", "interviews"],
  },
  {
    name: "NVIDIA / Intel / Samsung R&D",
    sector: "Semiconductors / R&D",
    focus: ["C/C++ fundamentals", "OS, computer architecture", "DSA", "Puzzles & analytical ability"],
    prep: ["coding", "interviews"],
  },
];

const HR_QUESTIONS = [
  { q: "Tell me about yourself", tip: "60-second structured answer: education → skills → projects → why this role." },
  { q: "Why do you want to join this company?", tip: "Research the company, connect its work to your skills and goals." },
  { q: "What are your strengths and weaknesses?", tip: "Give a real weakness plus the step you take to improve it." },
  { q: "Where do you see yourself in five years?", tip: "Show ambition aligned to the role — growth, not just a promotion." },
  { q: "Why should we hire you?", tip: "Two specific skills, one project proof, and your consistency record." },
];

const COMPANY_TARGETS: Record<string, string> = {
  coding: "/app/coding",
  aptitude: "/app/placement#aptitude",
  interviews: "/app/interviews",
};

export default async function PlacementPage() {
  const { profile } = await requireStudentProfile();

  const assessments = await prisma.assessment.findMany({
    where: { studentId: profile.id, type: "APTITUDE" },
    orderBy: { takenAt: "desc" },
  });
  const practiceTaken: Record<string, { score: number; maxScore: number }> = {};
  for (const a of assessments) {
    const key = fromJson<{ set?: string }>(a.data, {}).set;
    if (key && !practiceTaken[key]) practiceTaken[key] = { score: a.score, maxScore: a.maxScore };
  }

  const aptitudeAvg = assessments.length
    ? Math.round((assessments.reduce((s, a) => s + (a.score / a.maxScore) * 100, 0) / assessments.length))
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Placement Preparation</h1>
        <p className="text-sm text-slate-500">
          Aptitude, DSA, technical subjects, HR prep and company-specific plans — all in one place.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Aptitude practice progress</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{aptitudeAvg}%</p>
            </div>
            <Badge variant={aptitudeAvg >= 70 ? "success" : aptitudeAvg >= 40 ? "warning" : "secondary"}>
              {aptitudeAvg >= 70 ? "Strong" : aptitudeAvg >= 40 ? "Building" : "Start practicing"}
            </Badge>
          </div>
          <Progress value={aptitudeAvg} className="mt-3" />
          <p className="mt-2 text-xs text-slate-400">
            Each practice set feeds your Aptitude / Assessments readiness dimension.
          </p>
        </CardContent>
      </Card>

      <section id="aptitude" className="scroll-mt-20">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Aptitude practice</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {APTITUDE_PRACTICE_SETS.map((set) => (
            <AptitudePracticeCard key={set.key} set={set} taken={practiceTaken[set.key]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Technical practice</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/app/coding">
            <div className="rounded-xl border border-slate-200 bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="font-semibold">Coding Practice</p>
              <p className="mt-1 text-sm text-slate-500">
                Daily problems across Arrays, Strings, Linked Lists, Trees, DP and more — adapted to your weak topics.
              </p>
            </div>
          </Link>
          <Link href="/app/assessment">
            <div className="rounded-xl border border-slate-200 bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="font-semibold">AI Skill Assessment</p>
              <p className="mt-1 text-sm text-slate-500">
                Adaptive questions that grade your skills against your target career and identify your gaps.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Company-specific prep</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {COMPANIES.map((c) => (
            <div key={c.name} className="flex flex-col rounded-xl border border-slate-200 bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{c.name}</p>
                <Badge variant="secondary">{c.sector}</Badge>
              </div>
              <ul className="mt-3 flex-1 list-inside list-disc space-y-1 text-sm text-slate-600">
                {c.focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.prep.map((p) => (
                  <Link key={p} href={COMPANY_TARGETS[p]}>
                    <Button size="sm" variant="outline">
                      {p === "aptitude" ? "Aptitude" : p === "coding" ? "Coding" : "Interviews"}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">HR interview prep</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {HR_QUESTIONS.map((h) => (
              <div key={h.q} className="rounded-xl border border-slate-200 bg-surface p-4 shadow-sm">
                <p className="font-medium">{h.q}</p>
                <p className="mt-1 text-sm text-slate-500">{h.tip}</p>
              </div>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Practice with a mock interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">
                Record a technical, HR or behavioral mock interview. Scores and weak areas feed your readiness score.
              </p>
              <Link href="/app/interviews">
                <Button className="w-full">Open Mock Interviews</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
