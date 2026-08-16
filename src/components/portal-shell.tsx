"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X, Sparkles, LayoutDashboard, Users, BarChart3, Activity, Briefcase, CalendarDays, Megaphone, Brain, MessageSquare, Mic2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface PortalNavGroup {
  group: string;
  items: PortalNavItem[];
}

const PORTAL_NAV: Record<"admin" | "mentor", PortalNavGroup[]> = {
  admin: [
    {
      group: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/admin#students", label: "All Students", icon: Users },
        { href: "/admin/reports", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      group: "Management",
      items: [
        { href: "/admin/mentors", label: "Mentors", icon: Users },
        { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
        { href: "/admin/events", label: "Events", icon: CalendarDays },
        { href: "/admin/broadcast", label: "Announcements", icon: Megaphone },
      ],
    },
  ],
  mentor: [
    {
      group: "Overview",
      items: [
        { href: "/mentor", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/mentor#mentees", label: "Mentees", icon: Users },
        { href: "/mentor#activity", label: "Recent Activity", icon: Activity },
      ],
    },
    {
      group: "Management",
      items: [
        { href: "/mentor/skills", label: "Skill Gaps", icon: Brain },
        { href: "/mentor/reports", label: "Mentee Reports", icon: BarChart3 },
        { href: "/mentor/feedback", label: "Feedback History", icon: MessageSquare },
        { href: "/mentor/interviews", label: "Mock Interviews", icon: Mic2 },
      ],
    },
  ],
};

export function PortalShell({
  children,
  portal,
  user,
  signOutAction,
}: {
  children: React.ReactNode;
  portal: "admin" | "mentor";
  user: { name: string; email: string; role: string };
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navGroups = PORTAL_NAV[portal];
  const title = portal === "admin" ? "Admin Dashboard" : "Mentor Dashboard";

  const isActive = (item: PortalNavItem): boolean => {
    if (item.href.includes("#")) {
      return pathname === item.href.split("#")[0];
    }
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  };

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
            <p className="text-[11px] text-slate-400 mt-0.5">{title}</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {navGroups.map((group, gi) => (
            <div key={group.group} className="animate-fade-in-up" style={{ animationDelay: `${gi * 50}ms` }}>
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.group}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item, ii) => {
                  const active = isActive(item);
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
                      style={{ animationDelay: `${ii * 30}ms` }}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-all duration-200",
                          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      {item.label}
                      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600 animate-scale-in" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100">
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
            <div>
              <p className="text-sm text-slate-500">
                Welcome back, <span className="font-bold text-slate-900">{user.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-cyan-50 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-100 sm:flex">
              <Sparkles className="h-3 w-3" />
              {user.role} Portal
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
