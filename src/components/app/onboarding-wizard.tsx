"use client";

import { useActionState, useMemo, useState } from "react";
import {
  DEGREES,
  DEGREE_SPECIALIZATIONS,
  CAREER_ROLES_BY_DEGREE,
  YEARS,
  INDUSTRIES,
  INTERESTS,
  interestsForRole,
  interestsForSpecialization,
  recommendedInterests,
} from "@/lib/constants";
import { saveOnboardingAction, cancelPathChangeAction } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function OnboardingWizard({
  existing,
  showBack = false,
}: {
  existing: {
    degree: string;
    specialization: string;
    year: string;
    targetRole: string;
    targetRoles?: string[];
    weeklyHours: number;
    interests?: string;
    industries?: string;
  };
  showBack?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveOnboardingAction, null);

  const initialRoles = useMemo(() => {
    if (existing.targetRoles && existing.targetRoles.length > 0) return existing.targetRoles;
    return existing.targetRole ? [existing.targetRole] : [];
  }, [existing.targetRoles, existing.targetRole]);

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
  const [degree, setDegree] = useState<string>(existing.degree || "");
  const [specialization, setSpecialization] = useState<string>(existing.specialization || "");
  const [roles, setRoles] = useState<string[]>(initialRoles);

  const degreeOptions = (DEGREE_SPECIALIZATIONS[degree as keyof typeof DEGREE_SPECIALIZATIONS] ?? []) as string[];
  const roleOptions = (CAREER_ROLES_BY_DEGREE[degree as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[];

  const suggestedInterests = useMemo(() => recommendedInterests(specialization, roles), [specialization, roles]);
  const orderedInterests = useMemo(
    () => [...suggestedInterests, ...INTERESTS.filter((i) => !suggestedInterests.includes(i))],
    [suggestedInterests]
  );

  const changeDegree = (next: string) => {
    setDegree(next);
    const nextSpecs = (DEGREE_SPECIALIZATIONS[next as keyof typeof DEGREE_SPECIALIZATIONS] ?? []) as string[];
    if (!nextSpecs.includes(specialization)) setSpecialization("");
    const nextRoles = (CAREER_ROLES_BY_DEGREE[next as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[];
    setRoles((prev) => prev.filter((r) => nextRoles.includes(r)));
  };

  const changeSpecialization = (next: string) => {
    setSpecialization(next);
    if (next) {
      const add = interestsForSpecialization(next);
      setInterests((prev) => {
        const nextList = [...prev];
        for (const i of add) if (!nextList.includes(i)) nextList.push(i);
        return nextList;
      });
    }
  };

  const toggleRole = (role: string) => {
    const isAdding = !roles.includes(role);
    setRoles((prev) => (isAdding ? [...prev, role] : prev.filter((r) => r !== role)));
    if (isAdding) {
      const add = interestsForRole(role);
      setInterests((prev) => {
        const nextList = [...prev];
        for (const i of add) if (!nextList.includes(i)) nextList.push(i);
        return nextList;
      });
    }
  };

  const toggle = (list: string[], set: (v: string[]) => void, value: string) => {
    if (list.includes(value)) set(list.filter((v) => v !== value));
    else set([...list, value]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Step 1 — Tell us about you</CardTitle>
        <CardDescription>
          Day 1 onboarding: degree and career goal. Next, a short test grades your skills (1–5)
          from real performance — no self-rating — and builds your personalized roadmap.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showBack && (
          <form action={cancelPathChangeAction} className="mb-5">
            <Button type="submit" variant="outline" size="sm" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </Button>
          </form>
        )}
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Select
                id="degree"
                name="degree"
                required
                value={degree}
                onChange={(e) => changeDegree(e.target.value)}
              >
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
              <Select
                id="specialization"
                name="specialization"
                value={specialization}
                onChange={(e) => changeSpecialization(e.target.value)}
                disabled={!degree}
              >
                <option value="" disabled>
                  {degree ? "Select specialization" : "Select a degree first"}
                </option>
                {degreeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-400">
                Options adjust to the degree you choose above.
              </p>
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
              <Label>Target career roles</Label>
              <p className="mb-2 text-xs text-slate-400">Pick any — your roadmap focuses on the first one.</p>
              <div className="flex flex-wrap gap-2">
                {degree ? (
                  roleOptions.length > 0 ? (
                    roleOptions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        aria-pressed={roles.includes(r)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          roles.includes(r)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        )}
                      >
                        {r}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No roles for this degree.</p>
                  )
                ) : (
                  <p className="text-sm text-slate-400">Select a degree first to see matching roles.</p>
                )}
              </div>
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
            <p className="mb-2 text-xs text-slate-400">
              {suggestedInterests.length > 0
                ? `Suggested from your ${specialization ? `specialization +` : ""} roles automatically — uncheck any you don't want.`
                : "Pick what excites you — suggestions appear once you select roles."}
            </p>
            <div className="flex flex-wrap gap-2">
              {orderedInterests.map((i) => {
                const suggested = suggestedInterests.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggle(interests, setInterests, i)}
                    aria-pressed={interests.includes(i)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      interests.includes(i)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    )}
                  >
                    {i}
                    {suggested && (
                      <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                        Suggested
                      </span>
                    )}
                  </button>
                );
              })}
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
                  aria-pressed={industries.includes(i)}
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

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4">
            <p className="text-sm font-semibold text-indigo-700">Next up: your skill grading test</p>
            <p className="mt-1 text-sm text-slate-600">
              No need to rate yourself. After this step you&apos;ll take a short baseline test — we grade
              every skill (1–5) from how you actually perform and build your roadmap around the results.
            </p>
          </div>

          <input type="hidden" name="interests" value={JSON.stringify(interests)} />
          <input type="hidden" name="industries" value={JSON.stringify(industries)} />
          <input type="hidden" name="targetRoles" value={JSON.stringify(roles)} />
          <input type="hidden" name="targetRole" value={roles[0] ?? ""} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4">
            <span className="text-sm text-indigo-700">After saving, we generate your personalized roadmap.</span>
            <Button type="submit" disabled={pending} variant="gradient">
              {pending ? "Building roadmap..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
