"use client";

import { useState } from "react";
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
  const [result, setResult] = useState<{ ok: boolean; score: number; maxScore: number } | null>(
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
      setResult({ ok: true, score: res.score, maxScore: res.maxScore });
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
            Score: {result.score}/{result.maxScore}
          </p>
          <p className="text-sm text-slate-500">
            {pct >= 70
              ? "Strong baseline. Your roadmap will focus on advanced topics."
              : pct >= 40
                ? "Good starting point. Your roadmap will strengthen these foundations."
                : "Don't worry — this is your baseline. The roadmap starts from here and builds you up."}
          </p>
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
            {pending ? "Submitting..." : `Submit ${title}`}
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
