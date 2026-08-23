import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { EventsPanel, type EventRow } from "@/components/app/events-panel";

export const dynamic = "force-dynamic";

const EVENT_WINDOW_START = new Date(Date.now() - 24 * 60 * 60 * 1000);

export default async function EventsPage() {
  const { profile } = await requireStudentProfile();

  const [events, participations] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: "asc" },
      where: { startsAt: { gte: EVENT_WINDOW_START } },
    }),
    prisma.eventParticipation.findMany({ where: { studentId: profile.id } }),
  ]);

  const registered = new Set(participations.map((p) => p.eventId));
  const rows: EventRow[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt?.toISOString() ?? null,
    location: e.location,
    url: e.url,
    registered: registered.has(e.id),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events & Webinars</h1>
          <p className="text-sm text-slate-500">Discover and register for career-boosting events</p>
        </div>
        <Link href="/app/opportunities">
          <Button variant="outline">
            <CalendarDays className="h-4 w-4 mr-2" />
            Browse All Events
          </Button>
        </Link>
      </div>

      <EventsPanel events={rows} />
    </div>
  );
}
