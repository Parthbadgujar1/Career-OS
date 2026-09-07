import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { PROGRESS_TEST_INTERVAL_DAYS } from "@/lib/engine/tests";
import { TimedTest } from "@/components/app/timed-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resetProgressTestAction } from "@/server/actions/tests";
import { CalendarClock, TrendingUp, Clock, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgressTestPage() {
  const { profile } = await requireStudentProfile();

  const attempts = await prisma.progressTestAttempt.findMany({
    where: { studentId: profile.id },
    orderBy: { completedAt: "desc" },
  });

  const last = attempts[0];
  const prev = attempts[1];
  const trend = last && prev ? last.score / last.maxScore - prev.score / prev.maxScore : null;
  const dueAt = profile.nextProgressTestDueAt;
  const overdue = dueAt && dueAt < new Date() ? true : false;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Progress Tests</h1>
        <p className="text-sm text-slate-500">
          AI tracks your growth with a 30-question test every {PROGRESS_TEST_INTERVAL_DAYS} days. Attempt it whenever you&apos;re ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4 text-indigo-600" />
              Next test due
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dueAt ? (
              <>
                <p className="text-lg font-bold text-slate-800">
                  {dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <Badge variant={overdue ? "danger" : "secondary"}>
                  {overdue ? "Overdue — take it now" : "Scheduled"}
                </Badge>
              </>
            ) : (
              <p className="text-sm text-slate-500">Generate your roadmap to schedule one.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-indigo-600" />
              Best score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length > 0 ? (
              <>
                <p className="text-lg font-bold text-slate-800">
                  {Math.max(...attempts.map((a) => Math.round((a.score / a.maxScore) * 100)))}%
                </p>
                <Badge variant="success">{attempts.length} attempts</Badge>
              </>
            ) : (
              <p className="text-sm text-slate-500">No attempts yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend === null ? (
              <p className="text-sm text-slate-500">Take 2 tests to see your trend.</p>
            ) : (
              <>
                <p className={`text-lg font-bold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {trend >= 0 ? "+" : ""}{Math.round(trend * 100)}%
                </p>
                <Badge variant={trend >= 0 ? "success" : "danger"}>
                  {trend >= 0 ? "Improving" : "Needs focus"}
                </Badge>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {dueAt && overdue && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>Your progress test is overdue. Taking it now helps the AI keep your roadmap on track.</span>
          <form action={resetProgressTestAction}>
            <Button variant="outline" size="sm" className="border-rose-300 text-rose-700 hover:bg-rose-100">
              <Clock className="mr-1.5 h-4 w-4" />
              Reset timer
            </Button>
          </form>
        </div>
      )}

      <TimedTest />

      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attempt history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attempts.map((a) => {
              const pct = Math.round((a.score / a.maxScore) * 100);
              const mins = Math.floor(a.timeSpentSec / 60);
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-surface p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={a.difficulty === "HARD" ? "danger" : a.difficulty === "EASY" ? "success" : "warning"}>
                        {a.difficulty}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-800">
                        {a.score}/{a.maxScore} correct
                      </span>
                      <span className="text-xs text-slate-400">
                        {a.completedAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="mt-2 max-w-xs">
                      <Progress value={pct} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">{pct}%</p>
                    <p className="text-xs text-slate-400">took {mins} min</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
