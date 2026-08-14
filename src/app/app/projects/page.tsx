import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { CreateProjectForm, RecommendButton } from "@/components/app/project-forms";
import { updateProjectStatusAction, startRecommendedProjectAction } from "@/server/actions/reviews";
import { fromJson } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  PLANNED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
} as const;

export default async function ProjectsPage() {
  const { profile } = await requireStudentProfile();

  const [projects, recommendations] = await Promise.all([
    prisma.project.findMany({ where: { studentId: profile.id }, orderBy: { updatedAt: "desc" } }),
    prisma.projectRecommendation.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const nextStatus = (s: string) => (s === "PLANNED" ? "IN_PROGRESS" : "COMPLETED");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500">
            Your portfolio evidence — every completed project raises your readiness score.
          </p>
        </div>
        <RecommendButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a project</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            Recommended by AI
          </h2>
          <div className="space-y-3">
            {recommendations
              .filter((r) => r.status !== "COMPLETED" && r.status !== "DISMISSED")
              .slice(0, 6)
              .map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {fromJson<string[]>(r.skillGaps, []).map((s) => (
                            <Badge key={s} variant="warning">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {r.status !== "STARTED" ? (
                        <form action={startRecommendedProjectAction.bind(null, r.id)}>
                          <Button type="submit" size="sm">
                            Start project
                          </Button>
                        </form>
                      ) : (
                        <Badge variant="indigo">Started</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Your projects ({projects.length})
        </h2>
        {projects.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No projects yet. Start one from your roadmap or the recommendations above.
          </p>
        )}
        <div className="space-y-3">
          {projects.map((p) => {
            const tech = fromJson<string[]>(p.techStack, []);
            return (
              <Card key={p.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{p.title}</p>
                      <Badge variant={STATUS_BADGE[p.status as keyof typeof STATUS_BADGE] ?? "secondary"}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {p.description && <p className="mt-1 text-sm text-slate-500">{p.description}</p>}
                    {tech.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tech.map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {p.status !== "COMPLETED" && (
                    <form action={updateProjectStatusAction.bind(null, p.id, nextStatus(p.status))}>
                      <Button type="submit" size="sm" variant="outline">
                        Mark {nextStatus(p.status).replace("_", " ")}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
