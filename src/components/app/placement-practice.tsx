"use client";

import { useState } from "react";
import { submitAptitudePracticeAction } from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PracticeSet } from "@/lib/assessment-data";

export function AptitudePracticeCard({
  set,
  taken,
}: {
  set: PracticeSet;
  taken?: { score: number; maxScore: number };
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(
    taken ?? null
  );
  const [pending, setPending] = useState(false);

  const allAnswered = set.questions.every((q) => answers[q.id] !== undefined);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("setKey", set.key);
    for (const [k, v] of Object.entries(answers)) fd.set(`q_${k}`, String(v));
    const res = await submitAptitudePracticeAction(fd);
    if (res && "ok" in res) {
      setResult({ score: res.score, maxScore: res.maxScore });
    }
    setPending(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{set.title}</CardTitle>
            <CardDescription>{set.description}</CardDescription>
          </div>
          {result && <Badge variant="success">Best {result.score}/{result.maxScore}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">
              Score: {result.score}/{result.maxScore}
            </p>
            <p className="text-sm text-slate-500">
              {result.score / result.maxScore >= 0.7
                ? "Great work — you are placement-aptitude ready."
                : "Keep practicing. Weak aptitude questions are the most common shortlisting filter."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              Practice again
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {set.questions.map((q, qi) => (
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
              {pending ? "Submitting..." : "Submit practice"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
