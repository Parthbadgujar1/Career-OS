"use client";

import { useState } from "react";
import { submitQuizAction } from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Question = { q: string; options: string[]; answer: number };

export function QuizCard({
  quiz,
  taken,
  lastScore,
}: {
  quiz: { id: string; title: string; topic: string; difficulty: string; questions: Question[] };
  taken: boolean;
  lastScore?: number;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(lastScore ?? null);
  const [pending, setPending] = useState(false);

  const allAnswered = quiz.questions.length > 0 && quiz.questions.every((_, i) => answers[i] !== undefined);

  async function submit() {
    setPending(true);
    const res = await submitQuizAction(quiz.id, answers);
    if (res && "ok" in res) setResult(res.score);
    setPending(false);
  }

  if (result !== null && taken) {
    const pct = Math.round((result / quiz.questions.length) * 100);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-medium">{quiz.title}</p>
          <Badge variant={pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger"}>
            {result}/{quiz.questions.length}
          </Badge>
        </div>
        <p className="text-xs text-slate-400">{quiz.topic}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-medium">{quiz.title}</p>
          <p className="text-xs text-slate-400">
            {quiz.topic} · {quiz.questions.length} questions · {quiz.difficulty}
          </p>
        </div>
        <Badge variant="secondary">{quiz.difficulty}</Badge>
      </div>

      {quiz.questions.length === 0 ? (
        <p className="text-sm text-slate-400">No questions loaded.</p>
      ) : (
        <div className="space-y-4">
          {quiz.questions.map((q, qi) => (
            <div key={qi}>
              <p className="mb-1.5 text-sm font-medium">
                {qi + 1}. {q.q}
              </p>
              <div className="space-y-1">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                      answers[qi] === oi
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      checked={answers[qi] === oi}
                      onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className="h-3.5 w-3.5 accent-indigo-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={submit} disabled={!allAnswered || pending} className="w-full">
            {pending ? "Submitting..." : "Submit quiz"}
          </Button>
          {!allAnswered && <p className="text-center text-xs text-slate-400">Answer all questions to submit.</p>}
        </div>
      )}
    </div>
  );
}
