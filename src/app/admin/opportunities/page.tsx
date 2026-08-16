import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { createOpportunityAction, toggleOpportunityAction } from "@/server/actions/admin";
import { OPPORTUNITY_PLATFORMS } from "@/lib/constants";
import { ExternalLink, Eye, Bookmark, Send, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPES = ["INTERNSHIP", "JOB", "HACKATHON", "COMPETITION", "EVENT", "WEBINAR", "QUIZ"];

export default async function AdminOpportunitiesPage() {
  await requireAdmin();

  const [opportunities, actions] = await Promise.all([
    prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunityAction.groupBy({
      by: ["opportunityId", "action"],
      _count: { _all: true },
    }),
  ]);

  const counts = new Map<string, { viewed: number; saved: number; applied: number; completed: number }>();
  for (const a of actions) {
    const entry = counts.get(a.opportunityId) ?? { viewed: 0, saved: 0, applied: 0, completed: 0 };
    if (a.action === "VIEWED") entry.viewed += a._count._all;
    if (a.action === "SAVED") entry.saved += a._count._all;
    if (a.action === "APPLIED") entry.applied += a._count._all;
    if (a.action === "COMPLETED") entry.completed += a._count._all;
    counts.set(a.opportunityId, entry);
  }

  const platformLabels = Object.fromEntries(OPPORTUNITY_PLATFORMS.map((p) => [p.id, p.label]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Opportunity Management</h1>
        <p className="text-sm text-slate-500">Catalog, engagement, and availability across all platforms</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Catalog ({opportunities.length})</CardTitle>
            <CardDescription>Live engagement is linked from student activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.length === 0 && <p className="text-sm text-slate-500">No opportunities yet.</p>}
            {opportunities.map((op) => {
              const c = counts.get(op.id) ?? { viewed: 0, saved: 0, applied: 0, completed: 0 };
              return (
                <div key={op.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{op.title}</p>
                        <Badge variant={op.active ? "success" : "secondary"}>{op.active ? "Live" : "Hidden"}</Badge>
                        <Badge variant="outline">{op.type}</Badge>
                        <Badge variant="secondary">{platformLabels[op.platform] ?? op.platform}</Badge>
                      </div>
                      {op.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{op.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {c.viewed} views</span>
                        <span className="flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> {c.saved} saved</span>
                        <span className="flex items-center gap-1"><Send className="h-3.5 w-3.5" /> {c.applied} applied</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> {c.completed} completed</span>
                        {op.deadline && <span>Deadline {op.deadline.toLocaleDateString("en-US")}</span>}
                      </div>
                    </div>
                    <form action={toggleOpportunityAction.bind(null, op.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        {op.active ? "Hide" : "Publish"}
                      </Button>
                    </form>
                  </div>
                  <div className="mt-2">
                    <a
                      href={op.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open listing
                    </a>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Opportunity</CardTitle>
            <CardDescription>Published to the student Opportunities feed</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createOpportunityAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="e.g. SWE Intern 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select id="platform" name="platform" defaultValue="internshala">
                    {OPPORTUNITY_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type *</Label>
                  <Select id="type" name="type" defaultValue="INTERNSHIP">
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">Listing URL *</Label>
                <Input id="url" name="url" required placeholder="https://..." type="url" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="datetime-local" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="frontend, remote, stipend" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} placeholder="What should students know?" />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                Publish Opportunity
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
