import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MentorFeedbackPage() {
  const mentor = await requireMentor();

  const mentees = await prisma.studentProfile.findMany({
    where: { mentorId: mentor.id },
    include: { user: { select: { name: true } } },
  });
  const menteeIds = mentees.map((m) => m.id);
  const nameById = new Map(mentees.map((m) => [m.id, m.user.name ?? "Student"]));

  const feedback = await prisma.notification.findMany({
    where: {
      studentId: { in: menteeIds },
      type: "ALERT",
      title: { contains: "Feedback" },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Feedback History</h1>
        <p className="text-sm text-slate-500">Every note you sent your mentees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sent Feedback ({feedback.length})</CardTitle>
          <CardDescription>Students see these instantly in their Overview and Mentor page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.length === 0 && <p className="text-sm text-slate-500 text-center py-4">You haven&apos;t sent feedback yet.</p>}
          {feedback.map((f) => (
            <div key={f.id} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <Badge variant="indigo">{nameById.get(f.studentId) ?? "Mentee"}</Badge>
                </div>
                <span className="text-xs text-slate-500">
                  {f.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{f.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
