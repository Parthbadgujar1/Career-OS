"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { matchOpportunities } from "@/lib/engine/opportunities";
import { fromJson } from "@/lib/utils";

export type JobBoardData = {
  jobs: Array<{
    id: string;
    title: string;
    platform: string;
    type: string;
    url: string;
    description: string | null;
    tags: string[];
    location: string | null;
    stipend: string | null;
    deadline: string | null;
    score: number;
    saved: boolean;
    applied: boolean;
  }>;
  applications: Array<{
    id: string;
    jobTitle: string;
    url: string;
    status: string;
    updatedAt: string;
  }>;
};

export async function getJobBoardAction(): Promise<JobBoardData> {
  const { profile } = await requireStudentProfile();

  const [scored, actions, applications] = await Promise.all([
    matchOpportunities(prisma, profile.id),
    prisma.opportunityAction.findMany({ where: { studentId: profile.id } }),
    prisma.applicationStatus.findMany({
      where: { studentId: profile.id },
      include: { opportunity: { select: { title: true, url: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const actionSet = new Set(actions.map((a) => `${a.opportunityId}:${a.action}`));

  return {
    jobs: scored.map(({ opportunity, score }) => ({
      id: opportunity.id,
      title: opportunity.title,
      platform: opportunity.platform,
      type: opportunity.type,
      url: opportunity.url,
      description: opportunity.description,
      tags: fromJson<string[]>(opportunity.tags, []),
      location: opportunity.location,
      stipend: opportunity.stipend,
      deadline: opportunity.deadline?.toISOString() ?? null,
      score,
      saved: actionSet.has(`${opportunity.id}:SAVED`),
      applied: actionSet.has(`${opportunity.id}:APPLIED`),
    })),
    applications: applications.map((a) => ({
      id: a.id,
      jobTitle: a.opportunity.title,
      url: a.opportunity.url,
      status: a.status,
      updatedAt: a.updatedAt.toISOString(),
    })),
  };
}

export type JobAction = "SAVED" | "APPLIED";

export async function recordOpportunityActionAction(
  opportunityId: string,
  action: JobAction
): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireStudentProfile();

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity || !opportunity.active) {
    return { error: "Opportunity not found." };
  }

  if (action === "APPLIED") {
    await prisma.$transaction([
      prisma.opportunityAction.upsert({
        where: {
          studentId_opportunityId_action: { studentId: profile.id, opportunityId, action },
        },
        create: { studentId: profile.id, opportunityId, action },
        update: {},
      }),
      // Never clobber an employer's pipeline decision (SHORTLISTED, OFFER…).
      prisma.applicationStatus.upsert({
        where: { studentId_opportunityId: { studentId: profile.id, opportunityId } },
        create: { studentId: profile.id, opportunityId, status: "APPLIED" },
        update: {},
      }),
    ]);
  } else {
    await prisma.opportunityAction.upsert({
      where: {
        studentId_opportunityId_action: { studentId: profile.id, opportunityId, action },
      },
      create: { studentId: profile.id, opportunityId, action },
      update: {},
    });
  }

  revalidatePath("/app/jobs");
  revalidatePath("/employer");
  revalidatePath("/employer/jobs");
  revalidatePath("/employer/applicants");
  return { ok: true };
}

export async function clearOpportunityActionAction(
  opportunityId: string,
  action: JobAction
): Promise<{ ok: true }> {
  const { profile } = await requireStudentProfile();

  await prisma.opportunityAction.deleteMany({
    where: { studentId: profile.id, opportunityId, action },
  });

  revalidatePath("/app/jobs");
  return { ok: true };
}