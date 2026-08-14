import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app/app-shell";
import { signOutAction } from "@/server/actions/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(user.role === "ADMIN" ? "/admin" : "/mentor");

  return (
    <AppShell
      user={{
        name: user.name,
        role: user.role,
        email: user.email,
      }}
      signOutAction={signOutAction}
    >
      {children}
    </AppShell>
  );
}
