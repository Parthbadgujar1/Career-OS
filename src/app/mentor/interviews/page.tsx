import { requireMentor } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { formatInterviewType } from "@/lib/constants";
import { cancelInterviewSlotAction, completeInterviewBookingAction, createInterviewSlotAction } from "@/server/actions/interviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Video, CalendarPlus, Mic2, Users, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MentorInterviewsPage() {
  const user = await requireMentor();

  const slots = await prisma.interviewSlot.findMany({
    where: { mentorId: user.id },
    include: {
      bookings: { include: { student: { include: { user: { select: { name: true, email: true } } } } } },
    },
    orderBy: { startAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Mock Interviews</h1>
        <p className="text-sm text-slate-500">
          Publish Google Meet interview slots for your mentees, then grade them right here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-indigo-600" />
            Publish a new slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInterviewSlotAction} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Slot title</Label>
              <Input id="title" name="title" defaultValue="Software Developer mock interview" required />
            </div>
            <div>
              <Label htmlFor="type">Interview type</Label>
              <Select id="type" name="type" defaultValue="TECHNICAL">
                <option value="TECHNICAL">Technical</option>
                <option value="HR">HR</option>
                <option value="BEHAVIORAL">Behavioral</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxStudents">Max students per slot</Label>
              <Input id="maxStudents" name="maxStudents" type="number" min={1} max={10} defaultValue={1} />
            </div>
            <div>
              <Label htmlFor="startAt">Date &amp; time (start)</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div>
              <Label htmlFor="endAt">End time (optional)</Label>
              <Input id="endAt" name="endAt" type="datetime-local" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="meetUrl">Google Meet link</Label>
              <Input id="meetUrl" name="meetUrl" placeholder="https://meet.google.com/abc-defg-hij" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="gradient">
                <Video className="h-4 w-4" />
                Publish slot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {slots.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No slots yet. Publish your first interview slot above.
          </p>
        )}
        {slots.map((s) => {
          const active = s.bookings.filter((b) => b.status !== "CANCELLED");
          return (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mic2 className="h-4 w-4 text-indigo-600" />
                    {s.title}
                    <Badge variant="secondary">{formatInterviewType(s.type)}</Badge>
                    <Badge variant={s.status === "AVAILABLE" ? "success" : s.status === "BOOKED" ? "warning" : s.status === "COMPLETED" ? "indigo" : "danger"}>
                      {s.status}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {s.startAt.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {s.status !== "COMPLETED" && s.status !== "CANCELLED" && (
                      <form action={cancelInterviewSlotAction.bind(null, s.id)}>
                        <Button size="sm" variant="outline">
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  {active.length}/{s.maxStudents} booked
                  {s.meetUrl && <> · <a href={s.meetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline"><Video className="h-3 w-3" />Join link</a></>}
                </p>
              </CardHeader>
              {s.bookings.length > 0 && (
                <CardContent className="space-y-3">
                  {s.bookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {b.student.user.name ?? b.student.user.email ?? "Student"}
                          </p>
                          <p className="text-xs text-slate-400">
                            booked {b.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <Badge variant={b.status === "BOOKED" ? "warning" : b.status === "COMPLETED" ? "success" : "danger"}>
                          {b.status === "COMPLETED" && b.score !== null ? `${b.score}/${b.maxScore}` : b.status}
                        </Badge>
                      </div>
                      {b.status === "BOOKED" && (
                        <form action={completeInterviewBookingAction} className="mt-3 grid gap-3 sm:grid-cols-3">
                          <input type="hidden" name="bookingId" value={b.id} />
                          <div>
                            <Label>Score</Label>
                            <Input name="score" type="number" min={0} max={100} defaultValue={70} />
                          </div>
                          <div>
                            <Label>Max score</Label>
                            <Input name="maxScore" type="number" min={1} defaultValue={100} />
                          </div>
                          <div>
                            <Label>Feedback</Label>
                            <Input name="feedback" placeholder="Overall impression..." />
                          </div>
                          <div className="sm:col-span-3">
                            <Button type="submit" size="sm" variant="gradient">
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Mark complete &amp; save to student history
                            </Button>
                          </div>
                        </form>
                      )}
                      {b.status === "COMPLETED" && b.feedback !== "[]" && b.feedback && (
                        <p className="mt-2 text-sm text-slate-500">{stripJson(b.feedback)}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function stripJson(s: string): string {
  try {
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr.join(" · ") : s;
  } catch {
    return s;
  }
}
