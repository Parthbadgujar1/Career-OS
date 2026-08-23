"use client";

import { useState } from "react";
import Link from "next/link";
import { submitAssessmentAction } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/lib/assessment-data";

export function AssessmentQuiz({
  setType,
  title,
  description,
  questions,
  alreadyTaken,
  score,
}: {
  setType: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  alreadyTaken: boolean;
  score?: { score: number; maxScore: number };
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    ok: boolean;
    score: number;
    maxScore: number;
    graded?: boolean;
  } | null>(
    alreadyTaken && score ? { ok: true, score: score.score, maxScore: score.maxScore } : null
  );
  const [pending, setPending] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("setType", setType);
    for (const [k, v] of Object.entries(answers)) fd.set(`q_${k}`, String(v));
    const res = await submitAssessmentAction(fd);
    if (res && "ok" in res) {
      setResult({ ok: true, score: res.score, maxScore: res.maxScore, graded: res.graded });
    }
    setPending(false);
  }

  if (result) {
    const pct = Math.round((result.score / result.maxScore) * 100);
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Badge variant="success">Completed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Score: {result.score}/{result.maxScore} ({pct}%)
          </p>
          <p className="text-sm text-slate-500">
            {pct >= 70
              ? "Strong performance — related skills were graded accordingly."
              : pct >= 40
                ? "Good start — weaker areas were graded lower and flagged in your roadmap."
                : "This is your measured baseline — related skills start at a lower grade and your roadmap builds them up."}
          </p>
          {result.graded && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-700">All tests complete 🎉</p>
              <p className="mt-0.5 text-sm text-slate-600">
                Your skills are now graded 1–5 from your performance and your personalized roadmap
                has been generated.
              </p>
              <Link href="/app" className="mt-3 inline-block">
                <Button variant="gradient" size="sm">
                  Go to your roadmap
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 text-sm font-medium">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      answers[q.id] === oi
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={oi}
                      checked={answers[q.id] === oi}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button type="submit" disabled={!allAnswered || pending} className="w-full">
            {pending ? "Grading your skills..." : `Submit ${title}`}
          </Button>
          {!allAnswered && (
            <p className="text-center text-xs text-slate-400">
              Answer all questions to submit.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
