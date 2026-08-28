import { requireEmployer } from "@/lib/auth-helper";
import { PortalShell } from "@/components/portal-shell";
import { signOutAction } from "@/server/actions/session";

export const dynamic = "force-dynamic";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireEmployer();
  return (
    <PortalShell
      portal="employer"
      user={{ name: user.name ?? "", email: user.email ?? "", role: user.role }}
      signOutAction={signOutAction}
    >
      {children}
    </PortalShell>
  );
}
