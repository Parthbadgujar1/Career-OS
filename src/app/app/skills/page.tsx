import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, BookOpen } from "lucide-react";
import { SkillsPanel, type SkillRow } from "@/components/app/skills-panel";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const { profile } = await requireStudentProfile();

  const [studentSkills, allSkills] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
      orderBy: { skill: { sortOrder: "asc" } },
    }),
    prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const skills: SkillRow[] = studentSkills.map((s) => ({
    id: s.id,
    skillId: s.skillId,
    name: s.skill.name,
    category: s.skill.category,
    rating: s.selfRating,
  }));

  const owned = new Set(skills.map((s) => s.skillId));
  const available: SkillRow[] = allSkills
    .filter((s) => !owned.has(s.id))
    .map((s) => ({
      id: s.id,
      skillId: s.id,
      name: s.name,
      category: s.category,
      rating: 0,
    }));

  const strong = skills.filter((s) => s.rating >= 4).length;
  const developing = skills.filter((s) => s.rating >= 2 && s.rating < 4).length;
  const learning = skills.filter((s) => s.rating === 1).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Skills Dashboard</h1>
        <p className="text-sm text-slate-500">Track your proficiency across all skill areas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Total Skills</p>
            <p className="mt-1 text-3xl font-bold">{skills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Strong (4-5)</p>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-3xl font-bold text-emerald-600">{strong}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Developing (2-3)</p>
              <Brain className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-3xl font-bold text-amber-600">{developing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Learning (1)</p>
              <BookOpen className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-1 text-3xl font-bold text-rose-600">{learning}</p>
          </CardContent>
        </Card>
      </div>

      <SkillsPanel skills={skills} available={available} />
    </div>
  );
}
