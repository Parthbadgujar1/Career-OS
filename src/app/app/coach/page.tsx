import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "@/components/app/coach-chat";

export const dynamic = "force-dynamic";

function currentRoadmapWeek(createdAt: Date, totalWeeks: number) {
  const now = new Date();
  const elapsedWeeks = Math.floor((now.getTime() - createdAt.getTime()) / 86400000 / 7);
  return Math.min(totalWeeks, Math.max(1, elapsedWeeks + 1));
}

export default async function CoachPage() {
  const { profile } = await requireStudentProfile();

  const [skills, roadmap] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
    }),
    prisma.roadmap.findUnique({ where: { studentId: profile.id } }),
  ]);

  const weakSkills = skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name);
  const roadmapWeek = roadmap ? currentRoadmapWeek(roadmap.createdAt, roadmap.totalWeeks) : 0;

  const welcome = `Welcome to your **AI Career Coach**!

I've loaded your real profile:
- Target role: **${profile.targetRole ?? "Not set yet"}**
- Current readiness: **${profile.readinessScore}%**
- Weak areas: ${weakSkills.length > 0 ? `**${weakSkills.join(", ")}**` : "**none right now — nice work**"}
- Active roadmap: **${roadmapWeek > 0 ? `Week ${roadmapWeek}${roadmap ? " of " + roadmap.totalWeeks : ""}` : "not generated yet"}**

**How I can help:**
• Daily action plans — "What should I do today?"
• Skill prioritization & learning paths
• Resume review & ATS optimization
• Interview preparation & mock questions
• Project recommendations & portfolio building

What would you like to work on?`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">AI Career Coach</h1>
        <p className="text-sm text-slate-500">Answers come from your live roadmap, skills, and progress</p>
      </div>
      <CoachChat welcome={welcome} />
    </div>
  );
}
