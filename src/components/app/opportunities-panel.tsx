"use client";

import { useState, useRef } from "react";
import { getOpportunitySuggestionsAction } from "@/server/actions/opportunities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Briefcase,
  Trophy,
  FileQuestion,
  GraduationCap,
  GitBranch,
  Medal,
  Bell,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface PlatformSuggestion {
  platform: string;
  url: string;
  category: string;
  description: string;
  whyRelevant: string;
  difficulty: string;
  estimatedTime: string;
  isFree: boolean;
}

interface OpportunityData {
  internships: PlatformSuggestion[];
  hackathons: PlatformSuggestion[];
  quizzes: PlatformSuggestion[];
  certifications: PlatformSuggestion[];
  openSource: PlatformSuggestion[];
  competitions: PlatformSuggestion[];
  reminders: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    actionUrl: string;
    actionLabel: string;
  }>;
  summary: string;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Briefcase; label: string; color: string }> = {
  INTERNSHIP: { icon: Briefcase, label: "Internships & Jobs", color: "text-emerald-600" },
  HACKATHON: { icon: Trophy, label: "Hackathons", color: "text-amber-600" },
  QUIZ: { icon: FileQuestion, label: "Quizzes & Practice", color: "text-blue-600" },
  CERTIFICATION: { icon: GraduationCap, label: "Free Certifications", color: "text-purple-600" },
  OPEN_SOURCE: { icon: GitBranch, label: "Open Source", color: "text-orange-600" },
  COMPETITION: { icon: Medal, label: "Competitions", color: "text-rose-600" },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
};

export function OpportunitiesPanel({ initialData }: { initialData: OpportunityData | null }) {
  const [data, setData] = useState<OpportunityData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getOpportunitySuggestionsAction()
      .then((result) => { if (mountedRef.current) setData(result); })
      .catch((e) => { if (mountedRef.current) setError(e instanceof Error ? e.message : "Failed to load suggestions"); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">AI is analyzing your profile...</p>
        <p className="mt-1 text-xs text-slate-400">Finding the best platforms for your career path</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-100">
        <CardContent className="flex flex-col items-center py-12">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <Button variant="outline" onClick={fetchData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const allPlatforms: PlatformSuggestion[] = [
    ...data.internships,
    ...data.hackathons,
    ...data.quizzes,
    ...data.certifications,
    ...data.openSource,
    ...data.competitions,
  ];

  const groupedByCategory = allPlatforms.reduce<Record<string, PlatformSuggestion[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  const reminders = data.reminders || [];

  return (
    <div className="space-y-8">
      <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700">{data.summary}</p>
          </div>
        </CardContent>
      </Card>

      {reminders.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Bell className="h-4 w-4" />
            Action Items
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {reminders.map((r, i) => (
              <Card key={i} className={`border ${PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.LOW}`}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{r.title}</p>
                      <Badge variant={r.priority === "HIGH" ? "danger" : r.priority === "MEDIUM" ? "warning" : "secondary"} className="text-[10px]">
                        {r.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{r.description}</p>
                  </div>
                  <Link href={r.actionUrl}>
                    <Button size="sm" variant="outline" className="shrink-0">
                      {r.actionLabel}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {Object.entries(groupedByCategory).map(([category, platforms]) => {
        const config = CATEGORY_CONFIG[category] ?? { icon: Briefcase, label: category, color: "text-slate-600" };
        const Icon = config.icon;
        return (
          <section key={category}>
            <h2 className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${config.color}`}>
              <Icon className="h-4 w-4" />
              {config.label}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {platforms.map((p, i) => (
                <Card key={i} className="group hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col h-full p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-slate-800">{p.platform}</p>
                      <div className="flex gap-1 shrink-0">
                        {p.isFree && (
                          <Badge variant="success" className="text-[10px]">Free</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px]">{p.difficulty}</Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 flex-1">{p.description}</p>
                    <div className="mt-2 rounded-lg bg-indigo-50/60 px-2.5 py-1.5">
                      <p className="text-[11px] text-indigo-700">
                        <span className="font-semibold">Why this matters:</span> {p.whyRelevant}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{p.estimatedTime}</span>
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Suggestions
        </Button>
      </div>
    </div>
  );
}
