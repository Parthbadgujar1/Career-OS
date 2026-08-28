import { requireEmployer } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { toggleJobStatusAction, createJobAction } from "@/server/actions/employer";
import { OPPORTUNITY_PLATFORMS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const TYPES = ["INTERNSHIP", "JOB", "HACKATHON", "COMPETITION", "EVENT", "WEBINAR", "QUIZ"];

export default async function EmployerJobsPage() {
  const user = await requireEmployer();

  const jobs = await prisma.opportunity.findMany({
    where: { postedById: user.id },
    include: {
      applicationStatuses: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const platformLabels = Object.fromEntries(OPPORTUNITY_PLATFORMS.map((p) => [p.id, p.label]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Posted Jobs</h1>
        <p className="text-sm text-slate-500">Manage your job listings and track applicants</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Jobs ({jobs.length})</CardTitle>
            <CardDescription>Toggle visibility and view applicant counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 && (
              <p className="text-sm text-slate-500">No jobs posted yet. Create your first listing.</p>
            )}
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{job.title}</p>
                      <Badge variant={job.active ? "success" : "secondary"}>
                        {job.active ? "Active" : "Hidden"}
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                      <Badge variant="secondary">{platformLabels[job.platform] ?? job.platform}</Badge>
                    </div>
                    {job.description && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{job.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>{job.applicationStatuses.length} applicants</span>
                      {job.deadline && (
                        <span>Deadline {job.deadline.toLocaleDateString("en-US")}</span>
                      )}
                    </div>
                  </div>
                  <form action={toggleJobStatusAction.bind(null, job.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      {job.active ? "Hide" : "Publish"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post New Job</CardTitle>
            <CardDescription>Publish a new job listing for students</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createJobAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="e.g. SWE Intern 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select id="platform" name="platform" defaultValue="internshala">
                    {OPPORTUNITY_PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type *</Label>
                  <Select id="type" name="type" defaultValue="JOB">
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
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
                Post Job
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
