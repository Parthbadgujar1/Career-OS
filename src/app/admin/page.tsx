import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Users, UserCheck, Award, ClipboardCheck, BarChart3, Briefcase, TrendingUp } from "lucide-react";
import { AdminStudentsTable } from "@/components/admin/admin-students-table";

function startOfToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export const dynamic = "force-dynamic";

const WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [students, tasksToday, reports, opportunityActions, mentorUsers] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        mentor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({
      where: {
        dueDate: {
          gte: startOfToday(),
          lt: endOfToday(),
        },
        status: "COMPLETED",
      },
    }),
    prisma.weeklyReport.aggregate({
      _avg: { completionRate: true },
    }),
    prisma.opportunityAction.groupBy({
      by: ["action"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: "MENTOR" },
      select: { id: true, name: true, _count: { select: { mentorStudents: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const onboarded = students.filter((s) => s.onboardedAt).length;
  const totalStudents = students.length;
  const avgReadiness = totalStudents
    ? Math.round(students.reduce((a, s) => a + s.readinessScore, 0) / totalStudents)
    : 0;
  const avgCompletion = Math.round(reports._avg.completionRate ?? 0);
  const readyStudents = students.filter((s) => s.readinessScore >= 70).length;
  const mentorsAssigned = students.filter((s) => s.mentorId).length;
  const mentorCoverage = totalStudents > 0 ? Math.round((mentorsAssigned / totalStudents) * 100) : 0;
  const activeStudents = students.filter((s) => {
    return s.lastActiveDate && new Date(s.lastActiveDate) > WEEK_AGO;
  }).length;

  const countAction = (action: string) =>
    opportunityActions.find((a) => a.action === action)?._count._all ?? 0;

  const pipeline = {
    viewed: countAction("VIEWED"),
    saved: countAction("SAVED"),
    applied: countAction("APPLIED"),
    completed: countAction("COMPLETED"),
  };

  const distribution = [
    { bucket: "0–20", count: 0, color: "#f43f5e" },
    { bucket: "21–40", count: 0, color: "#f59e0b" },
    { bucket: "41–60", count: 0, color: "#eab308" },
    { bucket: "61–80", count: 0, color: "#10b981" },
    { bucket: "81–100", count: 0, color: "#22c55e" },
  ];
  for (const s of students) {
    const v = s.readinessScore;
    const idx = v <= 20 ? 0 : v <= 40 ? 1 : v <= 60 ? 2 : v <= 80 ? 3 : 4;
    distribution[idx].count++;
  }
  const maxDistCount = Math.max(1, ...distribution.map((d) => d.count));

  const rows = students.map((s) => ({
    id: s.id,
    name: s.user.name ?? "—",
    email: s.user.email,
    targetRole: s.targetRole,
    readinessScore: s.readinessScore,
    mentorId: s.mentorId,
    mentorName: s.mentor?.name ?? null,
    onboardedAt: s.onboardedAt,
    createdAt: s.createdAt.toISOString(),
    createdLabel: s.createdAt.toLocaleDateString("en-US"),
  }));

  const mentors = mentorUsers.map((m) => ({
    id: m.id,
    name: m.name,
    assignedCount: m._count.mentorStudents,
  }));

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform analytics · signed in as {admin.email}</p>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Live platform data
        </Badge>
      </div>

      {/* Platform KPIs */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Students</p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{totalStudents}</p>
            <p className="mt-1 text-xs text-slate-400">{activeStudents} active (7d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Avg. Readiness</p>
              <Award className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{avgReadiness}/100</p>
            <Progress value={avgReadiness} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-slate-400">{readyStudents} ready (≥70)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Tasks Completed Today</p>
              <ClipboardCheck className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{tasksToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Avg. Weekly Completion</p>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{avgCompletion}%</p>
            <Progress value={avgCompletion} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Applications</p>
              <Briefcase className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{pipeline.applied}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Mentor Coverage</p>
              <UserCheck className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{mentorCoverage}%</p>
            <Progress value={mentorCoverage} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-slate-400">
              {mentorsAssigned}/{totalStudents} assigned · {mentorUsers.length} mentors
            </p>
          </CardContent>
        </Card>
      </div>

      <div id="pipeline" className="grid gap-6 lg:grid-cols-2 scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle>Readiness Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-4">
              {distribution.map((d) => (
                <div key={d.bucket} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex items-end gap-1">
                    <span className="text-xs font-medium text-slate-600">{d.count}</span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-300"
                      style={{ height: `${(d.count / maxDistCount) * 100}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{d.bucket}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities Pipeline</CardTitle>
            <CardDescription>Student engagement with opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Opportunities viewed", count: pipeline.viewed, variant: "secondary" as const },
              { label: "Opportunities saved", count: pipeline.saved, variant: "secondary" as const },
              { label: "Applications submitted", count: pipeline.applied, variant: "default" as const },
              { label: "Completions tracked", count: pipeline.completed, variant: "success" as const },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={item.variant}>{item.count}</Badge>
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Student Table with Search + Assign Mentor */}
      <Card id="students" className="scroll-mt-24">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {onboarded}/{totalStudents} onboarded · {readyStudents} ready for placement
          </CardDescription>
          <AdminStudentsTable students={rows} mentors={mentors} />
        </CardHeader>
      </Card>
    </div>
  );
}
