"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth-helper";

export async function getEmployerJobsAction() {
  const user = await requireEmployer();
  const jobs = await prisma.opportunity.findMany({
    where: { postedById: user.id },
    include: {
      applicationStatuses: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return jobs.map((job) => ({
    ...job,
    applicantCount: job.applicationStatuses.length,
    applicationStatuses: undefined,
  }));
}

export async function createJobAction(formData: FormData) {
  const user = await requireEmployer();

  const title = String(formData.get("title") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  if (!title || !platform || !type || !url) return;

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await prisma.opportunity.create({
    data: {
      title,
      platform,
      type,
      url,
      description,
      tags: JSON.stringify(tags),
      eligibility: JSON.stringify([]),
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      active: true,
      postedById: user.id,
    },
  });

  revalidatePath("/employer");
  revalidatePath("/employer/jobs");
  revalidatePath("/app/opportunities");
}

export async function toggleJobStatusAction(jobId: string) {
  const user = await requireEmployer();

  const job = await prisma.opportunity.findUnique({ where: { id: jobId } });
  if (!job || job.postedById !== user.id) return;

  await prisma.opportunity.update({
    where: { id: jobId },
    data: { active: !job.active },
  });

  revalidatePath("/employer");
  revalidatePath("/employer/jobs");
  revalidatePath("/app/opportunities");
}

export async function getJobApplicantsAction(jobId: string) {
  const user = await requireEmployer();

  const job = await prisma.opportunity.findUnique({ where: { id: jobId } });
  if (!job || job.postedById !== user.id) return [];

  const applicants = await prisma.applicationStatus.findMany({
    where: { opportunityId: jobId },
    include: {
      student: {
        include: { user: { select: { name: true, email: true } } },
      },
      opportunity: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return applicants.map((a) => ({
    id: a.id,
    studentName: a.student.user.name ?? "—",
    studentEmail: a.student.user.email,
    jobTitle: a.opportunity.title,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getAllApplicantsAction() {
  const user = await requireEmployer();

  const applicants = await prisma.applicationStatus.findMany({
    where: { opportunity: { postedById: user.id } },
    include: {
      student: {
        include: { user: { select: { name: true, email: true } } },
      },
      opportunity: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return applicants.map((a) => ({
    id: a.id,
    studentName: a.student.user.name ?? "—",
    studentEmail: a.student.user.email,
    jobTitle: a.opportunity.title,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function updateApplicantStatusAction(
  applicantId: string,
  status: string
) {
  const user = await requireEmployer();

  const application = await prisma.applicationStatus.findUnique({
    where: { id: applicantId },
    include: { opportunity: { select: { postedById: true } } },
  });

  if (!application || application.opportunity.postedById !== user.id) return;

  await prisma.applicationStatus.update({
    where: { id: applicantId },
    data: { status, updatedById: user.id },
  });

  revalidatePath("/employer/applicants");
  revalidatePath("/employer");
}
