import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MentorSkillsPage() {
  const mentor = await requireMentor();

  const mentees = await prisma.studentProfile.findMany({
    where: { mentorId: mentor.id },
    include: {
      user: { select: { name: true } },
      skills: { include: { skill: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const gaps = new Map<string, { count: number; students: string[] }>();
  for (const s of mentees) {
    for (const sk of s.skills) {
      if (sk.selfRating <= 2) {
        const entry = gaps.get(sk.skill.name) ?? { count: 0, students: [] as string[] };
        entry.count += 1;
        entry.students.push(s.user.name ?? "Student");
        gaps.set(sk.skill.name, entry);
      }
    }
  }
  const sorted = [...gaps.entries()].sort((a, b) => b[1].count - a[1].count);

  const allRatings = mentees.flatMap((s) =>
    s.skills.map((sk) => ({ student: s.user.name ?? "Student", skill: sk.skill.name, rating: sk.selfRating }))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Skill Gaps</h1>
        <p className="text-sm text-slate-500">Skills rated ≤2/5 across your {mentees.length} mentees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gap Summary</CardTitle>
          <CardDescription>Focus your coaching where it matters most</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 && <p className="text-sm text-slate-500">No critical skill gaps across your mentees.</p>}
          {sorted.map(([name, info]) => (
            <div key={name} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{name}</span>
                <Badge variant="warning">
                  {info.count} student{info.count > 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-400">{info.students.join(", ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Skill Ratings</CardTitle>
          <CardDescription>Self-assessed ratings from your mentees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRatings.length === 0 && <p className="text-sm text-slate-500">No skills recorded yet.</p>}
          {allRatings
            .sort((a, b) => a.rating - b.rating)
            .map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-32 truncate text-sm text-slate-600">{r.student}</span>
                <span className="w-40 truncate text-sm font-medium">{r.skill}</span>
                <Progress value={Math.round((r.rating / 5) * 100)} className="h-2 flex-1" />
                <Badge variant={r.rating <= 2 ? "danger" : "secondary"}>{r.rating}/5</Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
