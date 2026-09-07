import { getJobBoardAction } from "@/server/actions/applications";
import { JobBoard } from "@/components/app/job-board";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const data = await getJobBoardAction();

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Job Board</h1>
        <p className="text-sm text-slate-500">
          Employer-posted roles matched to your degree, skills and target role. Save roles and track your applications.
        </p>
      </div>
      <JobBoard initial={data} />
    </div>
  );
}