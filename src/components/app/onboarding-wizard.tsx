"use client";

import { useActionState, useMemo, useState } from "react";
import {
  DEGREES,
  DEGREE_SPECIALIZATIONS,
  CAREER_ROLES_BY_DEGREE,
  CAREER_BLURBS,
  CAREER_MARKET,
  DEMAND_RANK,
  YEARS,
  INDUSTRIES,
  INTERESTS,
  interestsForRole,
  interestsForSpecialization,
  recommendedInterests,
} from "@/lib/constants";
import { saveOnboardingAction, cancelPathChangeAction } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Rocket,
  Clock,
  Plus,
  Sparkles,
  Target,
  Search,
  IndianRupee,
  TrendingUp,
  Route,
} from "lucide-react";

const CUSTOM_VALUE = "__other__";
const KNOWN_DEGREES = DEGREES as readonly string[];
const KNOWN_INDUSTRIES = INDUSTRIES as readonly string[];
const KNOWN_INTERESTS = INTERESTS as readonly string[];

const DEMAND_DOT: Record<string, string> = {
  "Very High": "bg-rose-500",
  High: "bg-amber-500",
  Growing: "bg-emerald-500",
  Niche: "bg-slate-400",
};

const DEMAND_BADGE: Record<string, string> = {
  "Very High": "bg-rose-100 text-rose-700",
  High: "bg-amber-100 text-amber-700",
  Growing: "bg-emerald-100 text-emerald-700",
  Niche: "bg-slate-200 text-slate-600",
};

function divisionSpecsFor(degree: string): string[] {
  return (DEGREE_SPECIALIZATIONS[degree as keyof typeof DEGREE_SPECIALIZATIONS] ?? []) as string[];
}

const STEPS = [
  { title: "Currently Pursuing", subtitle: "What you are studying or doing now", icon: GraduationCap },
  { title: "Target Career", subtitle: "Where you want to go", icon: Rocket },
  { title: "Availability", subtitle: "How much time you can invest daily", icon: Clock },
];

