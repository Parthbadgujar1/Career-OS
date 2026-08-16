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

  if (!name) return { error: "Name is required." };

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
    },
  });

  await snapshotReadiness(prisma, profile.id);
  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { ok: true };
}
