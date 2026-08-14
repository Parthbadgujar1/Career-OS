"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Map,
  ClipboardCheck,
  FileText,
  FolderGit2,
  Code2,
  FileQuestion,
  Mic2,
  ExternalLink,
  BarChart3,
  Target,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/tasks", label: "Today's Tasks", icon: ListTodo },
  { href: "/app/roadmap", label: "Roadmap", icon: Map },
  { href: "/app/assessment", label: "Assessment", icon: ClipboardCheck },
  { href: "/app/reviews", label: "Resume & Profiles", icon: FileText },
  { href: "/app/projects", label: "Projects", icon: FolderGit2 },
  { href: "/app/coding", label: "Coding Practice", icon: Code2 },
  { href: "/app/placement", label: "Placement Prep", icon: Target },
  { href: "/app/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/app/interviews", label: "Mock Interviews", icon: Mic2 },
  { href: "/app/opportunities", label: "Opportunities", icon: ExternalLink },
  { href: "/app/reports", label: "Weekly Reports", icon: BarChart3 },
];

export function AppShell({
  children,
  user,
  signOutAction,
}: {
  children: React.ReactNode;
  user: { name: string; role: string; email: string };
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0 md:z-20",
          mobileOpen ? "translate-x-0 animate-slide-in-left" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
            CO
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-slate-900">Career OS</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Student Dashboard</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {NAV.map((item, i) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {item.label}
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600 animate-scale-in" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-3 py-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/app" className="md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                CO
              </span>
            </Link>
            <div>
              <p className="text-sm text-slate-500">
                Welcome back,{" "}
                <span className="font-bold text-slate-900">{user.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-100 sm:flex">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm">
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <span className="hidden text-xs font-medium text-slate-600 sm:inline">{user.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
