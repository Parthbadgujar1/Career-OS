import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { generateWeeklyReportAction } from "@/server/actions/tasks";
import { fromJson, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { profile } = await requireStudentProfile();

  const [reports, snapshots] = await Promise.all([
    prisma.weeklyReport.findMany({
      where: { studentId: profile.id },
      orderBy: { weekEnd: "desc" },
    }),
    prisma.readinessSnapshot.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Weekly Reports</h1>
          <p className="text-sm text-slate-500">
            Analyze completion, consistency, weak areas and next-week priorities.
          </p>        </div>
        <form action={generateWeeklyReportAction}>
          <Button type="submit">Generate this week&apos;s report</Button>
        </form>
      </div>

      {snapshots.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Readiness over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end gap-2">
              {snapshots.map((s) => (
                <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-indigo-500"
                    style={{ height: `${Math.max(4, s.total)}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{s.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 && (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No reports yet. Work through your daily tasks for a week, then generate your first report.
        </p>
      )}

      <div className="space-y-4">
        {reports.map((r) => {
          const weak = fromJson<string[]>(r.weakAreas, []);
          const priorities = fromJson<string[]>(r.priorities, []);
          return (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {formatDate(r.weekStart)} – {formatDate(r.weekEnd)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.completionRate >= 70 ? "success" : r.completionRate >= 40 ? "warning" : "danger"}>
                      {r.completionRate}% completion
                    </Badge>
                    <Badge variant="secondary">{r.tasksCompleted}/{r.tasksPlanned} tasks</Badge>
                  </div>
                </div>
                <Progress value={r.completionRate} />
              </CardHeader>
              <CardContent className="space-y-3">
                {r.aiNarrative && <p className="text-sm text-slate-600">{r.aiNarrative}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-rose-50 px-3 py-2">
                    <p className="text-xs font-semibold text-rose-700">Weak areas</p>
                    <ul className="mt-1 list-inside list-disc text-xs text-rose-700">
                      {weak.slice(0, 4).map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-700">Next week priorities</p>
                    <ul className="mt-1 list-inside list-disc text-xs text-emerald-700">
                      {priorities.slice(0, 4).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
