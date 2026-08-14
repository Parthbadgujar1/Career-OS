import { requireAdmin } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="text-sm font-semibold">
            Career OS <span className="font-normal text-slate-400">· Admin</span>
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}
