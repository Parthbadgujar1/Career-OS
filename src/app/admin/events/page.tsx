import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { createEventAction } from "@/server/actions/admin";
import { CalendarDays, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPES = ["HACKATHON", "WEBINAR", "WORKSHOP", "CONTEST", "CAREER"];

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "bg-purple-100 text-purple-700",
  WEBINAR: "bg-green-100 text-green-700",
  WORKSHOP: "bg-blue-100 text-blue-700",
  CONTEST: "bg-orange-100 text-orange-700",
  CAREER: "bg-indigo-100 text-indigo-700",
};

export default async function AdminEventsPage() {
  await requireAdmin();

  const [events, participations] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: "desc" },
    }),
    prisma.eventParticipation.groupBy({
      by: ["eventId"],
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(participations.map((p) => [p.eventId, p._count._all]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Event Management</h1>
        <p className="text-sm text-slate-500">Schedule events and track student registrations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Events ({events.length})</CardTitle>
            <CardDescription>Registration counts are linked from student activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 && <p className="text-sm text-slate-500">No events yet.</p>}
            {events.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{ev.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[ev.type] ?? "bg-slate-100 text-slate-600"}`}>
                        {ev.type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {ev.startsAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {counts.get(ev.id) ?? 0} registered
                      </span>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const now = Date.now();
                    const ended = ev.endsAt ? ev.endsAt.getTime() < now : ev.startsAt.getTime() + 2 * 3600000 < now;
                    const live = ev.startsAt.getTime() <= now && !ended;
                    return (
                      <Badge variant={live ? "success" : ended ? "secondary" : "indigo"}>
                        {live ? "Live now" : ended ? "Ended" : "Upcoming"}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>Appears instantly in the student Events page</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createEventAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="e.g. Web Dev Workshop" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Type *</Label>
                <Select id="type" name="type" defaultValue="WEBINAR">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startsAt">Starts *</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endsAt">Ends</Label>
                <Input id="endsAt" name="endsAt" type="datetime-local" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location (optional)</Label>
                <Input id="location" name="location" placeholder="e.g. Room 204, Online (Zoom), Google Meet" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">Link (optional)</Label>
                <Input id="url" name="url" placeholder="https://meet.google.com/..." type="url" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="focusRoles">Target career roles (optional, comma-separated)</Label>
                <Input id="focusRoles" name="focusRoles" placeholder="e.g. Software Developer, Data Analyst" />
                <p className="text-xs text-slate-400">Personalized matching for students targeting these roles.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="focusIndustries">Target industries (optional, comma-separated)</Label>
                <Input id="focusIndustries" name="focusIndustries" placeholder="e.g. Fintech, AI & ML" />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                Create Event
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
