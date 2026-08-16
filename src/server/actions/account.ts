"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helper";

export async function deleteAccountAction() {
  const user = await requireUser();
  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/login" });
}
