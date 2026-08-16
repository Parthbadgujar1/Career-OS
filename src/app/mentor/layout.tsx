import { requireMentor } from "@/lib/auth-helper";
import { PortalShell } from "@/components/portal-shell";
import { signOutAction } from "@/server/actions/session";

export const dynamic = "force-dynamic";

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMentor();
  return (
    <PortalShell
      portal="mentor"
      user={{ name: user.name ?? "", email: user.email ?? "", role: user.role }}
      signOutAction={signOutAction}
    >
      {children}
    </PortalShell>
  );
}
