import Link from "next/link";
import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { fromJson } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function signalFor(readiness: number): { label: string; variant: "success" | "warning" | "danger" } {
  if (readiness >= 70) return { label: "On track", variant: "success" };
  if (readiness >= 40) return { label: "Needs support", variant: "warning" };
  return { label: "Falling behind", variant: "danger" };
}

export default async function MentorPage() {
  const mentor = await requireMentor();

  const students = await prisma.studentProfile.findMany({
    where: { mentorId: mentor.id },
    include: {
      user: { select: { name: true, email: true } },
      weeklyReports: { orderBy: { weekEnd: "desc" }, take: 1 },
      skills: { include: { skill: true } },
    },
    orderBy: { readinessScore: "asc" },
  });

  const avgReadiness = students.length
    ? Math.round(students.reduce((s, p) => s + p.readinessScore, 0) / students.length)
    : 0;
  const completionRates = students
    .map((s) => s.weeklyReports[0]?.completionRate)
    .filter((v): v is number => v != null);
  const avgCompletion = completionRates.length
    ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
    : 0;
  const needsSupport = students.filter((s) => s.readinessScore < 60).length;

  const gapCounts = new Map<string, number>();
  for (const s of students) {
    for (const sk of s.skills) {
      if (sk.selfRating <= 2) {
        gapCounts.set(sk.skill.name, (gapCounts.get(sk.skill.name) ?? 0) + 1);
      }
    }
  }
  const topGaps = [...gapCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9);

  const interventions = students.filter((s) => s.readinessScore < 60 || (s.weeklyReports[0]?.completionRate ?? 100) < 50);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <p className="text-sm text-slate-500">Your assigned students · {mentor.email}</p>
        </div>
        <Link href="/app">
          <Button variant="outline">Go to app</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Avg. readiness</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{avgReadiness}</p>
            <Progress value={avgReadiness} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Avg. task completion</p>
            <p className="mt-1 text-3xl font-bold">{avgCompletion}%</p>
            <Progress value={avgCompletion} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Need support</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{needsSupport}</p>
            <p className="mt-1 text-xs text-slate-400">readiness below 60</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Skill gaps tracked</p>
            <p className="mt-1 text-3xl font-bold">{gapCounts.size}</p>
            <p className="mt-1 text-xs text-slate-400">weak skills across batch</p>
          </CardContent>
        </Card>
      </div>

      {interventions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle>Intervention list — who needs what</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4">Student</th>
                    <th className="pb-2 pr-4">Readiness</th>
                    <th className="pb-2 pr-4">Signal</th>
                    <th className="pb-2">What they need</th>
                  </tr>
                </thead>
                <tbody>
                  {interventions.map((s) => {
                    const latest = s.weeklyReports[0];
                    const priorities = latest ? fromJson<string[]>(latest.priorities, []) : [];
                    const weakAreas = latest ? fromJson<string[]>(latest.weakAreas, []) : [];
                    const weakSkills = s.skills.filter((sk) => sk.selfRating <= 2).map((sk) => sk.skill.name).slice(0, 3);
                    const needs = [...(priorities.length ? priorities : weakAreas), ...weakSkills].slice(0, 3);
                    const sig = signalFor(s.readinessScore);
                    return (
                      <tr key={s.id} className="border-b border-amber-100 last:border-0">
                        <td className="py-2 pr-4">
                          <p className="font-medium">{s.user.name ?? "Student"}</p>
                          <p className="text-xs text-slate-400">{s.targetRole ?? "—"}</p>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <Progress value={s.readinessScore} className="w-20" />
                            <span className="text-xs">{s.readinessScore}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={sig.variant}>{sig.label}</Badge>
                        </td>
                        <td className="py-2 text-slate-600">
                          {needs.length > 0 ? needs.join(" · ") : "Coaching call + weekly plan review"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.length === 0 && (
              <p className="text-sm text-slate-500">
                No students assigned yet. An admin links students to you via the student&apos;s profile.
              </p>
            )}
            {students.map((s) => {
              const latest = s.weeklyReports[0];
              const sig = signalFor(s.readinessScore);
              return (
                <div key={s.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.user.name ?? "Student"}</p>
                      <p className="text-xs text-slate-400">
                        {s.user.email} · {s.targetRole ?? "No target role"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {latest && (
                        <Badge variant={latest.completionRate >= 70 ? "success" : "warning"}>
                          last week {latest.completionRate}%
                        </Badge>
                      )}
                      <Badge variant={sig.variant}>{sig.label}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={s.readinessScore} className="max-w-xs" />
                    <span className="text-xs text-slate-400">{s.readinessScore}/100</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top skill gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topGaps.length === 0 && <p className="text-sm text-slate-500">No weak skills recorded yet.</p>}
            {topGaps.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span className="text-sm text-slate-700">{name}</span>
                <Badge variant="secondary">{count} student{count > 1 ? "s" : ""}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
