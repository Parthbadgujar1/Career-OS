import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { FileText, Flame, Code2, FolderGit2, Target, Sparkles, CheckCircle2, Clock, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const { profile } = await requireStudentProfile();

  const [resumes, projects, solvedCount, interviews, roadmap, profileReviews] = await Promise.all([
    prisma.resume.count({ where: { studentId: profile.id } }),
    prisma.project.findMany({ where: { studentId: profile.id } }),
    prisma.codingSubmission.count({ where: { studentId: profile.id, status: "SOLVED" } }),
    prisma.mockInterview.findMany({ where: { studentId: profile.id } }),
    prisma.roadmap.findUnique({ where: { studentId: profile.id }, include: { items: true } }),
    prisma.profileReview.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const roadmapItems = roadmap?.items.length ?? 0;
  const roadmapDone = roadmap?.items.filter((i) => i.status === "COMPLETED").length ?? 0;
  const roadmapPct = roadmapItems ? Math.round((roadmapDone / roadmapItems) * 100) : 0;
  const bestInterview = interviews
    .filter((i) => i.score != null && i.maxScore)
    .map((i) => (i.score ?? 0) / (i.maxScore ?? 1))
    .reduce((a, b) => Math.max(a, b), 0);
  const profileScore = profileReviews.length ? Math.max(...profileReviews.map((p) => p.score)) : 0;
  const atsScore = (
    await prisma.resume.findMany({ where: { studentId: profile.id }, include: { review: true }, orderBy: { version: "desc" } })
  ).find((r) => r.review)?.review?.atsScore ?? 0;

  const achievements = [
    {
      id: "resume",
      title: "First Resume",
      description: "Created your first resume on Career OS",
      icon: FileText,
      color: "text-indigo-600 bg-indigo-100",
      earned: resumes > 0,
      date: null as Date | null,
      xp: 50,
      progress: resumes >= 1 ? 100 : Math.min(100, Math.round((resumes / 1) * 100)),
    },
    {
      id: "streak7",
      title: "7-Day Streak",
      description: "Completed tasks for 7 consecutive days",
      icon: Flame,
      color: "text-orange-600 bg-orange-100",
      earned: profile.bestStreak >= 7,
      date: null,
      xp: 100,
      progress: Math.min(100, Math.round((profile.bestStreak / 7) * 100)),
    },
    {
      id: "project",
      title: "First Project",
      description: "Started your first portfolio project",
      icon: FolderGit2,
      color: "text-emerald-600 bg-emerald-100",
      earned: projects.length > 0,
      date: null,
      xp: 75,
      progress: projects.length >= 1 ? 100 : 0,
    },
    {
      id: "coding10",
      title: "10 Coding Problems",
      description: "Solved 10 coding practice problems",
      icon: Code2,
      color: "text-blue-600 bg-blue-100",
      earned: solvedCount >= 10,
      date: null,
      xp: 100,
      progress: Math.min(100, Math.round((solvedCount / 10) * 100)),
    },
    {
      id: "interview",
      title: "Interview Ready",
      description: "Completed a mock interview with score > 80%",
      icon: Target,
      color: "text-purple-600 bg-purple-100",
      earned: bestInterview >= 0.8,
      date: null,
      xp: 150,
      progress: Math.min(100, Math.round(bestInterview * 100)),
    },
    {
      id: "roadmap25",
      title: "Roadmap 25%",
      description: "Completed 25% of your career roadmap",
      icon: Sparkles,
      color: "text-pink-600 bg-pink-100",
      earned: roadmapPct >= 25,
      date: null,
      xp: 100,
      progress: roadmapPct,
    },
    {
      id: "streak30",
      title: "30-Day Streak",
      description: "Maintained a 30-day activity streak",
      icon: Flame,
      color: "text-red-600 bg-red-100",
      earned: profile.bestStreak >= 30,
      date: null,
      xp: 300,
      progress: Math.min(100, Math.round((profile.bestStreak / 30) * 100)),
    },
    {
      id: "projects5",
      title: "5 Projects Complete",
      description: "Completed 5 portfolio projects",
      icon: FolderGit2,
      color: "text-teal-600 bg-teal-100",
      earned: completedProjects >= 5,
      date: null,
      xp: 250,
      progress: Math.min(100, Math.round((completedProjects / 5) * 100)),
    },
    {
      id: "profilepro",
      title: "Profile Pro",
      description: "Resume ATS ≥ 80 or LinkedIn/GitHub score ≥ 80",
      icon: Star,
      color: "text-amber-600 bg-amber-100",
      earned: atsScore >= 80 || profileScore >= 80,
      date: null,
      xp: 200,
      progress: Math.min(100, Math.max(atsScore, profileScore)),
    },
  ];

  const totalXP = achievements.reduce((sum, a) => sum + (a.earned ? a.xp : 0), 0);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-sm text-slate-500">Unlocked from your real activity across the app</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">{totalXP} XP</span>
          </div>
          <Badge variant="success">
            {earnedCount}/{achievements.length} Unlocked
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement, i) => (
          <Card
            key={achievement.id}
            className={cn("animate-slide-in-up relative overflow-hidden", !achievement.earned && "opacity-60")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br from-transparent via-slate-100 to-transparent -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", achievement.color)}>
                  <achievement.icon className="h-6 w-6" />
                </div>
                {achievement.earned && <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
              </div>
              {achievement.earned ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Unlocked</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">+{achievement.xp} XP</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium">{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                  <span className="text-xs text-slate-500">+{achievement.xp} XP on completion</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
