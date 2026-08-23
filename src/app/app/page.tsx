import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, ListTodo, TrendingUp, Sparkles, Target, Map, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { computeReadiness, readinessLabel } from "@/lib/scoring/readiness";
import { bumpStreak, ensureDailyTasks } from "@/lib/engine/tasks";
import { READINESS_DIMENSIONS, CATEGORY_LABELS } from "@/lib/constants";
import { fromJson, formatDate, weekLabel } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { changePathAction } from "@/server/actions/onboarding";

export const dynamic = "force-dynamic";

function currentRoadmapWeek(createdAt: Date, totalWeeks: number) {
  const now = Date.now();
  const week = Math.floor((now - createdAt.getTime()) / 86400000 / 7) + 1;
  return Math.min(totalWeeks, Math.max(1, week));
}

export default async function OverviewPage() {
  const { profile } = await requireStudentProfile();

  if (!profile.onboardedAt) redirect("/app/assessment");

  const [readiness, tasks, latestReport, notifications, roadmap, progressAttempts] = await Promise.all([
    computeReadiness(prisma, profile.id),
    ensureDailyTasks(prisma, profile.id),
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
  ]);

  const streak = await bumpStreak(prisma, profile.id);

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const completedToday = tasks.filter((t) => t.status === "COMPLETED").length;
  const readinessMeta = readinessLabel(readiness.total);

  const lastTest = progressAttempts[0];
  const prevTest = progressAttempts[1];
  const testTrend =
    lastTest && prevTest ? Math.round((lastTest.score / lastTest.maxScore) * 100) - Math.round((prevTest.score / prevTest.maxScore) * 100) : null;
  const testDue = profile.nextProgressTestDueAt;
  const testOverdue = testDue && testDue < new Date() ? true : false;

  const currentWeek = roadmap ? currentRoadmapWeek(roadmap.createdAt, roadmap.totalWeeks) : 0;
  const weekItems = roadmap ? roadmap.items.filter((i) => i.weekNumber === currentWeek) : [];
  const weekCompleted = weekItems.filter((i) => i.status === "COMPLETED").length;
  const weekPct = weekItems.length > 0 ? Math.round((weekCompleted / weekItems.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">
            {profile.targetRole ? (
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                Target role: <span className="font-semibold text-slate-700">{profile.targetRole}</span>
              </span>
            ) : "Complete onboarding to set your goal."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={changePathAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-slate-500 hover:text-amber-600 hover:bg-amber-50">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Change path
            </Button>
          </form>
          <Link href="/app/tasks">
            <Button variant="gradient" size="sm" className="group">
              <ListTodo className="h-4 w-4" /> Open today&apos;s tasks
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-in-up delay-75 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Readiness Score</p>
            <p className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{readiness.total}/100</p>
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

        <Card className="animate-fade-in-up delay-100 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today&apos;s tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{pendingCount}</p>
            <p className="mt-1 text-xs text-slate-400">
              <span className="font-semibold text-emerald-600">{completedToday}</span> completed today
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-150 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Streak</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-orange-500">
              <span className="animate-bounce-gentle inline-block">🔥</span>
              {streak} day{streak === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Best <span className="font-semibold text-slate-600">{profile.bestStreak}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up delay-200 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roadmap week</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {roadmap ? currentRoadmapWeek(roadmap.createdAt, roadmap.totalWeeks) : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              of <span className="font-semibold text-slate-600">{roadmap?.totalWeeks ?? 12}</span> weeks
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 animate-fade-in-up delay-200 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Week {currentWeek} progress
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{weekPct}%</p>
                <p className="mt-1 text-xs text-slate-400">
                  {weekCompleted}/{weekItems.length} milestones this week
                </p>
              </div>
              <div className="text-right">
                <Map className="h-8 w-8 text-indigo-300" />
              </div>
            </div>
            <Progress value={weekPct} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <Link href="/app/progress-test" className="block group">
        <Card
          className={`overflow-hidden transition-all hover:shadow-md animate-fade-in-up ${
            testOverdue ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50" : "border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50"
          }`}
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  testOverdue ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">
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
                      <span className="font-bold text-slate-800">
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
                  <CalendarCheck className="h-4 w-4 text-emerald-500" />
                  Today&apos;s plan
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
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition-all hover:border-indigo-100 hover:bg-indigo-50/30 animate-fade-in-up"
                    style={{ animationDelay: `${350 + i * 50}ms` }}
                  >
                    <div className="flex items-center gap-2.5">
                      {t.status === "COMPLETED" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">✓</span>
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
                    <CalendarCheck className="h-4 w-4" />
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
                      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-4 py-3">
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
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.length === 0 && (
                  <p className="text-sm text-slate-500">No notifications yet.</p>
                )}
                {notifications.map((n, i) => (
                  <Link key={n.id} href="/app/notifications" className="block rounded-xl border border-slate-100 px-3 py-2.5 transition-all hover:border-indigo-100 hover:bg-indigo-50/30 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
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
