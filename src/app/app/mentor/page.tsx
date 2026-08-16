import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Target, Brain, Calendar, MessageSquare, MessageCircle } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Mentor</h1>
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold text-white">
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
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle>No Mentor Assigned</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="text-sm text-slate-600">
              You don&apos;t have a mentor assigned yet. Contact your program admin to get paired with a mentor who can guide your career journey.
            </p>
          </CardContent>
        </Card>
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