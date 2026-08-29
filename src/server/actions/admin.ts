"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helper";

export async function assignMentorAction(studentId: string, mentorId: string) {
  await requireAdmin();

  const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!student) return;

  let nextMentorId: string | null = null;
  if (mentorId) {
    const mentor = await prisma.user.findFirst({
      where: { id: mentorId, role: "MENTOR" },
      select: { id: true },
    });
    if (!mentor) return;
    nextMentorId = mentor.id;
  }

  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { mentorId: nextMentorId },
  });

  revalidatePath("/admin");
  revalidatePath("/mentor");
  revalidatePath("/app/mentor");
}

export async function updateMentorProfileAction(mentorUserId: string, formData: FormData) {
  await requireAdmin();

  const mentor = await prisma.user.findFirst({
    where: { id: mentorUserId, role: "MENTOR" },
    select: { id: true },
  });
  if (!mentor) return;

  const roles = String(formData.get("expertiseRoles") ?? "").split(",").map((r) => r.trim()).filter(Boolean);
  const industries = String(formData.get("expertiseIndustries") ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const years = Number(formData.get("yearsExperience")) || 0;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  await prisma.mentorProfile.upsert({
    where: { userId: mentorUserId },
    create: {
      userId: mentorUserId,
      expertiseRoles: roles.length > 0 ? JSON.stringify(roles) : null,
      expertiseIndustries: industries.length > 0 ? JSON.stringify(industries) : null,
      yearsExperience: years,
      bio,
    },
    update: {
      expertiseRoles: roles.length > 0 ? JSON.stringify(roles) : null,
      expertiseIndustries: industries.length > 0 ? JSON.stringify(industries) : null,
      yearsExperience: years,
      bio,
    },
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/app/mentor");
}

export async function createOpportunityAction(formData: FormData) {
  await requireAdmin();

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
    },
  });

  revalidatePath("/admin/opportunities");
  revalidatePath("/app/opportunities");
}

export async function toggleOpportunityAction(opportunityId: string) {
  await requireAdmin();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) return;
  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { active: !opportunity.active },
  });
  revalidatePath("/admin/opportunities");
  revalidatePath("/app/opportunities");
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  const endsRaw = String(formData.get("endsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const focusRolesRaw = String(formData.get("focusRoles") ?? "").trim();
  const focusIndustriesRaw = String(formData.get("focusIndustries") ?? "").trim();

  if (!title || !type || !startsRaw) return;

  const startsAt = new Date(startsRaw);
  if (Number.isNaN(startsAt.getTime())) return;

  const endsAt = endsRaw ? new Date(endsRaw) : null;

  const focusRoles = focusRolesRaw.split(",").map((t) => t.trim()).filter(Boolean);
  const focusIndustries = focusIndustriesRaw.split(",").map((t) => t.trim()).filter(Boolean);

  await prisma.event.create({
    data: {
      title,
      type,
      description,
      startsAt,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
      location,
      url,
      focusRoles: focusRoles.length > 0 ? JSON.stringify(focusRoles) : null,
      focusIndustries: focusIndustries.length > 0 ? JSON.stringify(focusIndustries) : null,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/app/events");
}

export interface BroadcastState {
  ok: boolean;
  sent: number;
  error?: string;
}

export async function broadcastNotificationAction(
  prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) {
    return { ok: false, sent: 0, error: "Title is required." };
  }

  const students = await prisma.studentProfile.findMany({ select: { id: true } });
  await prisma.notification.createMany({
    data: students.map((s) => ({
      studentId: s.id,
      type: "INFO",
      title,
      body: body || null,
    })),
  });

  revalidatePath("/app");
  revalidatePath("/app/notifications");
  revalidatePath("/admin/broadcast");
  return { ok: true, sent: students.length };
}
