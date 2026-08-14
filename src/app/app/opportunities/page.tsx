import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { matchOpportunities, recordOpportunityAction } from "@/lib/engine/opportunities";
import {
  saveOpportunityAction,
  applyOpportunityAction,
  registerEventAction,
} from "@/server/actions/activities";
import { fromJson, formatDate } from "@/lib/utils";
import { OPPORTUNITY_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "secondary" | "indigo"> = {
  INTERNSHIP: "success",
  JOB: "indigo",
  HACKATHON: "warning",
  COMPETITION: "danger",
  EVENT: "secondary",
  WEBINAR: "secondary",
  QUIZ: "default",
};

const TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: "Internship",
  JOB: "Job",
  HACKATHON: "Hackathon",
  COMPETITION: "Competition",
  EVENT: "Event",
  WEBINAR: "Webinar",
  QUIZ: "Quiz",
};

const platformLabel = (id: string) => OPPORTUNITY_PLATFORMS.find((p) => p.id === id)?.label ?? id;

export default async function OpportunitiesPage() {
  const { profile } = await requireStudentProfile();
  await matchOpportunities(prisma, profile.id);

  const [opportunities, actions, events, participations] = await Promise.all([
    prisma.opportunity.findMany({
      where: { active: true },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      take: 40,
    }),
    prisma.opportunityAction.findMany({ where: { studentId: profile.id } }),
    prisma.event.findMany({ where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 8 }),
    prisma.eventParticipation.findMany({ where: { studentId: profile.id } }),
  ]);

  await Promise.all(
    opportunities.map((o) => recordOpportunityAction(prisma, profile.id, o.id, "VIEWED"))
  );

  const actionSet = new Set(actions.map((a) => `${a.opportunityId}:${a.action}`));
  const saved = (id: string) => actionSet.has(`${id}:SAVED`) || actionSet.has(`${id}:APPLIED`);
  const applied = (id: string) => actionSet.has(`${id}:APPLIED`);
  const registered = (eventId: string) => participations.some((p) => p.eventId === eventId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Opportunity Gateway</h1>
        <p className="text-sm text-slate-500">
          Curated internships, jobs and contests from {OPPORTUNITY_PLATFORMS.map((p) => p.label).join(", ")}.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Live opportunities</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {opportunities.map((o) => {
            const tags = fromJson<string[]>(o.tags, []);
            const eligibility = fromJson<string[]>(o.eligibility, []);
            return (
              <div key={o.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-xs text-slate-400">
                      {platformLabel(o.platform)}
                    </p>
                  </div>
                  <Badge variant={TYPE_VARIANT[o.type] ?? "secondary"}>{TYPE_LABELS[o.type] ?? o.type}</Badge>
                </div>
                {o.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{o.description}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
                {eligibility.length > 0 && (
                  <p className="mt-2 text-xs text-slate-400">Eligible: {eligibility.join(", ")}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs text-slate-400">
                    {o.deadline ? `Due ${formatDate(o.deadline)}` : "Rolling"}
                  </span>
                  <div className="flex gap-2">
                    <a href={o.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    {!applied(o.id) && (
                      <form action={saveOpportunityAction.bind(null, o.id)}>
                        <Button variant="outline" size="sm" disabled={saved(o.id)}>
                          {saved(o.id) ? "Saved" : "Save"}
                        </Button>
                      </form>
                    )}
                    <form action={applyOpportunityAction.bind(null, o.id)}>
                      <Button size="sm" disabled={applied(o.id)}>
                        {applied(o.id) ? "Applied" : "Apply"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
          {opportunities.length === 0 && (
            <p className="text-sm text-slate-500">No live opportunities right now.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Upcoming events</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{e.title}</p>
                <Badge variant="secondary">{e.type}</Badge>
              </div>
              {e.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.description}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">{formatDate(e.startsAt)}</span>
                <div className="flex gap-2">
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  <form action={registerEventAction.bind(null, e.id)}>
                    <Button size="sm" variant="outline" disabled={registered(e.id)}>
                      {registered(e.id) ? "Registered" : "Register"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-slate-500">No upcoming events.</p>}
        </div>
      </section>
    </div>
  );
}
