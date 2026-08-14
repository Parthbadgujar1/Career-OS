import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [students, tasksToday, reports] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({
      where: {
        dueDate: new Date(),
        status: "COMPLETED",
      },
    }),
    prisma.weeklyReport.aggregate({
      _avg: { completionRate: true },
    }),
  ]);

  const onboarded = students.filter((s) => s.onboardedAt).length;
  const avgReadiness = students.length
    ? Math.round(students.reduce((a, s) => a + s.readinessScore, 0) / students.length)
    : 0;
  const avgCompletion = Math.round(reports._avg.completionRate ?? 0);

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
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform analytics · signed in as {admin.email}</p>
        </div>
        <Link href="/app">
          <Button variant="outline">Go to app</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Students</p>
            <p className="mt-1 text-3xl font-bold">{students.length}</p>
            <p className="mt-1 text-xs text-slate-400">{onboarded} onboarded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Avg readiness</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{avgReadiness}/100</p>
            <Progress value={avgReadiness} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Tasks completed today</p>
            <p className="mt-1 text-3xl font-bold">{tasksToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Avg weekly completion</p>
            <p className="mt-1 text-3xl font-bold">{avgCompletion}%</p>
            <Progress value={avgCompletion} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Readiness distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-4">
              {distribution.map((d) => (
                <div key={d.bucket} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-slate-600">{d.count}</span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: `${(d.count / maxCount) * 100}%`, backgroundColor: d.color }}
                  />
                  <span className="text-[10px] text-slate-400">{d.bucket}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top students by readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {students
              .filter((s) => s.onboardedAt)
              .sort((a, b) => b.readinessScore - a.readinessScore)
              .slice(0, 6)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.user.name ?? "Student"}</p>
                    <p className="truncate text-xs text-slate-400">{s.targetRole ?? "No target role"}</p>
                  </div>
                  <Badge variant={s.readinessScore >= 70 ? "success" : s.readinessScore >= 40 ? "warning" : "secondary"}>
                    {s.readinessScore}
                  </Badge>
                </div>
              ))}
            {students.filter((s) => s.onboardedAt).length === 0 && (
              <p className="text-sm text-slate-500">No onboarded students yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-4">Student</th>
                  <th className="pb-2 pr-4">Target role</th>
                  <th className="pb-2 pr-4">Readiness</th>
                  <th className="pb-2 pr-4">Mentor</th>
                  <th className="pb-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4">
                      <p className="font-medium">{s.user.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{s.user.email}</p>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{s.targetRole ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Progress value={s.readinessScore} className="w-20" />
                        <span className="text-xs">{s.readinessScore}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{s.mentorId ? "Assigned" : "—"}</td>
                    <td className="py-2 text-slate-400">{s.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
