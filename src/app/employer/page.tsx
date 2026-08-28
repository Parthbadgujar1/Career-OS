import { requireEmployer } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmployerPage() {
  const user = await requireEmployer();

  const [jobs, allApplicants] = await Promise.all([
    prisma.opportunity.findMany({
      where: { postedById: user.id },
      include: {
        applicationStatuses: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.applicationStatus.findMany({
      where: { opportunity: { postedById: user.id } },
      select: { status: true },
    }),
  ]);

  const totalJobs = jobs.length;
  const totalApplicants = allApplicants.length;
  const hiredCount = allApplicants.filter((a) => a.status === "HIRED").length;
  const shortlistedCount = allApplicants.filter((a) => a.status === "SHORTLISTED").length;

  const jobData = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    platform: job.platform,
    active: job.active,
    applicantCount: job.applicationStatuses.length,
    createdAt: job.createdAt.toLocaleDateString("en-US"),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your job postings and applicants · {user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Jobs Posted</p>
              <Briefcase className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold">{totalJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Applicants</p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{totalApplicants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Shortlisted</p>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold text-amber-600">{shortlistedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Hired</p>
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-3xl font-bold text-emerald-600">{hiredCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Posted Jobs ({totalJobs})</CardTitle>
            <CardDescription>Your job listings and applicant counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobData.length === 0 && (
              <p className="text-sm text-slate-500">No jobs posted yet. Create your first job listing.</p>
            )}
            {jobData.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{job.title}</p>
                    <Badge variant={job.active ? "success" : "secondary"}>
                      {job.active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {job.platform} · Posted {job.createdAt}
                  </p>
                </div>
                <Badge variant="default">{job.applicantCount} applicants</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/employer/jobs"
              className="block rounded-lg border border-slate-100 p-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Manage Jobs
            </Link>
            <Link
              href="/employer/applicants"
              className="block rounded-lg border border-slate-100 p-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              Review Applicants
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
