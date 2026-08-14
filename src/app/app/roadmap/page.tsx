import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { markRoadmapItemCompleteAction } from "@/server/actions/tasks";
import { generateRoadmapAction } from "@/server/actions/onboarding";
import { currentWeek } from "@/lib/engine/tasks";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const { profile } = await requireStudentProfile();
  const roadmap = await prisma.roadmap.findUnique({
    where: { studentId: profile.id },
    include: { items: { orderBy: [{ weekNumber: "asc" }, { order: "asc" }] } },
  });

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-2xl font-bold">Your Roadmap</h1>
        <p className="text-sm text-slate-500">
          You don&apos;t have a roadmap yet. Complete onboarding first, or generate one now.
        </p>
        <form action={generateRoadmapAction}>
          <Button type="submit">Generate roadmap</Button>
        </form>
      </div>
    );
  }

  const week = currentWeek(roadmap.createdAt, new Date());
  const grouped = new Map<number, typeof roadmap.items>();
  for (const item of roadmap.items) {
    if (!grouped.has(item.weekNumber)) grouped.set(item.weekNumber, []);
    grouped.get(item.weekNumber)!.push(item);
  }

  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter((i) => i.status === "COMPLETED").length;
  const progress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your Roadmap</h1>
          <p className="text-sm text-slate-500">
            {roadmap.title} · {roadmap.totalWeeks} weeks · currently on week {Math.min(week, roadmap.totalWeeks)}
          </p>
        </div>
        <form action={generateRoadmapAction}>
          <Button type="submit" variant="outline">Regenerate with AI</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall progress</CardTitle>
            <span className="text-sm font-semibold text-indigo-600">
              {completedItems}/{totalItems} milestones
            </span>
          </div>
          <Progress value={progress} />
        </CardHeader>
      </Card>

      {roadmap.aiSummary && (
        <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{roadmap.aiSummary}</p>
      )}

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([weekNumber, items]) => {
          const isCurrent = weekNumber === Math.min(week, roadmap.totalWeeks);
          return (
            <div key={weekNumber}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Week {weekNumber}
                </h2>
                {isCurrent && <Badge variant="indigo">Current week</Badge>}
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-3 rounded-xl border bg-white p-3 shadow-sm ${
                      item.status === "COMPLETED" ? "border-emerald-200" : "border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                        {item.status === "COMPLETED" && <Badge variant="success">Done</Badge>}
                      </div>
                      <p
                        className={`mt-1.5 text-sm font-medium ${
                          item.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.description && !item.status.includes("COMPLETED") && (
                        <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                    {item.status !== "COMPLETED" && (
                      <form action={markRoadmapItemCompleteAction.bind(null, item.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Mark done
                        </Button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
