import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, BookOpen } from "lucide-react";
import { SkillsPanel, type SkillRow } from "@/components/app/skills-panel";
import { AdaptiveAssessment } from "@/components/app/adaptive-assessment";

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
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Skills Dashboard</h1>
        <p className="text-sm text-slate-500">Track your proficiency across all skill areas</p>
      </div>

      {/* Adaptive Assessment — only show if not yet assessed or allow re-take */}
      {!profile.assessmentComplete && skills.length === 0 && (
        <AdaptiveAssessment />
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500" />
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Total Skills</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-slate-900">{skills.length}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Strong (4-5)</p>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 font-serif text-3xl font-semibold text-emerald-600">{strong}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Developing (2-3)</p>
              <Brain className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 font-serif text-3xl font-semibold text-amber-600">{developing}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-rose-500" />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Learning (1)</p>
              <BookOpen className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-1 font-serif text-3xl font-semibold text-rose-600">{learning}</p>
          </CardContent>
        </Card>
      </div>

      {/* Re-take assessment option */}
      {profile.assessmentComplete && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-700">Retake Skill Assessment</p>
              <p className="text-xs text-slate-500">Update your skill grades with a fresh adaptive test</p>
            </div>
            <a href="/app/assessment">
              <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                Retake
              </button>
            </a>
          </div>
        </div>
      )}

      <SkillsPanel skills={skills} available={available} />
    </div>
  );
}
