"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROADMAP_DURATIONS, durationLabel } from "@/lib/constants";
import { generateRoadmapAction } from "@/server/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CalendarRange, Clock, Flag, Layers } from "lucide-react";

const DURATION_ICONS = [Flag, CalendarRange, Clock, Layers, Layers, Layers];

export function RoadmapPlanner({ currentWeeks }: { currentWeeks?: number }) {
  const router = useRouter();
  const [weeks, setWeeks] = useState<number>(currentWeeks ?? 12);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          {currentWeeks ? "Regenerate your roadmap" : "Create your AI roadmap"}
        </CardTitle>
        <p className="text-sm text-slate-500">
          Pick a duration — the AI analyses your profile and builds a personalized week-by-week plan to match it.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ROADMAP_DURATIONS.map((d, i) => {
            const Icon = DURATION_ICONS[i % DURATION_ICONS.length];
            const selected = weeks === d.weeks;
            return (
              <button
                key={d.weeks}
                type="button"
                onClick={() => setWeeks(d.weeks)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                  selected
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <Icon className={cn("mt-0.5 h-4 w-4", selected ? "text-indigo-600" : "text-slate-400")} />
                <span>
                  <span className="block text-sm font-semibold">{d.label}</span>
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
          <Button variant="gradient" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {currentWeeks ? "Regenerate with AI" : "Generate my roadmap"}
          </Button>
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
