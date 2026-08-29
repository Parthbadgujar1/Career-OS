import { prisma } from "@/lib/prisma";
import { requireStudentProfile } from "@/lib/auth-helper";
import { bumpStreak, ensureWeeklyTasks } from "@/lib/engine/tasks";
import { completeTaskAction, skipTaskAction, ensureTasksAction } from "@/server/actions/tasks";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, weekLabel } from "@/lib/utils";
import { RefreshCw, CheckCircle2, ListTodo, CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { profile } = await requireStudentProfile();
  const tasks = await ensureWeeklyTasks(prisma, profile.id);
  const streak = await bumpStreak(prisma, profile.id);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pending = tasks.filter((t) => t.status === "PENDING");
  const done = tasks.filter((t) => t.status === "COMPLETED");
  const skipped = tasks.filter((t) => t.status === "SKIPPED");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-indigo-500" />
            Weekly Plan
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <CalendarRange className="h-3.5 w-3.5 text-indigo-400" />
            {weekLabel()} &middot; every milestone is a roadmap item — complete the week, then the next week starts
          </p>
          <Badge variant="warning" className="mt-2 animate-pop-in">
            <span className="animate-bounce-gentle inline-block mr-1">🔥</span> {streak}-day streak &middot; best {profile.bestStreak}
          </Badge>
        </div>
        <form action={ensureTasksAction}>
          <Button type="submit" variant="outline" size="sm" className="group">
            <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            Refresh plan
          </Button>
        </form>
      </div>

      <Card className="animate-fade-in-up delay-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Weekly progress
            </CardTitle>
            <span className="text-sm font-bold text-indigo-600">
              {completed}/{total}
            </span>
          </div>
          <Progress value={pct} />
          {pct === 100 && total > 0 ? (
            <p className="text-sm font-semibold text-emerald-600">
              Week complete — your next week&apos;s milestones are ready on the roadmap.
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Mark each task done to tick it off in the roadmap. Skipping also advances the week.
            </p>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {pending.length === 0 && done.length === 0 && skipped.length === 0 && (
          <Card className="animate-fade-in-up">
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <ListTodo className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {formatDate(new Date())} &middot; No tasks scheduled for this week.
              </p>
            </div>
          </Card>
        )}
        {pending.map((t, i) => (
          <div
            key={t.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:bg-indigo-50/20 animate-fade-in-up"
            style={{ animationDelay: `${150 + i * 60}ms` }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={
                    t.priority === "HIGH"
                      ? "danger"
                      : t.priority === "LOW"
                        ? "secondary"
                        : "default"
                  }
                  className="text-[10px]"
                >
                  {t.priority}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS]}</Badge>
                {t.rolloverCount > 0 && (
                  <Badge variant="warning" className="text-[10px]">Rolled over ×{t.rolloverCount}</Badge>
                )}
              </div>
              <p className="mt-2 font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">{t.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <form action={skipTaskAction.bind(null, t.id)}>
                <Button type="submit" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">Skip</Button>
              </form>
              <form action={completeTaskAction.bind(null, t.id)}>
                <Button type="submit" size="sm" variant="gradient">Done</Button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <div className="animate-fade-in-up delay-300">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Completed this week
          </h2>
          <div className="space-y-2">
            {done.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 px-4 py-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                  ✓
                </span>
                <p className="text-sm text-slate-400 line-through">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="animate-fade-in-up delay-350">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            Skipped
          </h2>
          <div className="space-y-2">
            {skipped.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 px-4 py-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <p className="text-sm text-slate-400 line-through">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
