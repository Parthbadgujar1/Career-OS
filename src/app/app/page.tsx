import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Brain, CalendarCheck, CalendarDays, ChevronRight, Flame, Layers, ListTodo, Map, RefreshCw, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { computeReadiness, readinessLabel } from "@/lib/scoring/readiness";
import { bumpStreak, ensureWeeklyTasks, activeRoadmapWeek } from "@/lib/engine/tasks";
import { READINESS_DIMENSIONS, CATEGORY_LABELS } from "@/lib/constants";
import { fromJson, formatDate, weekLabel } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { changePathAction } from "@/server/actions/onboarding";
import { restartAssessmentAction } from "@/server/actions/skills-assessment";

export const dynamic = "force-dynamic";

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default async function OverviewPage() {
  const { user, profile } = await requireStudentProfile();

  if (!profile.onboardedAt) redirect("/app/assessment");

  const [readiness, tasks, latestReport, notifications, roadmap, progressAttempts, skillCount] = await Promise.all([
    computeReadiness(prisma, profile.id),
    ensureWeeklyTasks(prisma, profile.id),
    prisma.weeklyReport.findFirst({
      where: { studentId: profile.id },
      orderBy: { weekEnd: "desc" },
    }),
    prisma.notification.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.roadmap.findUnique({ where: { studentId: profile.id }, include: { items: true } }),
    prisma.progressTestAttempt.findMany({
      where: { studentId: profile.id },
      orderBy: { completedAt: "desc" },
      take: 2,
    }),
    prisma.studentSkill.count({ where: { studentId: profile.id } }),
  ]);

  const streak = await bumpStreak(prisma, profile.id);

  const pendingTasks = tasks.filter((t) => t.status === "PENDING").sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );
  const nextStep = pendingTasks[0];
  const completedThisWeek = tasks.filter((t) => t.status === "COMPLETED").length;
  const readinessMeta = readinessLabel(readiness.total);

  const lastTest = progressAttempts[0];
  const prevTest = progressAttempts[1];
  const testTrend =
    lastTest && prevTest ? Math.round((lastTest.score / lastTest.maxScore) * 100) - Math.round((prevTest.score / prevTest.maxScore) * 100) : null;
  const testDue = profile.nextProgressTestDueAt;
  const testOverdue = testDue && testDue < new Date() ? true : false;

  const currentWeek = roadmap ? (activeRoadmapWeek(roadmap.items) ?? roadmap.totalWeeks) : 0;
  const roadmapComplete = roadmap ? roadmap.items.length > 0 && activeRoadmapWeek(roadmap.items) === null : false;
  const weekItems = roadmap ? roadmap.items.filter((i) => i.weekNumber === currentWeek) : [];
  const weekCompleted = weekItems.filter((i) => i.status === "COMPLETED").length;
  const weekPct = weekItems.length > 0 ? Math.round((weekCompleted / weekItems.length) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (user.name || "there").trim().split(" ")[0] || "there";
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ─── Hero ─── */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">{todayLabel}</p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            {greeting}, {firstName}
            <span className="text-slate-300">.</span>
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Target className="h-3.5 w-3.5 text-indigo-500" />
            Heading toward{" "}
            <span className="font-semibold text-slate-700">{profile.targetRole || "your target role"}</span>
            {readinessMeta.label && (
              <>
                {" "}· <span className="capitalize">{readinessMeta.label.toLowerCase()}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={changePathAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-slate-500 hover:text-amber-700 hover:bg-amber-50">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Change path
            </Button>
          </form>
          <Link href="/app/tasks">
            <Button variant="default" size="sm" className="group">
              <ListTodo className="h-4 w-4" /> Open weekly plan
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Next step ─── */}
      <section className="animate-fade-in-up delay-75">
        <Link href="/app/tasks" className="group block">
          <Card className={cnCallout(nextStep ? false : true)}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5 pl-5">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    nextStep ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {nextStep ? <ChevronRight className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600">
                    {nextStep ? "Your next step" : "All caught up for now"}
                  </p>
                  {nextStep ? (
                    <>
                      <p className="mt-1 font-serif text-lg font-medium leading-snug text-slate-900">{nextStep.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_LABELS[nextStep.category as keyof typeof CATEGORY_LABELS] ?? nextStep.category}
                        </Badge>
                        {nextStep.priority === "HIGH" && <Badge variant="warning" className="text-[10px]">High priority</Badge>}
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      Nothing pending this week — open your weekly plan to plan ahead.
                    </p>
                  )}
                </div>
              </div>
              {nextStep && (
                <span className="flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Start now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* ─── Stat strip ─── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-in-up delay-100 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Readiness</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
              {readiness.total}
              <span className="ml-1 text-base font-sans text-slate-400">/100</span>
            </p>
            <Badge
              variant={
                readinessMeta.color === "emerald" || readinessMeta.color === "green"
                  ? "success"
                  : readinessMeta.color === "amber"
                    ? "warning"
                    : readinessMeta.color === "rose"
                      ? "danger"
                      : "secondary"
              }
              className="mt-2"
            >
              {readinessMeta.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-150 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks pending</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">{pendingTasks.length}</p>
            <p className="mt-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-600">{completedThisWeek}</span> completed this week
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-200 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-orange-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Streak</p>
              <Flame className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">{streak}</p>
            <p className="mt-2 text-xs text-slate-400">
              day{streak === 1 ? "" : "s"} · best <span className="font-semibold text-slate-600">{profile.bestStreak}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-300 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roadmap week</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
              {roadmap ? currentWeek : "—"}
              <span className="ml-1 text-base font-sans text-slate-400">
                /{roadmap?.totalWeeks ?? 12}
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-400">weeks into your journey</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Journey progress ─── */}
      <Card className="animate-fade-in-up delay-300 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Map className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Week {currentWeek} of {roadmap?.totalWeeks ?? 12}
                </p>
                <p className="mt-1 font-serif text-lg font-medium text-slate-900">
                  {roadmapComplete ? "Roadmap complete — fantastic work" : `${weekCompleted}/${weekItems.length} milestones done this week`}
                </p>
              </div>
            </div>
            <p className="font-serif text-3xl font-semibold text-slate-900">{roadmapComplete ? "100%" : `${weekPct}%`}</p>
          </div>
          <Progress value={weekPct} className="mt-4" />
        </CardContent>
      </Card>

      {/* ─── Progress test CTA ─── */}
      <Link href="/app/progress-test" className="block group">
        <Card
          className={`overflow-hidden transition-all hover:shadow-md animate-fade-in-up ${
            testOverdue ? "border-amber-300 bg-amber-50/60" : "border-slate-200 bg-surface"
          }`}
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  testOverdue ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {testOverdue
                    ? "Progress test is due — retest your readiness now"
                    : lastTest
                      ? "Ready for your next progress test"
                      : "Start your first progress test"}
                </p>
                <p className="text-xs text-slate-500">
                  {testDue
                    ? `${testOverdue ? "Was due" : "Due"} ${formatDate(testDue)} · 30 timed questions · auto-graded`
                    : "30 timed questions · auto-graded · re-measures your readiness"}
                  {lastTest
                    ? ` · Last score ${Math.round((lastTest.score / lastTest.maxScore) * 100)}/100${
                        testTrend !== null ? (testTrend >= 0 ? ` (+${testTrend})` : ` (${testTrend})`) : ""
                      }`
                    : ""}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
              Take the test <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>

      {/* ─── AI skill assessment banner ─── */}
      <Card className="animate-fade-in-up delay-300 overflow-hidden border-slate-200 bg-surface">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5 pl-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Brain className="h-6 w-6" />
            </span>
            <div>
              <p className="font-serif text-lg font-medium text-slate-900">AI Skill Assessment</p>
              <p className="text-sm text-slate-500">
                {skillCount > 0
                  ? `${skillCount} skills graded by AI against "${profile.targetRole}" — your skill profile is live.`
                  : "Re-run the adaptive assessment to re-grade your skills against your target career."}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Link href="/app/skills" className="hidden items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors sm:flex">
              <Layers className="h-4 w-4" />
              Skill profile
            </Link>
            <form action={restartAssessmentAction}>
              <Button type="submit" variant="default" size="sm">
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                Check my readiness
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* ─── Lower sections ─── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Reveal variant="up">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Readiness breakdown
                  </CardTitle>
                  <Link href="/app/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Why this score?
                  </Link>
                </div>
                <CardDescription>Every point is evidence-based and explainable.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {READINESS_DIMENSIONS.map((dim, i) => (
                  <div key={dim.key} className="animate-fade-in-up" style={{ animationDelay: `${300 + i * 40}ms` }}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">{dim.label}</span>
                      <span className="font-semibold text-slate-800">
                        {readiness.dimensions[dim.key]}/100 <span className="text-xs text-slate-400">· {dim.weight}%</span>
                      </span>
                    </div>
                    <Progress value={readiness.dimensions[dim.key]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  This week&apos;s plan
                </CardTitle>
                <CardDescription>{weekLabel()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.length === 0 && (
                  <p className="text-sm text-slate-500">No tasks generated yet.</p>
                )}
                {tasks.slice(0, 5).map((t, i) => (
                  <Link
                    key={t.id}
                    href="/app/tasks"
                    className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2.5 transition-all hover:border-indigo-200 hover:bg-indigo-50/40 animate-fade-in-up"
                    style={{ animationDelay: `${350 + i * 50}ms` }}
                  >
                    <div className="flex items-center gap-2.5">
                      {t.status === "COMPLETED" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
                      ) : (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          t.priority === "HIGH" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {t.priority === "HIGH" ? "!" : "•"}
                        </span>
                      )}
                      <span
                        className={
                          t.status === "COMPLETED" ? "text-sm text-slate-400 line-through" : "text-sm font-medium text-slate-700"
                        }
                      >
                        {t.title}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS]}</Badge>
                  </Link>
                ))}
                <Link href="/app/tasks" className="flex items-center gap-1 pt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group">
                  Manage tasks <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal variant="right">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Latest weekly report
                </CardTitle>
              </CardHeader>
            <CardContent>
              {latestReport ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(latestReport.weekStart)} – {formatDate(latestReport.weekEnd)}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Completion: <span className="text-indigo-600">{latestReport.completionRate}%</span> ({latestReport.tasksCompleted}/{latestReport.tasksPlanned} tasks)
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {latestReport.aiNarrative ?? "No narrative generated."}
                  </p>
                  {(() => {
                    const priorities = fromJson<string[]>(latestReport.priorities, []);
                    if (priorities.length === 0) return null;
                    return (
                      <div className="rounded-xl bg-amber-50 border border-amber-200/70 px-4 py-3">
                        <p className="text-xs font-bold text-amber-700">Next week priorities</p>
                        <ul className="mt-1.5 list-inside list-disc text-xs leading-relaxed text-amber-700">
                          {priorities.slice(0, 3).map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No weekly report yet. Generate one at the end of your week.
                </p>
              )}
            </CardContent>
            </Card>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.length === 0 && (
                  <p className="text-sm text-slate-500">No notifications yet.</p>
                )}
                {notifications.map((n, i) => (
                  <Link key={n.id} href="/app/notifications" className="block rounded-lg border border-slate-200/70 px-3 py-2.5 transition-all hover:border-indigo-200 hover:bg-indigo-50/40 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                      <p className="text-sm font-semibold">{n.title}</p>
                    </div>
                    {n.body && <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.body}</p>}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function cnCallout(allCaughtUp: boolean) {
  return allCaughtUp
    ? "overflow-hidden border-slate-200 bg-surface"
    : "overflow-hidden border-amber-200/80 bg-amber-50/50";
}