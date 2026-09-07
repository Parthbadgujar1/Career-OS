import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { fromJson, formatDate } from "@/lib/utils";
import { AiInterview } from "@/components/app/ai-interview";
import { InterviewBooker } from "@/components/app/interview-booker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelInterviewBookingAction } from "@/server/actions/interviews";
import { formatInterviewType } from "@/lib/constants";
import { Sparkles, Video, History, Bot, Mic2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const { profile } = await requireStudentProfile();

  const [interviews, slots, bookings] = await Promise.all([
    prisma.mockInterview.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: "desc" } }),
    prisma.interviewSlot.findMany({
      where: { status: "AVAILABLE" },
      include: { mentor: { select: { name: true } }, bookings: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.interviewBooking.findMany({
      where: { studentId: profile.id, status: { not: "CANCELLED" } },
      include: { slot: { include: { mentor: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const avg = interviews.length
    ? Math.round((interviews.reduce((acc, i) => acc + (i.score ?? 0), 0) / Math.max(1, interviews.length)))
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Mock Interviews</h1>
        <p className="text-sm text-slate-500">
          Practice with AI or book a live Google Meet session with a mentor — all graded against real role criteria.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{interviews.length} sessions</Badge>
        <Badge variant={avg >= 70 ? "success" : avg >= 40 ? "warning" : "danger"}>avg {avg}%</Badge>
        <Badge variant="secondary">{bookings.length} booked with mentors</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">AI Interview</h2>
          </div>
          <AiInterview defaultRole={profile.targetRole ?? ""} />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Video className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Live with a mentor</h2>
          </div>
          <InterviewBooker slots={slots.map((s) => ({ id: s.id, title: s.title, type: s.type, startAt: s.startAt.toISOString(), mentor: { name: s.mentor?.name ?? null }, maxStudents: s.maxStudents, _bookedCount: s.bookings.filter((b) => b.status !== "CANCELLED").length }))} bookedIds={new Set(bookings.map((b) => b.slotId))} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">My interview sessions</h2>
        </div>
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mic2 className="h-4 w-4 text-indigo-600" />
                    {b.slot.title}
                    <Badge variant="secondary">{formatInterviewType(b.slot.type)}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {b.status === "BOOKED" && (
                      <>
                        {b.slot.meetUrl && (
                          <a href={b.slot.meetUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="default"><Video className="mr-1.5 h-4 w-4" />Join Meet</Button>
                          </a>
                        )}
                        <form action={cancelInterviewBookingAction.bind(null, b.slotId)}>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </form>
                      </>
                    )}
                    {b.status === "COMPLETED" && (
                      <Badge variant={b.score && b.score / Math.max(1, b.maxScore ?? 1) >= 0.7 ? "success" : "warning"}>
                        {b.score}/{b.maxScore}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Mentor: {b.slot.mentor.name ?? "Mentor"} · {b.slot.startAt.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {b.status === "COMPLETED" && b.slot.meetUrl && ` · ${b.slot.meetUrl}`}
                </p>
              </CardHeader>
              {b.status === "COMPLETED" && fromJson<string[]>(b.feedback, []).length > 0 && (
                <CardContent>
                  <ul className="list-inside list-disc space-y-1 text-sm text-slate-500">
                    {fromJson<string[]>(b.feedback, []).map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
          {bookings.length === 0 && (
            <p className="rounded-lg border border-slate-200 bg-surface p-6 text-center text-sm text-slate-500">
              No mentor sessions yet. Book a live slot above to get real interview feedback.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Practice history</h2>
        </div>
        <div className="space-y-3">
          {interviews.map((i) => {
            const feedback = fromJson<string[]>(i.feedback, []);
            const criteria = fromJson<Record<string, number>>(i.criteriaScores, {});
            return (
              <Card key={i.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {formatInterviewType(i.type)} interview
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {i.mode === "AI" ? "AI" : i.mode === "MENTOR_MEET" ? "Mentor" : "Self"} · {i.role || "role"}
                        {i.evaluatorName ? ` · ${i.evaluatorName}` : ""}
                      </span>
                    </CardTitle>
                    <Badge variant={i.score && i.maxScore && i.score / i.maxScore >= 0.7 ? "success" : "secondary"}>
                      {i.score ?? "—"}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{formatDate(i.createdAt)}</p>
                </CardHeader>
                {(Object.keys(criteria).length > 0 || feedback.length > 0) && (
                  <CardContent className="space-y-2">
                    {Object.keys(criteria).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(criteria).map(([k, v]) => (
                          <Badge key={k} variant="secondary">{k}: {v}%</Badge>
                        ))}
                      </div>
                    )}
                    {feedback.length > 0 && (
                      <ul className="list-inside list-disc space-y-1 text-sm text-slate-500">
                        {feedback.slice(0, 5).map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
          {interviews.length === 0 && (
            <p className="rounded-lg border border-slate-200 bg-surface p-6 text-center text-sm text-slate-500">
              No practice sessions yet. Take an AI interview above to start.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
