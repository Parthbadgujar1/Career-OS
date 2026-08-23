"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { snapshotReadiness } from "@/lib/scoring/readiness";
import { fromJson } from "@/lib/utils";

export async function updateProfileAction(
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const { user, profile } = await requireStudentProfile();

  const name = (formData.get("name") as string)?.trim();
  const degree = (formData.get("degree") as string)?.trim() || null;
  const year = (formData.get("year") as string)?.trim() || null;
  const targetRoles = fromJson<string[]>((formData.get("targetRoles") as string) ?? "[]", []);
  const targetRole =
    targetRoles[0] ?? ((formData.get("targetRole") as string)?.trim() || null);
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || null;
  const mobile = (formData.get("mobile") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const college = (formData.get("college") as string)?.trim() || null;

  if (!name) return { error: "Name is required." };
  if (mobile && !/^[0-9+\-\s]{10,15}$/.test(mobile)) {
    return { error: "Mobile number must be 10–15 digits (spaces, + and - allowed)." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: {
      degree,
      year,
      targetRole,
      targetRoles: JSON.stringify(targetRoles),
      githubUrl,
      linkedinUrl,
      mobile,
      city,
      college,
    },
  });

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { ok: true };
}

const PREFERENCE_KEYS = [
  "taskReminders",
  "weeklyReport",
  "opportunityAlerts",
  "eventReminders",
  "mentorMessages",
  "profileVisibility",
  "leaderboards",
  "shareWithMentor",
] as const;

export type PreferenceKeys = (typeof PREFERENCE_KEYS)[number];

export async function updatePreferencesAction(
  key: string,
  enabled: boolean
): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireStudentProfile();
  if (!PREFERENCE_KEYS.includes(key as PreferenceKeys)) return { error: "Unknown preference." };

  const current = fromJson<Record<string, boolean>>(profile.preferences, {});
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { preferences: JSON.stringify({ ...current, [key]: enabled }) },
  });

  revalidatePath("/app/settings");
  return { ok: true };
}

export async function getPreference(profile: { preferences: string }, key: PreferenceKeys): Promise<boolean> {
  const prefs = fromJson<Record<string, boolean>>(profile.preferences, {});
  return prefs[key] ?? true;
}
