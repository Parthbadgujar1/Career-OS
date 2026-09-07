import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { markRoadmapItemCompleteAction } from "@/server/actions/tasks";
import { activeRoadmapWeek } from "@/lib/engine/tasks";
import {
  CATEGORY_LABELS,
  durationLabel,
  academicYearsForDegree,
  remainingAcademicYears,
  recommendedRoadmapWeeks,
  WEEKS_PER_YEAR,
} from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapPlanner } from "@/components/app/roadmap-planner";
import { ResourceLinks, type ResourceLinkData } from "@/components/app/resource-links";
import Link from "next/link";
import {
  Mic, GraduationCap, ChevronDown, CalendarClock, BookOpenText,
  RefreshCw, Target, TrendingUp, CheckCircle2, ListTodo, Sparkles,
  Trophy, ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

function itemsToResources(raw: unknown): ResourceLinkData[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is ResourceLinkData => !!r && typeof (r as ResourceLinkData).url === "string");
}

function yearForWeek(item: { academicYear: number | null; weekNumber: number }): number {
  return item.academicYear ?? Math.max(1, Math.ceil(item.weekNumber / WEEKS_PER_YEAR));
}

export default async function RoadmapPage() {
  const { profile } = await requireStudentProfile();
  const roadmap = await prisma.roadmap.findUnique({
    where: { studentId: profile.id },
    include: { items: { orderBy: [{ weekNumber: "asc" }, { order: "asc" }] } },
  });

  const recommended = recommendedRoadmapWeeks(profile.year, profile.degree);
  const maxWeeks = remainingAcademicYears(profile.year, profile.degree) * WEEKS_PER_YEAR;
  const totalYears = academicYearsForDegree(profile.degree);
  const yearHint =
    remainingAcademicYears(profile.year, profile.degree) > 1
      ? `You're in ${profile.year ?? "your current year"} of a ${totalYears}-year ${profile.degree ?? "degree"}. Recommended: a ${remainingAcademicYears(profile.year, profile.degree)}-academic-year plan (${recommended} weeks) so each year builds toward ${profile.targetRole ?? "your goal"}.`
      : `You're in the final stretch of your ${profile.degree ?? "degree"}${profile.targetRole ? ` targeting ${profile.targetRole}` : ""}. Recommended: a focused ${recommended}-week plan.`;

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Target className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Build Your Roadmap</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Career OS will build a week-by-week plan for the rest of your college journey — with free resources inside every week.
          </p>
        </div>
        <RoadmapPlanner recommendedWeeks={recommended} maxWeeks={maxWeeks} yearHint={yearHint} />
      </div>
    );
  }

  const activeWeek = activeRoadmapWeek(roadmap.items);
  const week = activeWeek ?? roadmap.totalWeeks;
  const roadmapComplete = activeWeek === null;

  const yearGroups = new Map<number, typeof roadmap.items>();
  for (const item of roadmap.items) {
    const y = yearForWeek(item);
    if (!yearGroups.has(y)) yearGroups.set(y, []);
    yearGroups.get(y)!.push(item);
  }
  const currentItem = roadmap.items.find((i) => i.weekNumber === week);
  const currentYear = currentItem ? yearForWeek(currentItem) : (roadmapComplete ? totalYears : 1);

  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter((i) => i.status === "COMPLETED").length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isMultiYear = roadmap.totalWeeks > WEEKS_PER_YEAR;
  const numYears = Math.round(roadmap.totalWeeks / WEEKS_PER_YEAR);

  const plannerProps = { currentWeeks: roadmap.totalWeeks, recommendedWeeks: recommended, maxWeeks, yearHint };

  // Build year status map: "completed" | "current" | "upcoming"
  const yearEntries = Array.from(yearGroups.entries()).sort((a, b) => a[0] - b[0]);
  const yearStatusMap = new Map<number, "completed" | "current" | "upcoming">();
  for (const [year, items] of yearEntries) {
    const allDone = items.every((i) => i.status === "COMPLETED");
    if (allDone) yearStatusMap.set(year, "completed");
    else if (year === currentYear) yearStatusMap.set(year, "current");
    else yearStatusMap.set(year, "upcoming");
  }

  // Find the most recently completed year (for celebration banner)
  const completedYears = yearEntries
    .filter(([, items]) => items.every((i) => i.status === "COMPLETED"))
    .map(([y]) => y);
  const latestCompletedYear = completedYears.length > 0 ? Math.max(...completedYears) : null;
  // Show celebration if the latest completed year has items and there's a next year
  const celebrationYear = latestCompletedYear && latestCompletedYear < numYears ? latestCompletedYear : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ─── Hero ─── */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Your Roadmap</p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-slate-900">
            {profile.targetRole ?? "Career Seeker"}
            <span className="text-slate-300">.</span>
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarClock className="h-3.5 w-3.5 text-indigo-400" />
            {durationLabel(roadmap.totalWeeks)}
            {isMultiYear ? ` · ${numYears} academic years` : ""}
            {" · "}
            {roadmapComplete ? (
              <span className="font-semibold text-emerald-600">complete</span>
            ) : (
              <>week <span className="font-semibold text-slate-700">{Math.min(week, roadmap.totalWeeks)}</span> of {roadmap.totalWeeks}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/interviews">
            <Button variant="outline" size="sm" className="group">
              <Mic className="h-3.5 w-3.5 mr-1.5" />
              Mock interview
            </Button>
          </Link>
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600 select-none">
              <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              Change plan
              <ChevronDown className="h-3.5 w-3.5 text-slate-300 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3">
              <RoadmapPlanner {...plannerProps} variant="inline" />
            </div>
          </details>
        </div>
      </div>

      {/* ─── Year Stepper (multi-year only) ─── */}
      {isMultiYear && (
        <div className="animate-fade-in-up delay-50">
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {yearEntries.map(([year, items], idx) => {
              const status = yearStatusMap.get(year) ?? "upcoming";
              const yearDone = items.filter((i) => i.status === "COMPLETED").length;
              const yearPct = Math.round((yearDone / items.length) * 100);
              const isLast = idx === yearEntries.length - 1;

              return (
                <div key={year} className="flex items-center">
                  {/* Node */}
                  <div className={`flex flex-col items-center gap-1.5 ${!isLast ? "min-w-[100px]" : ""}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      status === "completed"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                        : status === "current"
                          ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/15"
                          : "bg-slate-100 text-slate-400"
                    }`}>
                      {status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span>{year}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold ${
                        status === "current" ? "text-indigo-600" : status === "completed" ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        Year {year}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {status === "completed" ? "Complete" : `${yearPct}% done`}
                      </p>
                    </div>
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`mx-1 h-0.5 flex-1 min-w-[32px] rounded-full ${
                      (yearStatusMap.get(year) === "completed" && (yearStatusMap.get(year + 1) === "completed" || yearStatusMap.get(year + 1) === "current"))
                        ? "bg-emerald-400"
                        : yearStatusMap.get(year) === "completed" && yearStatusMap.get(year + 1) === "current"
                          ? "bg-gradient-to-r from-emerald-400 to-indigo-400"
                          : "bg-slate-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Year Complete Celebration Banner ─── */}
      {celebrationYear && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 animate-fade-in-up delay-75">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg font-semibold text-emerald-800">
                Year {celebrationYear} Complete!
              </h3>
              <p className="text-sm text-emerald-600">
                {completedItems} milestones done across Year {celebrationYear}.
                {celebrationYear < numYears && (
                  <> Moving to <span className="font-semibold">Year {celebrationYear + 1}</span> — let&apos;s keep the momentum.</>
                )}
              </p>
            </div>
            {celebrationYear < numYears && (
              <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-700">
                Year {celebrationYear + 1}
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Stats strip ─── */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up delay-75">
        <Card className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500" />
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</p>
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
              {progress}<span className="ml-1 text-base font-sans text-slate-400">%</span>
            </p>
            <Progress value={progress} className="mt-2" />
            <p className="mt-1.5 text-[11px] text-slate-400">{completedItems} of {totalItems} milestones done</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500" />
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current week</p>
              <ListTodo className="h-3.5 w-3.5 text-cyan-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
              {roadmapComplete ? "—" : week}
              <span className="ml-1 text-base font-sans text-slate-400">/{roadmap.totalWeeks}</span>
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {roadmapComplete ? "All weeks completed" : `Year ${currentYear}${isMultiYear ? ` of ${numYears}` : ""}`}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Milestones</p>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
              {completedItems}<span className="ml-1 text-base font-sans text-slate-400">/{totalItems}</span>
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {totalItems - completedItems > 0 ? `${totalItems - completedItems} remaining` : "All done!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── AI summary ─── */}
      {roadmap.aiSummary && (
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 animate-fade-in-up delay-100">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <p className="text-sm text-indigo-700">{roadmap.aiSummary}</p>
        </div>
      )}

      {/* ─── Year sections ─── */}
      <div className="space-y-6">
        {yearEntries.map(([year, items]) => {
          const status = yearStatusMap.get(year) ?? "upcoming";
          const yearDone = items.filter((i) => i.status === "COMPLETED").length;
          const yearPct = Math.round((yearDone / items.length) * 100);
          const firstWeek = items[0].weekNumber;
          const lastWeek = items[items.length - 1].weekNumber;
          const pendingItems = items.filter((i) => i.status !== "COMPLETED");
          const doneItems = items.filter((i) => i.status === "COMPLETED");
          const isYearComplete = status === "completed";
          const isCurrent = status === "current";

          return (
            <section key={year} className="animate-fade-in-up" style={{ animationDelay: `${150 + year * 80}ms` }}>
              {/* Year header */}
              <div className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all ${
                isCurrent
                  ? "border-indigo-200 bg-indigo-50/40 shadow-indigo-500/5"
                  : isYearComplete
                    ? "border-emerald-200/60 bg-emerald-50/20"
                    : "border-slate-200 bg-surface"
              }`}>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isCurrent
                    ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20"
                    : isYearComplete
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                }`}>
                  {isYearComplete ? <CheckCircle2 className="h-5 w-5" /> : year}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-slate-900">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    Year {year}
                    {isMultiYear ? ` of ${numYears}` : ""}
                    {isCurrent && <Badge variant="indigo" className="ml-1">Current</Badge>}
                    {isYearComplete && <Badge variant="success" className="ml-1">Complete</Badge>}
                  </h2>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> Weeks {firstWeek}–{lastWeek}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpenText className="h-3 w-3" /> {items.length} milestones
                    </span>
                  </p>
                </div>
                <div className="w-32 sm:w-40">
                  <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>{yearDone}/{items.length} done</span>
                    <span>{yearPct}%</span>
                  </div>
                  <Progress value={yearPct} className={isYearComplete ? "[&>div]:bg-emerald-500" : ""} />
                </div>
              </div>

              {/* Weekly plan */}
              <details className="group mt-2" open={isCurrent}>
                <summary className="flex cursor-pointer items-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 select-none">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  {isYearComplete
                    ? `Year ${year} completed — all ${items.length} milestones done`
                    : isCurrent
                      ? "This year's weekly plan"
                      : "Open weekly plan"
                  }
                </summary>
                <div className="space-y-1.5">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-surface p-3 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md hover:bg-indigo-50/20"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                            Wk {item.weekNumber}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-slate-800">{item.title}</p>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                        )}
                        <ResourceLinks resources={itemsToResources(item.resources)} />
                      </div>
                      <form action={markRoadmapItemCompleteAction.bind(null, item.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="shrink-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  ))}

                  {doneItems.length > 0 && (
                    <details className="group/done mt-2">
                      <summary className="flex cursor-pointer items-center gap-1.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-500 select-none">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Completed ({doneItems.length})
                        <ChevronDown className="h-3 w-3 transition-transform group-open/done:rotate-180" />
                      </summary>
                      <div className="mt-1 space-y-1">
                        {doneItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-surface/60 px-3 py-2"
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[8px] font-bold">✓</span>
                            <p className="text-xs text-slate-400 line-through truncate">{item.title}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
