import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app/app-shell";
import { OnboardedGuard } from "@/components/app/onboarded-guard";
import { signOutAction } from "@/server/actions/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(user.role === "ADMIN" ? "/admin" : "/mentor");

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });

  // New users don't see the sidebar until they complete onboarding.
  if (!profile?.onboardedAt) {
    return (
      <OnboardedGuard onboarded={false}>
        <main className="flex flex-1 flex-col px-6 py-10">{children}</main>
      </OnboardedGuard>
    );
  }

  const unreadCount = profile
    ? await prisma.notification.count({ where: { studentId: profile.id, read: false } })
    : 0;

  return (
    <AppShell
      user={{
        name: user.name,
        role: user.role,
        email: user.email,
      }}
      signOutAction={signOutAction}
      notificationCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
