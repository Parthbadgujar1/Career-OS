import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MentorReportsPage() {
  const mentor = await requireMentor();

  const mentees = await prisma.studentProfile.findMany({
    where: { mentorId: mentor.id },
    include: {
      user: { select: { name: true } },
      weeklyReports: { orderBy: { weekEnd: "desc" }, take: 4 },
      roadmap: { include: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Mentee Reports</h1>
        <p className="text-sm text-slate-500">Weekly completion and roadmap progress across your mentees</p>
      </div>

      {mentees.map((s) => {
        const roadmapItems = s.roadmap?.items.length ?? 0;
        const roadmapDone = s.roadmap?.items.filter((i) => i.status === "COMPLETED").length ?? 0;
        const roadmapPct = roadmapItems ? Math.round((roadmapDone / roadmapItems) * 100) : 0;

        return (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{s.user.name ?? "Student"}</CardTitle>
                  <CardDescription>
                    Readiness {s.readinessScore}/100 · Target {s.targetRole ?? "Not set"}
                  </CardDescription>
                </div>
                <Badge variant={s.readinessScore >= 70 ? "success" : s.readinessScore >= 40 ? "warning" : "secondary"}>
                  {s.readinessScore}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {s.roadmap && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Roadmap: {s.roadmap.title}</span>
                    <span className="font-medium">{roadmapPct}%</span>
                  </div>
                  <Progress value={roadmapPct} className="h-2" />
                </div>
              )}

              {s.weeklyReports.length === 0 ? (
                <p className="text-sm text-slate-500">No weekly reports yet.</p>
              ) : (
                <div className="space-y-2">
                  {s.weeklyReports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">
                          {r.weekStart.toLocaleDateString("en-US")} — {r.weekEnd.toLocaleDateString("en-US")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {r.tasksCompleted}/{r.tasksPlanned} tasks · {r.codingSolved} coding
                        </p>
                      </div>
                      <Badge variant={r.completionRate >= 70 ? "success" : r.completionRate >= 40 ? "warning" : "secondary"}>
                        {Math.round(r.completionRate)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
