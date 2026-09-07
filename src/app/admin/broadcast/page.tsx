import { requireAdmin } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { BroadcastForm } from "@/components/admin/broadcast-form";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  await requireAdmin();
  const studentCount = await prisma.studentProfile.count();

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">Send messages that land on every student&apos;s dashboard ({studentCount} students)</p>
      </div>
      <BroadcastForm />
    </div>
  );
}