export function OnboardingWizard({
  existing,
  showBack = false,
}: {
  existing: {
    degree: string;
    specialization: string;
    year: string;
    currentlyPursuing?: string;
    targetRole: string;
    targetRoles?: string[];
    weeklyHours: number;
    dailyHours?: number;
    interests?: string;
    industries?: string;
  };
  showBack?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveOnboardingAction, null);
  const [step, setStep] = useState(0);
  const [touchError, setTouchError] = useState<string | null>(null);

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
  const [degree, setDegree] = useState(() =>
    existing.degree && KNOWN_DEGREES.includes(existing.degree) ? existing.degree : ""
  );
  const [degreeCustom, setDegreeCustom] = useState(
    () => Boolean(existing.degree) && !KNOWN_DEGREES.includes(existing.degree)
  );
  const [customDegree, setCustomDegree] = useState(() =>
    existing.degree && !KNOWN_DEGREES.includes(existing.degree) ? existing.degree : ""
  );
  const [specialization, setSpecialization] = useState(() =>
    existing.specialization && divisionSpecsFor(existing.degree).includes(existing.specialization)
      ? existing.specialization
      : ""
  );
  const [specCustom, setSpecCustom] = useState(() =>
    Boolean(existing.specialization) && !divisionSpecsFor(existing.degree).includes(existing.specialization)
  );
  const [customSpecialization, setCustomSpecialization] = useState(() =>
    existing.specialization && !divisionSpecsFor(existing.degree).includes(existing.specialization)
      ? existing.specialization
      : ""
  );
  const [year, setYear] = useState<string>(existing.year || "");
  const [currentContext, setCurrentContext] = useState<string>(existing.currentlyPursuing || "");
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [dailyHours, setDailyHours] = useState<number>(existing.dailyHours || Math.round((existing.weeklyHours || 14) / 7) || 2);
  const [customRole, setCustomRole] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  const degreeOptions = divisionSpecsFor(degree);
  const roleOptions = useMemo(
    () => (CAREER_ROLES_BY_DEGREE[degree as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[],
    [degree]
  );

  const resolvedDegree = degreeCustom ? customDegree.trim() : degree;
  const resolvedSpecialization = degreeCustom || specCustom ? customSpecialization.trim() : specialization;
  const primaryRole = roles[0];
  const primaryBlurb = primaryRole ? CAREER_BLURBS[primaryRole] : undefined;
  const primaryMarket = primaryRole ? CAREER_MARKET[primaryRole] : undefined;

  const [careerQuery, setCareerQuery] = useState("");
  const careerQueryLower = careerQuery.trim().toLowerCase();
  const orderedRoleOptions = useMemo(() => {
    const withMarket = roleOptions.filter((r) => CAREER_MARKET[r]);
    withMarket.sort((a, b) => (DEMAND_RANK[CAREER_MARKET[a].demand] ?? 9) - (DEMAND_RANK[CAREER_MARKET[b].demand] ?? 9));
    const withoutMarket = roleOptions.filter((r) => !CAREER_MARKET[r]);
    return [...withMarket, ...withoutMarket].filter((r) => !careerQueryLower || r.toLowerCase().includes(careerQueryLower));
  }, [roleOptions, careerQueryLower]);
  const visibleCustomRoles = roles.filter(
    (r) => !roleOptions.includes(r) && (!careerQueryLower || r.toLowerCase().includes(careerQueryLower))
  );
  const comparison = roles.slice(0, 4).map((r) => ({
    role: r,
    salary: CAREER_MARKET[r]?.salary,
    demand: CAREER_MARKET[r]?.demand,
    custom: !CAREER_MARKET[r],
  }));

  const suggestedInterests = useMemo(() => recommendedInterests(specialization, roles), [specialization, roles]);
  const orderedInterests = useMemo(
    () => [...suggestedInterests, ...INTERESTS.filter((i) => !suggestedInterests.includes(i))],
    [suggestedInterests]
  );

  const changeDegree = (next: string) => {
    if (next === CUSTOM_VALUE) {
      setDegreeCustom(true);
      setDegree("");
      setSpecialization("");
      setSpecCustom(false);
      return;
    }
    setDegreeCustom(false);
    setCustomDegree("");
    setDegree(next);
    const nextSpecs = divisionSpecsFor(next);
    if (!nextSpecs.includes(specialization)) setSpecialization("");
    const nextRoles = (CAREER_ROLES_BY_DEGREE[next as keyof typeof CAREER_ROLES_BY_DEGREE] ?? []) as string[];
    setRoles((prev) => prev.filter((r) => nextRoles.includes(r)));
  };

  const changeSpecialization = (next: string) => {
    if (next === CUSTOM_VALUE) {
      setSpecCustom(true);
      setSpecialization("");
      return;
    }
    setSpecCustom(false);
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

  const addCustomRole = () => {
    const v = customRole.trim();
    if (!v) return;
    if (!roles.includes(v)) setRoles((prev) => [...prev, v]);
    setCustomRole("");
  };

  const addCustomIndustry = () => {
    const v = customIndustry.trim();
    if (!v) return;
    if (!industries.includes(v)) setIndustries((prev) => [...prev, v]);
    setCustomIndustry("");
  };

  const addCustomInterest = () => {
    const v = customInterest.trim();
    if (!v) return;
    if (!interests.includes(v)) setInterests((prev) => [...prev, v]);
    setCustomInterest("");
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

  const canGoNext = () => {
    if (step === 0) {
      if (!resolvedDegree) return setTouchError("Select your degree to continue.");
      if (!resolvedSpecialization) return setTouchError("Add your specialization to continue.");
      if (!year) return setTouchError("Select your current year to continue.");
      return true;
    }
    if (step === 1) {
      if (roles.length === 0) return setTouchError("Pick at least one target career.");
      return true;
    }
    return true;
  };

  const next = () => {
    setTouchError(null);
    if (canGoNext() === true) setStep((s) => Math.min(s + 1, 2));
  };

  const back = () => {
    setTouchError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight">{STEPS[step].title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{STEPS[step].subtitle}</p>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-400"
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-6 rounded-full", i < step ? "bg-emerald-400" : "bg-slate-200")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {showBack && (
          <form action={cancelPathChangeAction} className="mb-5">
            <Button type="submit" variant="outline" size="sm" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </Button>
          </form>
        )}

        {state?.error && (
          <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
        )}
        {touchError && (
          <p role="alert" className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{touchError}</p>
        )}

        <form action={formAction} className="space-y-6">
          {/* ── Step 1: Currently Pursuing ─────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in-up">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <p className="text-sm text-slate-700">
                  This tells us your <strong>starting point</strong>. Your career plan is built from here to your
                  target — so accuracy matters. If your field isn&apos;t listed, pick{" "}
                  <strong>Other / Not listed</strong> and type it in — our AI adapts to any field.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Select
                    id="degree"
                    value={degreeCustom ? CUSTOM_VALUE : degree}
                    onChange={(e) => changeDegree(e.target.value)}
                  >
                    <option value="" disabled>Select degree</option>
                    {DEGREES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value={CUSTOM_VALUE}>Other / Not listed</option>
                  </Select>
                  {degreeCustom && (
                    <div className="mt-2 animate-fade-in-up">
                      <Input
                        value={customDegree}
                        onChange={(e) => setCustomDegree(e.target.value)}
                        placeholder="Type your degree — e.g. B.Com, LLB"
                        aria-label="Custom degree"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        We&apos;ll analyse your field and map suitable career paths for it.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization / Branch</Label>
                  {degreeCustom ? (
                    <Input
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      placeholder="e.g. Finance, Product Design, any branch"
                      aria-label="Custom specialization"
                    />
                  ) : (
                    <>
                      <Select
                        id="specialization"
                        value={specCustom ? CUSTOM_VALUE : specialization}
                        onChange={(e) => changeSpecialization(e.target.value)}
                        disabled={!degree}
                      >
                        <option value="" disabled>
                          {degree ? "Select specialization (recommended)" : "Select a degree first"}
                        </option>
                        {degreeOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value={CUSTOM_VALUE}>Other / Not listed</option>
                      </Select>
                      {specCustom && (
                        <Input
                          value={customSpecialization}
                          onChange={(e) => setCustomSpecialization(e.target.value)}
                          placeholder="Type your specialization / branch"
                          className="mt-2"
                          aria-label="Custom specialization"
                        />
                      )}
                    </>
                  )}
                </div>
                <div>
                  <Label>Current year</Label>
                  <div className="flex flex-wrap gap-2">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYear(y)}
                        aria-pressed={year === y}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          year === y
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        )}
                      >
                        {year === y && <Check className="h-3.5 w-3.5" />}
                        {y}
                      </button>
                    ))}
                  </div>
                  {!year && <p className="mt-1 text-xs text-slate-400">Required — paces your roadmap duration.</p>}
                </div>
                <div>
                  <Label htmlFor="currentlyPursuing">
                    What are you currently pursuing? <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Input
                    id="currentlyPursuing"
                    value={currentContext}
                    onChange={(e) => setCurrentContext(e.target.value)}
                    placeholder="e.g. B.Tech CSE 3rd year + campus club lead"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Any extra context — internships, part-time work, roles, courses.
                  </p>
                </div>
              </div>

              {(resolvedDegree || year) && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-emerald-700">Your starting point:</span>
                  <span className="font-medium">
                    {resolvedDegree || "—"}
                    {resolvedSpecialization ? ` / ${resolvedSpecialization}` : ""}
                    {year ? ` · ${year}` : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Target Career ──────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label>Target career</Label>
                  <span className="text-xs font-medium text-slate-400">
                    {roles.length} selected{roles.length > 0 ? ` · primary: ${roles[0]}` : ""}
                  </span>
                </div>
                <p className="mb-3 text-xs text-slate-400">
                  Pick one or more — the first becomes your <strong>primary goal</strong>. Your AI skill assessment,
                  roadmap, readiness score and recommendations all center on it.
                </p>
                {!degree ? (
                  <p className="text-sm text-slate-400">Select a degree first to see matching careers.</p>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={careerQuery}
                        onChange={(e) => setCareerQuery(e.target.value)}
                        placeholder="Search careers — e.g. data, AI, security..."
                        className="pl-9"
                      />
                    </div>
                    {roleOptions.length === 0 && !careerQueryLower ? (
                      <p className="mb-3 text-sm text-slate-400">
                        No predefined careers for your field — add a career manually below and our AI will analyse it.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.length > 0 && !careerQueryLower && (
                        <p className="mb-1 w-full text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Offered for your {degree} · sorted by demand
                        </p>
                      )}
                      {orderedRoleOptions.map((r) => {
                        const market = CAREER_MARKET[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleRole(r)}
                            aria-pressed={roles.includes(r)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                              roles.includes(r)
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                                : "border-slate-300 text-slate-600 hover:border-slate-400"
                            )}
                          >
                            {market && (
                              <span
                                className={cn("h-1.5 w-1.5 rounded-full", DEMAND_DOT[market.demand] ?? "bg-slate-300")}
                              />
                            )}
                            {r}
                          </button>
                        );
                      })}
                      {visibleCustomRoles.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggle(roles, setRoles, r)}
                          aria-pressed
                          className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm"
                        >
                          {r}
                          <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            Custom
                          </span>
                        </button>
                      ))}
                      {orderedRoleOptions.length === 0 && visibleCustomRoles.length === 0 && careerQueryLower && (
                        <p className="text-sm text-slate-400">No careers match “{careerQuery}”. Try another word — or add it below.</p>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Input
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRole();
                      }
                    }}
                    placeholder="Add a career not listed — e.g. Sports Analyst, Writer"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomRole} className="shrink-0">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  No career is too niche — our AI researches your custom choice and personalises everything to it.
                </p>

                {primaryRole && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {primaryBlurb ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-indigo-600" />
                            <p className="text-sm font-bold text-slate-800">About {primaryRole}</p>
                          </div>
                          {primaryMarket && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                DEMAND_BADGE[primaryMarket.demand] ?? "bg-slate-200 text-slate-600"
                              )}
                            >
                              {primaryMarket.demand} demand
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{primaryBlurb.what}</p>

                        {primaryMarket && (
                          <>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <IndianRupee className="h-3.5 w-3.5" /> Entry salary
                                </div>
                                <p className="mt-1 text-sm font-bold text-slate-800">{primaryMarket.salary}</p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <TrendingUp className="h-3.5 w-3.5" /> Market outlook
                                </div>
                                <p className="mt-1 text-sm font-bold text-slate-800">{primaryMarket.demand}</p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-surface px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <Route className="h-3.5 w-3.5" /> Growth path
                                </div>
                                <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-800">
                                  {primaryMarket.trajectory}
                                </p>
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                              <span className="font-semibold uppercase tracking-wide text-slate-500">Common first roles: </span>
                              {primaryMarket.jobTitles.join(" · ")}
                            </p>
                          </>
                        )}

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Skills employers expect
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {primaryBlurb.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md border border-slate-200 bg-surface px-2 py-1 text-xs font-medium text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">Custom career: {primaryRole}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            Not in our career database — our AI will analyse it and estimate its salary, demand and
                            skills, then build your assessment, skill grading, roadmap and readiness score around it.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {comparison.length > 1 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      How your picks stack up
                    </p>
                    <div className="mt-2 divide-y divide-slate-100">
                      {comparison.map((c, idx) => (
                        <div
                          key={c.role + idx}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5",
                            idx === 0 ? "bg-indigo-50/60" : ""
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {c.role}
                              {idx === 0 && (
                                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                                  Primary
                                </span>
                              )}
                            </p>
                          </div>
                          {c.custom ? (
                            <p className="shrink-0 text-xs text-slate-400">AI will estimate market data</p>
                          ) : (
                            <div className="flex shrink-0 items-center gap-4 text-xs">
                              <span className="text-slate-500">{c.salary}</span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 font-bold uppercase tracking-wide",
                                  DEMAND_BADGE[c.demand ?? ""] ?? "bg-slate-200 text-slate-600"
                                )}
                              >
                                {c.demand}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="px-4 py-2.5 text-[11px] text-slate-400">
                      Salaries are entry-level estimates for India. Your AI report will refine this for your city and
                      skill level.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label>Industry of choice</Label>
                  <span className="text-xs font-medium text-slate-400">{industries.length} selected</span>
                </div>
                <p className="mb-3 text-xs text-slate-400">
                  Where you want to build your career. Optional — pick any, or add your own.
                </p>
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
                  {industries.filter((i) => !KNOWN_INDUSTRIES.includes(i)).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle(industries, setIndustries, i)}
                      aria-pressed
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
                    >
                      {i}
                      <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        Custom
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomIndustry();
                      }
                    }}
                    placeholder="Add your own industry — e.g. Space Tech, AgriTech"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomIndustry} className="shrink-0">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label>
                    Interests <span className="font-normal text-slate-400">(optional — pick any)</span>
                  </Label>
                  <span className="text-xs font-medium text-slate-400">{interests.length} selected</span>
                </div>
                <p className="mb-3 text-xs text-slate-400">
                  {suggestedInterests.length > 0
                    ? `Suggested from your specialization + career automatically. Uncheck or add your own.`
                    : "Pick what excites you — suggestions appear once you select careers."}
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
                  {interests.filter((i) => !KNOWN_INTERESTS.includes(i) && !suggestedInterests.includes(i)).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle(interests, setInterests, i)}
                      aria-pressed
                      className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
                    >
                      {i}
                      <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        Custom
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                    placeholder="Add an interest — e.g. Freelancing, Neuroscience"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomInterest} className="shrink-0">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Availability & Review ──────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in-up">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dailyHours">Daily hours you can invest</Label>
                  <Input
                    id="dailyHours"
                    name="dailyHours"
                    type="number"
                    min={1}
                    max={24}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Math.max(1, Math.min(24, Number(e.target.value) || 0)))}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Used to size your weekly plan, roadmap pace and task load. {dailyHours}h/day ≈{" "}
                    <strong>{dailyHours * 7}h/week</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-700">Review your Career OS profile</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Now pursuing</dt>
                    <dd className="font-medium text-slate-800 text-right">
                      {resolvedDegree || "—"}
                      {resolvedSpecialization ? ` / ${resolvedSpecialization}` : ""}
                      {year ? ` · ${year}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Target career</dt>
                    <dd className="font-medium text-slate-800 text-right">{roles.map((r) => r).join(", ") || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Industry</dt>
                    <dd className="font-medium text-slate-800 text-right">{industries.join(", ") || "Any"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Interests</dt>
                    <dd className="font-medium text-slate-800 text-right">{interests.join(", ") || "None yet (optional)"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Daily availability</dt>
                    <dd className="font-medium text-slate-800">{dailyHours} hours/day</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4">
                <p className="text-sm font-semibold text-indigo-700">Next up: your AI skill assessment</p>
                <p className="mt-1 text-sm text-slate-600">
                  No manual skill entry. We&apos;ll ask adaptive questions and grade your skills (1–5) against your
                  target career, then build your roadmap and readiness score.
                </p>
              </div>
            </div>
          )}

          <input type="hidden" name="degree" value={resolvedDegree} />
          <input type="hidden" name="specialization" value={resolvedSpecialization} />
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="currentlyPursuing" value={currentContext} />
          <input type="hidden" name="interests" value={JSON.stringify(interests)} />
          <input type="hidden" name="industries" value={JSON.stringify(industries)} />
          <input type="hidden" name="targetRoles" value={JSON.stringify(roles)} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 px-5 py-4">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={back}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <span className="text-xs text-slate-400">Fields marked required shape your plan.</span>
            )}

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                {pending ? "Building your plan..." : "Save & start assessment"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}