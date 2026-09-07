"use client";

import { useState, useRef, useEffect } from "react";
import {
  getOpportunitySuggestionsAction,
  getOpportunitySuggestionsStatusAction,
  refreshOpportunitySuggestionsAction,
  type OpportunityLoadResult,
} from "@/server/actions/opportunities";
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

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

export function OpportunitiesPanel({ initialData }: { initialData: OpportunityLoadResult | null }) {
  const [data, setData] = useState<OpportunityData | null>(
    initialData?.status === "ready" ? initialData.data : null
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(
    initialData?.status === "ready" ? initialData.generatedAt : null
  );
  const [generating, setGenerating] = useState(initialData?.status === "pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await refreshOpportunitySuggestionsAction();
      if (!mountedRef.current) return;
      if (res.status === "ready") {
        setData(res.data);
        setGeneratedAt(res.generatedAt);
      }
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : "Failed to refresh suggestions");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearPoll();
    };
  }, []);

  useEffect(() => {
    if (initialData?.status !== "pending") return;
    let attempts = 0;

    const tick = async () => {
      attempts++;
      const s = await getOpportunitySuggestionsStatusAction();
      if (!mountedRef.current) return;
      if (s.status === "ready") {
        clearPoll();
        const res = await getOpportunitySuggestionsAction();
        if (!mountedRef.current) return;
        if (res.status === "ready") {
          setData(res.data);
          setGeneratedAt(res.generatedAt);
        }
        setGenerating(false);
      } else if (s.status === "failed") {
        clearPoll();
        setError("AI generation failed. Tap Refresh to try again.");
        setGenerating(false);
      } else if (attempts > 40) {
        clearPoll();
        setError("This is taking longer than expected. Tap Refresh to try again.");
        setGenerating(false);
      }
    };

    pollRef.current = setInterval(tick, 3000);
    tick();
    return clearPoll;
  }, [initialData?.status]);

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">AI is preparing your personalized opportunities...</p>
        <p className="mt-1 text-xs text-slate-400">This takes a few seconds — we will show them here as soon as they are ready</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="border-rose-100">
        <CardContent className="flex flex-col items-center py-12">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <Button variant="outline" onClick={refresh} disabled={loading} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-xs text-amber-700">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <Card className="border-indigo-100 bg-indigo-50/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700">{data.summary}</p>
          </div>
        </CardContent>
      </Card>

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

      <div className="flex flex-col items-center gap-2 pt-4">
        {generatedAt && (
          <p className="text-[11px] text-slate-400">
            Suggestions updated {new Date(generatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
        <Button variant="outline" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Suggestions
        </Button>
      </div>
    </div>
  );
}