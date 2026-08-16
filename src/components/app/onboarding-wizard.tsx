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
  visibleSkillCategories,
  SKILL_CATEGORY_LABELS,
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
    targetRoles?: string[];
    weeklyHours: number;
    interests?: string;
    industries?: string;
  };
  existingRatings: Record<string, number>;
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
  const [ratings, setRatings] = useState<Record<string, number>>(existingRatings);
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
  const visibleCategories = useMemo(() => visibleSkillCategories(degree, specialization, roles), [degree, specialization, roles]);

  const grouped = useMemo(() => {
    const map = new Map<string, WizardSkill[]>();
    for (const s of skills) {
      if (!visibleCategories.includes(s.category)) continue;
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries());
  }, [skills, visibleCategories]);

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

  const visibleSkillIds = useMemo(() => {
    const set = new Set<string>();
    for (const [, list] of grouped) for (const s of list) set.add(s.id);
    return set;
  }, [grouped]);

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
            {!degree ? (
              <p className="text-sm text-slate-400">Select a degree first to see relevant skills.</p>
            ) : (
              <>
                <p className="mb-3 text-xs text-slate-400">
                  Skills adjust to your degree, specialization and roles — re-pick roles to see the list change.
                </p>
                <div className="space-y-4">
                  {grouped.length === 0 && (
                    <p className="text-sm text-slate-400">No skills available for this degree.</p>
                  )}
                  {grouped.map(([category, list]) => (
                    <div key={category} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-500">
                        {SKILL_CATEGORY_LABELS[category] ?? category}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {list.map((s) => {
                          const r = ratings[s.id] ?? 0;
                          return (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <span className="min-w-[100px] text-sm font-medium text-slate-700">{s.name}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setRatings((prev) => ({ ...prev, [s.id]: n }))}
                                    className={cn(
                                      "h-7 w-7 rounded-md text-xs font-semibold transition-colors",
                                      r === n
                                        ? "bg-indigo-600 text-white shadow-sm"
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
              </>
            )}
          </div>

          <input type="hidden" name="interests" value={JSON.stringify(interests)} />
          <input type="hidden" name="industries" value={JSON.stringify(industries)} />
          <input type="hidden" name="targetRoles" value={JSON.stringify(roles)} />
          <input type="hidden" name="targetRole" value={roles[0] ?? ""} />
          <input
            type="hidden"
            name="skills"
            value={JSON.stringify(
              Object.entries(ratings)
                .filter(([skillId]) => visibleSkillIds.has(skillId))
                .map(([skillId, rating]) => ({ skillId, rating }))
            )}
          />

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
