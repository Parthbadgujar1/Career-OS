import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { EventsPanel, type EventRow } from "@/components/app/events-panel";
import { fromJson } from "@/lib/utils";
import { getCareerProfile } from "@/lib/careers";

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

  const targetRoles = fromJson<string[]>(profile.targetRoles, profile.targetRole ? [profile.targetRole] : []);
  const industries = fromJson<string[]>(profile.preferredIndustries, []);
  const careerProfile = targetRoles[0] ? getCareerProfile(targetRoles[0]) : null;

  const matches = (ev: (typeof events)[number]): { recommended: boolean; matchReason: string | null } => {
    const evRoles = fromJson<string[]>(ev.focusRoles, []);
    const evIndustries = fromJson<string[]>(ev.focusIndustries, []);

    const roleHits = evRoles.filter((r) => targetRoles.includes(r));
    if (roleHits.length > 0) {
      return { recommended: true, matchReason: `Tailored for ${roleHits.slice(0, 2).join(", ")} — your target${targetRoles.length > 1 ? "s" : ""}` };
    }
    const indHits = evIndustries.filter((i) => industries.includes(i));
    if (indHits.length > 0) {
      return { recommended: true, matchReason: `Focus industry: ${indHits.slice(0, 2).join(", ")} — matches your preference` };
    }
    // Fallback: events with no targeting overlap a career profile's hiring industries
    if (careerProfile && evIndustries.length > 0 && careerProfile.industries.some((ci) => evIndustries.includes(ci))) {
      return { recommended: true, matchReason: `Relevant to ${targetRoles[0]} hiring` };
    }
    return { recommended: false, matchReason: null };
  };

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
    ...matches(e),
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
