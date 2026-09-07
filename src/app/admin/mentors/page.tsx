import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { assignMentorAction, updateMentorProfileAction } from "@/server/actions/admin";
import { fromJson } from "@/lib/utils";
import { Users, Mail, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMentorsPage() {
  await requireAdmin();

  const [mentors, students] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MENTOR" },
      include: {
        mentorProfile: true,
        mentorStudents: {
          include: { user: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.studentProfile.findMany({ select: { id: true } }),
  ]);

  const totalStudents = students.length;
  const assigned = mentors.reduce((a, m) => a + m.mentorStudents.length, 0);
  const coverage = totalStudents ? Math.round((assigned / totalStudents) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Mentor Management</h1>
        <p className="text-sm text-slate-500">Every assignment is reflected instantly on student and mentor dashboards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Active Mentors</p>
            <p className="mt-1 text-3xl font-bold">{mentors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Students Assigned</p>
            <p className="mt-1 text-3xl font-bold">{assigned}/{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Coverage</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{coverage}%</p>
            <Progress value={coverage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mentors.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              No mentor accounts yet.
            </CardContent>
          </Card>
        )}
        {mentors.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-900/10">
                    {(m.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${m.email}`} className="hover:text-indigo-600 hover:underline">
                        {m.email}
                      </a>
                    </p>
                  </div>
                </div>
                <Badge variant="indigo">
                  <Users className="h-3 w-3 mr-1" />
                  {m.mentorStudents.length} mentees
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <form action={updateMentorProfileAction.bind(null, m.id)} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`exp-${m.id}`} className="flex items-center gap-1 text-xs text-slate-500">
                    <Briefcase className="h-3 w-3" /> Expertise areas (comma-separated)
                  </Label>
                  <Input
                    id={`exp-${m.id}`}
                    name="expertiseRoles"
                    defaultValue={fromJson<string[]>(m.mentorProfile?.expertiseRoles, []).join(", ")}
                    placeholder="e.g. Software Developer, Data Analyst"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`ind-${m.id}`} className="text-xs text-slate-500">Industries (comma-separated)</Label>
                  <Input
                    id={`ind-${m.id}`}
                    name="expertiseIndustries"
                    defaultValue={fromJson<string[]>(m.mentorProfile?.expertiseIndustries, []).join(", ")}
                    placeholder="e.g. Fintech, AI & ML"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`yrs-${m.id}`} className="text-xs text-slate-500">Years of experience</Label>
                  <Input
                    id={`yrs-${m.id}`}
                    name="yearsExperience"
                    type="number"
                    min={0}
                    defaultValue={m.mentorProfile?.yearsExperience ?? 0}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor={`bio-${m.id}`} className="text-xs text-slate-500">Bio (used for skill-gap matching)</Label>
                  <Textarea id={`bio-${m.id}`} name="bio" rows={2} defaultValue={m.mentorProfile?.bio ?? ""} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="outline" size="sm">Save expertise</Button>
                </div>
              </form>
              {m.mentorStudents.length === 0 && (
                <p className="text-sm text-slate-500">No students assigned yet.</p>
              )}
              {m.mentorStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{s.user.name ?? "Student"}</p>
                    <p className="text-xs text-slate-400">Readiness {s.readinessScore}/100</p>
                  </div>
                  <form action={assignMentorAction.bind(null, s.id, "")}>
                    <Button type="submit" variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50">
                      Unassign
                    </Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
