"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_BANK, PROGRESS_TEST_QUESTIONS, PROGRESS_TEST_MINUTES, type TestDifficulty, type TestQuestion } from "@/lib/test-bank";
import { submitProgressTestAction } from "@/server/actions/tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Award, Loader2 } from "lucide-react";

const DIFFICULTY_META: Record<TestDifficulty, { label: string; desc: string; variant: "success" | "warning" | "danger" }> = {
  EASY: { label: "Easy", desc: "Fundamentals & basics", variant: "success" },
  MEDIUM: { label: "Medium", desc: "Applied knowledge", variant: "warning" },
  HARD: { label: "Hard", desc: "Advanced & tricky", variant: "danger" },
};

export function TimedTest() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<TestDifficulty>("MEDIUM");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(PROGRESS_TEST_MINUTES * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ difficulty: string; score: number; maxScore: number; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo<TestQuestion[]>(() => TEST_BANK[difficulty] ?? TEST_BANK.MEDIUM, [difficulty]);

  const submitRef = useRef<() => Promise<void>>(async () => {});

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("difficulty", difficulty);
    fd.set("answers", JSON.stringify(answers));
    fd.set("timeSpentSec", String(PROGRESS_TEST_MINUTES * 60 - timeLeft));
    const res = await submitProgressTestAction(fd);
    if ("ok" in res) {
      setResult(res);
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    if (!started || submitting || result) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setTimeout(() => {
            submitRef.current();
          }, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, submitting, result]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-in-up">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              Test complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-indigo-600">
                  {result.percent}
                  <span className="text-2xl text-slate-400">%</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {result.score}/{result.maxScore} correct
                </p>
              </div>
              <div className="h-16 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-sm text-slate-500">Difficulty</p>
                <Badge variant={DIFFICULTY_META[result.difficulty as TestDifficulty]?.variant ?? "secondary"}>
                  {DIFFICULTY_META[result.difficulty as TestDifficulty]?.label ?? result.difficulty}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              {result.percent >= 70
                ? "Great progress! You're moving well — keep the momentum and review your weak topics before the next test."
                : result.percent >= 40
                  ? "Decent attempt. Focus on the topics you missed below and retake in 15 days to see improvement."
                  : "Don't worry — this identifies exactly what to revise. Use your roadmap's learning milestones and retake in 15 days."}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Topics to review</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.topic)
                  )
                ).map((t) => (
                  <Badge key={t} variant="warning">{t}</Badge>
                ))}
                {Array.from(new Set(questions.map((q) => q.topic))).every((t) =>
                  questions.filter((q) => q.topic === t).every((q) => answers[q.id] === q.answer)
                ) ? (
                  <Badge variant="success">Nothing — perfect score!</Badge>
                ) : null}
              </div>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); setStarted(false); setAnswers({}); setTimeLeft(PROGRESS_TEST_MINUTES * 60); setCurrent(0); }}>
              Take another test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Progress Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-slate-600">
            {PROGRESS_TEST_QUESTIONS} questions · {PROGRESS_TEST_MINUTES} minutes · auto-submits when time runs out.
            Attempt it at a time that suits you — your score is tracked over time so you can see real progress.
          </p>
          <div>
            <p className="mb-2 text-sm font-semibold">Choose difficulty</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(TEST_BANK) as TestDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    difficulty === d
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "border-slate-200 bg-surface hover:border-slate-300"
                  )}
                >
                  <p className="font-semibold">{DIFFICULTY_META[d].label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{DIFFICULTY_META[d].desc}</p>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => setStarted(true)}>
            Start test — {PROGRESS_TEST_MINUTES} min timer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = questions[current];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">
            Question {current + 1} of {questions.length}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant={DIFFICULTY_META[difficulty].variant}>{DIFFICULTY_META[difficulty].label}</Badge>
            <span className={cn("flex items-center gap-1 text-sm font-semibold tabular-nums", timeLeft < 120 ? "text-rose-600 animate-pulse" : "text-slate-600")}>
              <Clock className="h-4 w-4" />
              {mm}:{ss}
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{q.topic}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-all",
                answers[q.id] === idx
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-surface hover:border-slate-300"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  answers[q.id] === idx ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {questions.map((question, i) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-8 w-8 rounded-md text-xs font-semibold transition-colors",
                  i === current
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                    : answers[question.id] !== undefined
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              Prev
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit test"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{Object.keys(answers).length} of {questions.length} answered</span>
          {timeLeft === 0 && !submitting && (
            <button type="button" onClick={submit} className="font-semibold text-rose-600 underline">
              <XCircle className="mr-1 inline h-3.5 w-3.5" />
              Time&apos;s up — submit now
            </button>
          )}
        </div>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
