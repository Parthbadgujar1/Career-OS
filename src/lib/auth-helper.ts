import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function requireStudentProfile() {
  const user = await requireUser();
  if (user.role !== ROLES.STUDENT) redirect("/app");
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/app/assessment");
  return { user, profile };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) redirect("/app");
  return user;
}

export async function requireEmployer() {
  const user = await requireUser();
  if (user.role !== ROLES.EMPLOYER && user.role !== ROLES.ADMIN) redirect("/app");
  return user;
}

export async function requireMentor() {
  const user = await requireUser();
  if (user.role !== ROLES.MENTOR && user.role !== ROLES.ADMIN) redirect("/app");
  return user;
}
