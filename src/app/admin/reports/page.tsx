import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Users, Award, Code2, ClipboardCheck, Mic2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin();

  const [students, tasks, codingSolved, quizzes, assessments, interviews, skillRatings] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { readinessScore: "desc" },
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.codingSubmission.count({ where: { status: "SOLVED" } }),
    prisma.quizResult.count(),
    prisma.assessment.count(),
    prisma.mockInterview.count(),
    prisma.studentSkill.findMany({
      where: { selfRating: { lte: 2 } },
      include: { skill: true },
    }),
  ]);

  const totalTasks = tasks.reduce((a, t) => a + t._count._all, 0);
  const completedTasks = tasks.find((t) => t.status === "COMPLETED")?._count._all ?? 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const gapCounts = new Map<string, number>();
  for (const s of skillRatings) {
    gapCounts.set(s.skill.name, (gapCounts.get(s.skill.name) ?? 0) + 1);
  }
  const topGaps = [...gapCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  const avgReadiness = students.length
    ? Math.round(students.reduce((a, s) => a + s.readinessScore, 0) / students.length)
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-sm text-slate-500">Aggregated from every student&apos;s live activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-5">
            <Users className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold">{students.length}</p>
            <p className="text-xs text-slate-400">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Award className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold text-indigo-600">{avgReadiness}</p>
            <p className="text-xs text-slate-400">Avg readiness</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold">{completionRate}%</p>
            <p className="text-xs text-slate-400">Task completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Code2 className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold">{codingSolved}</p>
            <p className="text-xs text-slate-400">Coding solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <ClipboardCheck className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold">{assessments + quizzes}</p>
            <p className="text-xs text-slate-400">Assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Mic2 className="h-4 w-4 text-slate-400" />
            <p className="mt-1 text-3xl font-bold">{interviews}</p>
            <p className="text-xs text-slate-400">Mock interviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Students by Readiness</CardTitle>
            <CardDescription>Sorted by the live readiness score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.slice(0, 8).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-medium text-slate-400">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.user.name ?? "Student"}</p>
                  <p className="text-xs text-slate-400 truncate">{s.user.email}</p>
                </div>
                <Progress value={s.readinessScore} className="w-24 h-2" />
                <Badge variant={s.readinessScore >= 70 ? "success" : s.readinessScore >= 40 ? "warning" : "secondary"}>
                  {s.readinessScore}/100
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak Skills Across Students</CardTitle>
            <CardDescription>Skills rated ≤2/5 by students, most common first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
      </div>
    </div>
  );
}
