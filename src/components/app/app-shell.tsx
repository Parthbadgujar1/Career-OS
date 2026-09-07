"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarClock,
  Map,
  Brain,
  FolderGit2,
  FileText,
  ClipboardCheck,
  Mic2,
  Calendar,
  BarChart3,
  Trophy,
  Users,
  Bot,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Bell,
  Timer,
  FileCheck,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/app/theme-toggle";

const NAV_GROUPS = [
  {
    group: "HOME",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/app/tasks", label: "Weekly Plan", icon: CalendarClock },
      { href: "/app/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    group: "BUILD",
    items: [
      { href: "/app/roadmap", label: "Career Roadmap", icon: Map },
      { href: "/app/skills", label: "Skills", icon: Brain },
      { href: "/app/projects", label: "Projects", icon: FolderGit2 },
      { href: "/app/reviews", label: "Resume & Profile", icon: FileText },
    ],
  },
  {
    group: "PRACTICE",
    items: [
      { href: "/app/assessment", label: "Skill Assessment", icon: ClipboardCheck },
      { href: "/app/progress-test", label: "Progress Tests", icon: Timer },
      { href: "/app/interviews", label: "Mock Interviews", icon: Mic2 },
    ],
  },
  {
    group: "OPPORTUNITIES",
    items: [
      { href: "/app/opportunities", label: "Discover", icon: Lightbulb },
      { href: "/app/jobs", label: "Job Board", icon: Briefcase },
      { href: "/app/events", label: "Events", icon: Calendar },
      { href: "/app/jd-match", label: "JD Match", icon: FileCheck },
    ],
  },
  {
    group: "GROWTH",
    items: [
      { href: "/app/reports", label: "Weekly Reports", icon: BarChart3 },
      { href: "/app/achievements", label: "Achievements", icon: Trophy },
      { href: "/app/mentor", label: "Mentor", icon: Users },
    ],
  },
];

const BOTTOM_ACTIONS = [
  { href: "/app/coach", label: "AI Career Coach", icon: Bot, primary: true },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/help", label: "Help", icon: HelpCircle },
];

export function AppShell({
  children,
  user,
  signOutAction,
  notificationCount = 0,
}: {
  children: React.ReactNode;
  user: { name: string; role: string; email: string };
  signOutAction: () => Promise<void>;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    NAV_GROUPS.map((g) => g.group)
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const isActive = (href: string, exact?: boolean): boolean =>
    exact ? pathname === href : pathname.startsWith(href);

  const groupHasActive = (items: typeof NAV_GROUPS[0]["items"]): boolean =>
    items.some((item) => isActive(item.href, item.exact));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0 md:z-20",
          mobileOpen ? "translate-x-0 animate-slide-in-left" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold font-serif text-white shadow-sm shadow-indigo-900/15">
            CO
          </div>
          <div>
            <p className="font-serif text-[17px] font-semibold leading-none tracking-tight text-slate-900">Career OS</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Student Dashboard</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.group} className="animate-fade-in-up" style={{ animationDelay: `${gi * 50}ms` }}>
              <button
                onClick={() => toggleGroup(group.group)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span>{group.group}</span>
                <span className="flex items-center gap-1">
                  {groupHasActive(group.items) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                  {expandedGroups.includes(group.group) ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </span>
              </button>
              {expandedGroups.includes(group.group) && (
                <div className="mt-1 space-y-0.5 animate-slide-in-up">
                  {group.items.map((item, ii) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                          active
                            ? "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-100"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
                        {item.href === "/app/notifications" && notificationCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {notificationCount}
                          </span>
                        )}
                        {active && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600 animate-scale-in" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 mt-4">
            {BOTTOM_ACTIONS.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  action.primary
                    ? "btn-shine bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-900/10 active:translate-y-0 active:scale-[0.97]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
                )}
                style={{ animationDelay: `${(NAV_GROUPS.length + i) * 50}ms` }}
              >
                <action.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    action.primary
                      ? "text-white group-hover:scale-110"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {action.label}
              </Link>
            ))}

            <form action={signOutAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 bg-surface/80 px-4 py-3 backdrop-blur-xl sm:px-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/app" className="md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold font-serif text-white shadow-sm">
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
            <ThemeToggle />
            <div className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100 sm:flex">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Guided by AI
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm">
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <span className="hidden text-xs font-medium text-slate-600 sm:inline">{user.email}</span>
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}