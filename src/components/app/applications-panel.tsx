"use client";

import { useMemo, useState, useTransition } from "react";
import { Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateApplicationStatusAction } from "@/server/actions/activities";

export interface ApplicationRow {
  id: string;
  title: string;
  platform: string;
  type: string;
  status: string;
  appliedDate: string;
  url: string;
}

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-purple-100 text-purple-700",
};

const STATUS_ORDER = ["OFFER", "INTERVIEW", "APPLIED", "SAVED", "REJECTED", "COMPLETED"];

export function ApplicationsPanel({ applications }: { applications: ApplicationRow[] }) {
  const [filter, setFilter] = useState("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const changeStatus = (id: string, status: string) => {
    setPendingId(id);
    startTransition(async () => {
      await updateApplicationStatusAction(id, status);
      setPendingId(null);
    });
  };

  const filtered = useMemo(() => {
    if (filter === "ALL") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of applications) map[a.status] = (map[a.status] ?? 0) + 1;
    return map;
  }, [applications]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {["ALL", ...STATUS_ORDER].map((status) => {
          const active = filter === status;
          return (
            <Button
              key={status}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={cn(!active && STATUS_COLORS[status], active && "shadow-sm")}
            >
              {status} {status !== "ALL" && counts[status] != null ? `(${counts[status]})` : `(${applications.length})`}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered
          .slice()
          .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
          .map((app) => (
            <Card key={app.id} className="animate-slide-in-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary">{app.type}</Badge>
                    <CardTitle className="mt-2 text-base">{app.title}</CardTitle>
                    <p className="text-sm font-medium text-slate-700 capitalize">{app.platform}</p>
                  </div>
                  <Badge className={STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-700"}>{app.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(app.appliedDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => changeStatus(app.id, e.target.value)}
                    disabled={pendingId === app.id}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-100 disabled:opacity-50"
                    aria-label={`Update status for ${app.title}`}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  {pendingId === app.id && <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-indigo-500" />}
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={app.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Listing
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-500">
              {applications.length === 0
                ? "No applications yet. Browse opportunities and hit Apply to track them here."
                : "No applications with this status."}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Application Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="text-center p-3 rounded-xl bg-slate-50">
                <p className="text-2xl font-bold" style={{ color: (STATUS_COLORS[status] ?? "").replace("bg-", "text-").replace("100", "700") }}>
                  {counts[status] ?? 0}
                </p>
                <p className="text-xs text-slate-500 capitalize">{status.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
