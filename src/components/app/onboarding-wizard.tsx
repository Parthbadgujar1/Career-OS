"use client";

import { useActionState, useMemo, useState } from "react";
import {
  DEGREES,
  YEARS,
  CAREER_ROLES,
  INDUSTRIES,
  INTERESTS,
} from "@/lib/constants";
import { saveOnboardingAction } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WizardSkill {
  id: string;
  name: string;
  category: string;
}

export function OnboardingWizard({
  skills,
  existing,
  existingRatings,
}: {
  skills: WizardSkill[];
  existing: {
    degree: string;
    specialization: string;
    year: string;
    targetRole: string;
    weeklyHours: number;
    interests?: string;
    industries?: string;
  };
  existingRatings: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState(saveOnboardingAction, null);

  const initialInterests = useMemo(() => {
    try {
      return JSON.parse(existing.interests || "[]") as string[];
    } catch {
      return [] as string[];
    }
  }, [existing.interests]);
  const initialIndustries = useMemo(() => {
    try {
      return JSON.parse(existing.industries || "[]") as string[];
    } catch {
      return [] as string[];
    }
  }, [existing.industries]);

  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [industries, setIndustries] = useState<string[]>(initialIndustries);
  const [ratings, setRatings] = useState<Record<string, number>>(existingRatings);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) => {
    if (list.includes(value)) set(list.filter((v) => v !== value));
    else set([...list, value]);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, WizardSkill[]>();
    for (const s of skills) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries());
  }, [skills]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Step 1 — Tell us about you</CardTitle>
        <CardDescription>
          Day 1 onboarding: degree, career goal and current skills. We use this to build your
          personalized roadmap.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Select id="degree" name="degree" required defaultValue={existing.degree || undefined}>
                <option value="" disabled>
                  Select degree
                </option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="specialization">Specialization / Branch</Label>
              <Input
                id="specialization"
                name="specialization"
                defaultValue={existing.specialization}
                placeholder="e.g. Computer Science, Electronics, Finance"
              />
            </div>
            <div>
              <Label htmlFor="year">Current year</Label>
              <Select id="year" name="year" required defaultValue={existing.year || undefined}>
                <option value="" disabled>
                  Select year
                </option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="targetRole">Target career role</Label>
              <Select id="targetRole" name="targetRole" required defaultValue={existing.targetRole || undefined}>
                <option value="" disabled>
                  Select role
                </option>
                {CAREER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="weeklyHours">Weekly hours you can invest</Label>
              <Input
                id="weeklyHours"
                name="weeklyHours"
                type="number"
                min={1}
                max={60}
                defaultValue={existing.weeklyHours || 10}
              />
            </div>
          </div>

          <div>
            <Label>Interests (pick any)</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(interests, setInterests, i)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    interests.includes(i)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Preferred industries (pick any)</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(industries, setIndustries, i)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    industries.includes(i)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Current skill level (rate 1–5, skip what you don&apos;t know)</Label>
            <div className="space-y-4">
              {grouped.map(([category, list]) => (
                <div key={category} className="rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {category}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {list.map((s) => {
                      const r = ratings[s.id] ?? 0;
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5"
                        >
                          <span className="text-sm">{s.name}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setRatings((prev) => ({ ...prev, [s.id]: n }))}
                                className={cn(
                                  "h-6 w-6 rounded-md text-xs font-semibold transition-colors",
                                  r === n
                                    ? "bg-indigo-600 text-white"
                                    : r === 0
                                      ? "text-slate-300 hover:bg-slate-100"
                                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                )}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <input type="hidden" name="interests" value={JSON.stringify(interests)} />
          <input type="hidden" name="industries" value={JSON.stringify(industries)} />
          <input
            type="hidden"
            name="skills"
            value={JSON.stringify(
              Object.entries(ratings).map(([skillId, rating]) => ({ skillId, rating }))
            )}
          />

          <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <span>After saving, we generate your personalized 12-week roadmap.</span>
            <Button type="submit" disabled={pending}>
              {pending ? "Building roadmap..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
