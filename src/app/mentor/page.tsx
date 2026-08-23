import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Activity, Award, Sparkles } from "lucide-react";
import { MentorStudentsPanel, type MentorStudentRow } from "@/components/mentor/mentor-students-panel";
import { MentorAiInsights } from "@/components/mentor/mentor-ai-insights";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  const mentor = await requireMentor();

  const [studentsData, completedTasks, submissions, participations, interviews] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { mentorId: mentor.id },
      include: {
        user: { select: { name: true, email: true } },
        weeklyReports: { orderBy: { weekEnd: "desc" }, take: 1 },
        skills: { include: { skill: true } },
        _count: {
          select: {
            tasks: { where: { status: "PENDING" } },
            projects: true,
            assessments: true,
          },
        },
      },
      orderBy: { readinessScore: "asc" },
    }),
    prisma.task.findMany({
      where: { student: { mentorId: mentor.id }, status: "COMPLETED" },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { completedAt: "desc" },
      take: 6,
    }),
    prisma.codingSubmission.findMany({
      where: { student: { mentorId: mentor.id } },
      include: { student: { include: { user: { select: { name: true } } } }, problem: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.eventParticipation.findMany({
      where: { student: { mentorId: mentor.id } },
      include: { student: { include: { user: { select: { name: true } } } }, event: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.mockInterview.findMany({
      where: { student: { mentorId: mentor.id } },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  type FeedItem = { id: string; time: Date; text: string; kind: string };
  const feed: FeedItem[] = [
    ...completedTasks.map((t) => ({
      id: `task-${t.id}`,
      time: t.completedAt ?? t.createdAt,
      text: `${t.student.user?.name ?? "A student"} completed task: ${t.title}`,
      kind: "Task",
    })),
    ...submissions.map((s) => ({
      id: `code-${s.id}`,
      time: s.createdAt,
      text: `${s.student.user?.name ?? "A student"} ${s.status === "SOLVED" ? "solved" : "attempted"} ${s.problem.title}`,
      kind: "Coding",
    })),
    ...participations.map((p) => ({
      id: `event-${p.id}`,
      time: p.createdAt,
      text: `${p.student.user?.name ?? "A student"} registered for ${p.event.title}`,
      kind: "Event",
    })),
    ...interviews.map((i) => ({
      id: `interview-${i.id}`,
      time: i.createdAt,
      text: `${i.student.user?.name ?? "A student"} completed a ${i.type} mock interview`,
      kind: "Interview",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  const avgReadiness = studentsData.length
    ? Math.round(studentsData.reduce((s, p) => s + p.readinessScore, 0) / studentsData.length)
    : 0;
  const completionRates = studentsData
    .map((s) => s.weeklyReports[0]?.completionRate)
    .filter((v): v is number => v != null);
  const avgCompletion = completionRates.length
    ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
    : 0;
  const avgStreak = studentsData.length
    ? Math.round(studentsData.reduce((s, p) => s + p.currentStreak, 0) / studentsData.length)
    : 0;
  const needsSupport = studentsData.filter(
    (s) => s.readinessScore < 60 || (s.weeklyReports[0]?.completionRate ?? 100) < 50
  ).length;

  const gapCounts = new Map<string, number>();
  for (const s of studentsData) {
    for (const sk of s.skills) {
      if (sk.selfRating <= 2) {
        gapCounts.set(sk.skill.name, (gapCounts.get(sk.skill.name) ?? 0) + 1);
      }
    }
  }
  const topGaps = [...gapCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const rows: MentorStudentRow[] = studentsData.map((s) => ({
    id: s.id,
    name: s.user?.name ?? "Student",
    email: s.user?.email ?? "",
    targetRole: s.targetRole,
    readinessScore: s.readinessScore,
    currentStreak: s.currentStreak,
    onboarded: !!s.onboardedAt,
    completionRate: s.weeklyReports[0]?.completionRate ?? null,
    weakSkills: s.skills.filter((sk) => sk.selfRating <= 2).map((sk) => sk.skill.name),
    pendingTasks: s._count.tasks,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              Career OS <span className="font-normal text-slate-400">· Mentor Dashboard</span>
            </p>
            <p className="text-xs text-slate-500">Welcome back, {mentor.name || mentor.email}</p>
          </div>
          <Badge variant="secondary">Live student data</Badge>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-6 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <p className="text-sm text-slate-500">
            Your {studentsData.length} assigned students · avg readiness {avgReadiness}/100
          </p>
        </div>

        {/* Mentor KPIs */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Total Mentees</p>
              <p className="mt-1 text-3xl font-bold">{studentsData.length}</p>
              <p className="mt-1 text-xs text-slate-400">
                {studentsData.filter((s) => s.onboardedAt).length} onboarded
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Avg. Readiness</p>
              <p className="mt-1 text-3xl font-bold text-indigo-600">{avgReadiness}/100</p>
              <Progress value={avgReadiness} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Avg. Completion</p>
              <p className="mt-1 text-3xl font-bold">{avgCompletion}%</p>
              <Progress value={avgCompletion} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">At Risk</p>
              <p className="mt-1 text-3xl font-bold text-amber-600">{needsSupport}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">Avg. Streak</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{avgStreak} days</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Cohort Insights */}
        <Suspense fallback={
          <Card className="animate-pulse border-indigo-50 bg-indigo-50/10">
            <CardContent className="h-48 flex items-center justify-center text-sm text-indigo-400 font-medium">
              <Sparkles className="h-5 w-5 animate-spin mr-2" /> Loading cohort AI insights...
            </CardContent>
          </Card>
        }>
          <MentorAiInsights students={rows} />
        </Suspense>

        {/* Intervention list + All Mentees (live search/filter/feedback) */}
        <Card id="mentees" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Mentees & Interventions</CardTitle>
            <CardDescription>Search, filter, and send feedback that students see instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <MentorStudentsPanel students={rows} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gaps Across Mentees</CardTitle>
              <CardDescription>Skills needing attention (rated ≤2/5)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGaps.length === 0 && <p className="text-sm text-slate-500">No weak skills recorded yet.</p>}
              {topGaps.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="text-sm text-slate-700">{name}</span>
                  <Badge variant="secondary">
                    {count} student{count > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card id="activity" className="scroll-mt-24">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>The latest actions across your mentees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feed.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No activity yet.</p>}
              {feed.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.text}</p>
                    <p className="text-xs text-slate-400">
                      {item.kind} · {new Date(item.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {studentsData.filter((s) => s.readinessScore >= 70).length > 0 && (
          <Card id="on-track" className="scroll-mt-24">
            <CardHeader>
              <CardTitle>On-Track Students</CardTitle>
              <CardDescription>Readiness ≥ 70</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {studentsData
                .filter((s) => s.readinessScore >= 70)
                .map((s) => (
                  <div key={s.id} className="rounded-lg border border-emerald-100 p-3 bg-emerald-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.user?.name ?? "Student"}</p>
                        <p className="text-xs text-slate-500">{s.targetRole ?? "—"}</p>
                      </div>
                      <Badge variant="success">
                        <Award className="h-3 w-3 mr-1" />
                        {s.readinessScore}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={s.readinessScore} className="h-1.5" />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
