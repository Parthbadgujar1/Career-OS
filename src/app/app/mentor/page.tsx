import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Target, Brain, Calendar, MessageSquare, MessageCircle, UserPlus, Sparkles } from "lucide-react";
import { fromJson } from "@/lib/utils";
import { fetchMentorCandidates, scoreMentorForStudent } from "@/lib/mentor-match";
import { assignMentorToMeAction } from "@/server/actions/mentor";
import { getCareerProfile } from "@/lib/careers";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  const { profile } = await requireStudentProfile();

  const [mentor, skills, recentReports, feedback] = await Promise.all([
    profile.mentorId
      ? prisma.user.findUnique({
          where: { id: profile.mentorId },
          select: { id: true, name: true, email: true },
        })
      : null,
    prisma.studentSkill.findMany({
      where: { studentId: profile.id },
      include: { skill: true },
      orderBy: { selfRating: "asc" },
    }),
    prisma.weeklyReport.findMany({
      where: { studentId: profile.id },
      orderBy: { weekEnd: "desc" },
      take: 3,
    }),
    prisma.notification.findMany({
      where: { studentId: profile.id, type: "ALERT" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const targetRoles = fromJson<string[]>(profile.targetRoles, profile.targetRole ? [profile.targetRole] : []);
  const industries = fromJson<string[]>(profile.preferredIndustries, []);
  const weakSkills = skills.filter((s) => s.selfRating <= 2).map((s) => s.skill.name);

  let recommendations: { mentor: { userId: string; name: string; email: string; yearsExperience: number; bio: string | null }; score: number; reasons: string[] }[] = [];
  if (!mentor) {
    const candidates = await fetchMentorCandidates(prisma);
    recommendations = candidates
      .map((m) => ({ mentor: m, ...scoreMentorForStudent(m, { targetRoles, industries, weakSkills }) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  const primaryCareer = targetRoles[0] ? getCareerProfile(targetRoles[0]) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">My Mentor</h1>
          <p className="text-sm text-slate-500">Connect with your assigned mentor for guidance</p>
        </div>
      </div>

      {mentor ? (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Mentor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
                {(mentor.name || "M")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{mentor.name}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {mentor.email}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${mentor.email}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle>No Mentor Assigned</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-4">
              <p className="text-sm text-slate-600">
                Pick a mentor matched to your target career, industry and skill gaps — or ask your
                program admin to pair you.
              </p>
            </CardContent>
          </Card>

          {recommendations.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-bold">Recommended for you</h2>
              </div>
              <div className="space-y-3">
                {recommendations.map((r) => {
                  const initial = (r.mentor.name || "M")[0].toUpperCase();
                  return (
                    <Card key={r.mentor.userId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{r.mentor.name}</p>
                                <Badge variant="indigo">{Math.round(r.score)}% match</Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                {r.mentor.yearsExperience > 0 ? `${r.mentor.yearsExperience} yrs experience` : "Mentor"} ·{" "}
                                <Mail className="h-3 w-3 inline" /> <a href={`mailto:${r.mentor.email}`} className="hover:text-indigo-600 hover:underline">{r.mentor.email}</a>
                              </p>
                            </div>
                          </div>
                          <form action={assignMentorToMeAction.bind(null, r.mentor.userId)}>
                            <Button type="submit" size="sm">
                              <UserPlus className="h-4 w-4 mr-1.5" />
                              Assign
                            </Button>
                          </form>
                        </div>
                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {r.reasons.slice(0, 3).map((reason, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle>No matching mentors yet</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <p className="text-sm text-slate-600">
                  No mentors with expertise matching {primaryCareer?.title ?? targetRoles[0] ?? "your goal"} are
                  registered. Contact your program admin to request one.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              <CardTitle>Current Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mentor ? (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Target Role</span>
                    <span className="font-medium">{profile.targetRole || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Readiness Score</span>
                    <span className="font-medium">{profile.readinessScore}/100</span>
                  </div>
                  <Progress value={profile.readinessScore} className="h-2" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-600">Your mentor can see:</p>
                  <ul className="space-y-1 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><Brain className="h-3.5 w-3.5" /> Your skill ratings & weak areas</li>
                    <li className="flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Weekly task completion</li>
                    <li className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Roadmap progress</li>
                    <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> Assessment scores</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Assign a mentor to enable progress tracking</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              <CardTitle>Skill Gaps (Mentor Visibility)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {skills.filter((s) => s.selfRating <= 2).length > 0 ? (
              skills
                .filter((s) => s.selfRating <= 2)
                .slice(0, 8)
                .map((skill) => (
                  <div key={skill.skillId} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.skill.name}</span>
                      <Badge variant="secondary">{skill.selfRating}/5</Badge>
                    </div>
                    <Progress value={Math.round((skill.selfRating / 5) * 100)} className="h-1.5" />
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No critical skill gaps detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {feedback.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
              <CardTitle>Feedback from Your Mentor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="indigo">From your mentor</Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Weekly Reports (Shared with Mentor)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Week of {new Date(report.weekStart).toLocaleDateString()} —{" "}
                      {new Date(report.weekEnd).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {report.tasksCompleted}/{report.tasksPlanned} tasks · {report.codingSolved} coding problems
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={Math.round(report.completionRate)} className="w-24 h-2" />
                    <Badge variant={report.completionRate >= 70 ? "success" : report.completionRate >= 40 ? "warning" : "secondary"}>
                      {Math.round(report.completionRate)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}