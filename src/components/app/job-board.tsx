"use client";

import { useState } from "react";
import {
  getJobBoardAction,
  recordOpportunityActionAction,
  clearOpportunityActionAction,
  type JobBoardData,
  type JobAction,
} from "@/server/actions/applications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ExternalLink, FileCheck2, Loader2, Briefcase } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: "Internship",
  JOB: "Job",
  HACKATHON: "Hackathon",
  COMPETITION: "Competition",
  EVENT: "Event",
  WEBINAR: "Webinar",
  QUIZ: "Quiz",
};

function fmtDeadline(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function JobBoard({ initial }: { initial: JobBoardData }) {
  const [data, setData] = useState<JobBoardData>(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (opportunityId: string, action: JobAction, fn: () => Promise<{ ok: true } | { error: string }>) => {
    setPending(`${opportunityId}:${action}`);
    setError(null);
    try {
      const res = await fn();
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      setData(await getJobBoardAction());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setPending(null);
    }
  };

  if (data.jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <Briefcase className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No active jobs yet</p>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            When employers post through the portal, their roles appear here ranked by how well they match your profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Open roles</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.jobs.map((job) => {
            const busy = pending !== null;
            return (
              <Card key={job.id} className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">{job.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {TYPE_LABELS[job.type] ?? job.type}
                        {job.location ? ` · ${job.location}` : ""}
                        {job.stipend ? ` · ${job.stipend}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {job.saved && <Badge variant="secondary" className="text-[10px]">Saved</Badge>}
                      {job.applied && <Badge variant="success" className="text-[10px]">Applied</Badge>}
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600">{job.description}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.tags.slice(0, 6).map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{t}</span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {job.deadline ? `Apply by ${fmtDeadline(job.deadline)}` : "Rolling deadline"}
                    </span>
                    <div className="flex gap-1.5">
                      {job.saved ? (
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" disabled={busy} onClick={() => act(job.id, "SAVED", () => clearOpportunityActionAction(job.id, "SAVED"))} title="Unsave">
                          {pending === `${job.id}:SAVED` ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookmarkCheck className="h-3 w-3 text-indigo-600" />}
                          Saved
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" disabled={busy} onClick={() => act(job.id, "SAVED", () => recordOpportunityActionAction(job.id, "SAVED"))}>
                          {pending === `${job.id}:SAVED` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bookmark className="h-3 w-3" />}
                          Save
                        </Button>
                      )}
                      {job.applied ? (
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" disabled={busy} onClick={() => act(job.id, "APPLIED", () => clearOpportunityActionAction(job.id, "APPLIED"))}>
                          {pending === `${job.id}:APPLIED` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileCheck2 className="h-3 w-3" />}
                          Applied
                        </Button>
                      ) : (
                        <Button size="sm" className="h-8 px-2.5 text-xs" disabled={busy} onClick={() => act(job.id, "APPLIED", () => recordOpportunityActionAction(job.id, "APPLIED"))}>
                          {pending === `${job.id}:APPLIED` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileCheck2 className="h-3 w-3" />}
                          Mark Applied
                        </Button>
                      )}
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {data.applications.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">My applications</h2>
          <Card>
            <CardContent className="divide-y divide-slate-100 p-0">
              {data.applications.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{a.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      Updated {new Date(a.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={a.status === "APPLIED" ? "secondary" : "warning"}>{a.status}</Badge>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="mt-2 text-[11px] text-slate-400">
            Track every application here — employers see them in their applicant pipeline.
          </p>
        </section>
      )}
    </div>
  );
}