"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROADMAP_DURATIONS, durationLabel } from "@/lib/constants";
import { generateRoadmapAction } from "@/server/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CalendarRange, Clock, Flag, Layers, Star } from "lucide-react";

const DURATION_ICONS = [Flag, CalendarRange, Clock, Layers, Layers, Layers];

interface RoadmapPlannerProps {
  currentWeeks?: number;
  recommendedWeeks?: number;
  maxWeeks?: number;
  yearHint?: string;
  variant?: "card" | "inline";
}

export function RoadmapPlanner({ currentWeeks, recommendedWeeks, maxWeeks = 208, yearHint, variant = "card" }: RoadmapPlannerProps) {
  const router = useRouter();
  const [weeks, setWeeks] = useState<number>(currentWeeks ?? recommendedWeeks ?? 12);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = ROADMAP_DURATIONS.filter((d) => d.weeks <= maxWeeks);

  const submit = async () => {
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("durationWeeks", String(weeks));
    try {
      await generateRoadmapAction(fd);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate roadmap.");
      setPending(false);
    }
  };

  const header = (
    <>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        {currentWeeks ? "Regenerate your roadmap" : "Create your AI roadmap"}
      </CardTitle>
      <p className="text-sm text-slate-500">
        {currentWeeks
          ? "Pick a duration — the AI replans your whole journey, week by week, with free resources for each week."
          : "The AI analyses your profile and builds a week-by-week plan for the rest of your college journey — with free resources (roadmap.sh, YouTube, freeCodeCamp) inside every week."}
      </p>
    </>
  );

  const content = (
    <>
      {yearHint && (
        <p className="flex items-start gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {yearHint}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((d, i) => {
          const Icon = DURATION_ICONS[i % DURATION_ICONS.length];
          const selected = weeks === d.weeks;
          const recommended = !currentWeeks && d.weeks === recommendedWeeks;
          return (
            <button
              key={d.weeks}
              type="button"
              onClick={() => setWeeks(d.weeks)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                selected
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-slate-200 bg-surface hover:border-slate-300"
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4", selected ? "text-indigo-600" : "text-slate-400")} />
              <span>
                <span className="block text-sm font-semibold">
                  {d.label}
                  {recommended && (
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Best fit
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{d.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {currentWeeks && weeks !== currentWeeks && (
        <p className="text-xs text-slate-500">
          Your current plan is {durationLabel(currentWeeks)}. Regenerating replaces it with a {durationLabel(weeks)} plan.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {currentWeeks ? "Regenerate with AI" : "Generate my roadmap"}
        </Button>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm">
        <div>{header}</div>
        <div className="space-y-4">{content}</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardContent className="space-y-5">{content}</CardContent>
    </Card>
  );
}