import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { ApplicationsPanel, type ApplicationRow } from "@/components/app/applications-panel";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const { profile } = await requireStudentProfile();

  const actions = await prisma.opportunityAction.findMany({
    where: { studentId: profile.id, action: { in: ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "COMPLETED"] } },
    include: { opportunity: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: ApplicationRow[] = actions.map((a) => ({
    id: a.id,
    title: a.opportunity.title,
    platform: a.opportunity.platform,
    type: a.opportunity.type,
    status: a.action,
    appliedDate: a.createdAt.toISOString(),
    url: a.opportunity.url,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications Tracker</h1>
          <p className="text-sm text-slate-500">Every saved and applied opportunity, live from your activity</p>
        </div>
        <Link href="/app/opportunities">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Opportunities
          </Button>
        </Link>
      </div>

      <ApplicationsPanel applications={rows} />
    </div>
  );
}
