"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, ChevronDown, BookOpen, Zap, Star, Heart, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "roadmap", label: "Roadmap & Tasks", icon: Zap },
  { id: "ai", label: "AI Features", icon: Star },
  { id: "account", label: "Account", icon: Heart },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

const FAQS: { q: string; a: string; cat: Category }[] = [
  {
    q: "How does the readiness score work?",
    a: "Your readiness score (0-100) is calculated from 9 dimensions: technical skills, coding practice, assessments, projects, resume quality, profile strength, interview prep, opportunities engagement, and consistency. Each dimension contributes to your overall placement readiness.",
    cat: "getting-started",
  },
  {
    q: "What is the career roadmap?",
    a: "The roadmap is a personalized 12-week plan generated based on your target role, current skills, and interests. It includes weekly milestones across learning, coding, projects, profile work, interviews, and opportunities. Complete milestones to progress.",
    cat: "roadmap",
  },
  {
    q: "How do daily tasks work?",
    a: "Tasks are auto-generated each day based on your roadmap and skill gaps. Complete them to build streaks, earn XP, and improve your readiness. You can also skip tasks if they're not relevant.",
    cat: "roadmap",
  },
  {
    q: "Can I use Career OS without an AI API key?",
    a: "Yes! All core features work with deterministic fallbacks. AI features (resume review, roadmap generation, profile analysis) use Gemini when GEMINI_API_KEY is set, otherwise they provide structured rule-based guidance.",
    cat: "ai",
  },
  {
    q: "How do I get a mentor?",
    a: "Mentors are assigned by program admins. Once assigned, they can view your progress, skill gaps, and weekly reports. You'll see their contact info in the Mentor section and can message them directly.",
    cat: "account",
  },
  {
    q: "What are opportunities?",
    a: "Opportunities are internships, jobs, hackathons, and events sourced from platforms like Internshala, LinkedIn, Unstop, etc. They're matched to your profile. You can save, apply, or mark as completed.",
    cat: "opportunities",
  },
];

export default function HelpPage() {
  const [selected, setSelected] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  const visible = selected ? FAQS.filter((f) => f.cat === selected) : FAQS;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="mt-2 text-slate-500">Find answers to common questions about Career OS</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selected === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected(selected === cat.id ? null : cat.id)}
          >
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((faq, i) => {
          const open = expanded === i;
          return (
            <Card
              key={faq.q}
              className={cn(
                "overflow-hidden transition-all duration-200",
                open && "border-indigo-300 shadow-md shadow-indigo-100"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
                aria-expanded={open}
              >
                <span className="text-base font-medium text-slate-900">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                    open && "rotate-180 text-indigo-500"
                  )}
                />
              </button>
              {open && (
                <div className="px-5 pb-4 animate-slide-in-up">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </Card>
          );
        })}
        {visible.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">No questions in this category yet.</p>
        )}
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>Can&apos;t find what you&apos;re looking for?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <a href="mailto:support@carrer.com">
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/app/coach">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI Coach
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
