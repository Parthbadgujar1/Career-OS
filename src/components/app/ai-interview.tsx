"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AI_QUESTION_BANK } from "@/lib/interview-data";
import { submitAiInterviewAction } from "@/server/actions/interviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Award, ClipboardList } from "lucide-react";

type AiType = "TECHNICAL" | "HR" | "BEHAVIORAL";

const TYPE_META: Record<AiType, { label: string; desc: string }> = {
  TECHNICAL: { label: "Technical", desc: "DSA, system design & code reasoning" },
  HR: { label: "HR", desc: "Career goals, strengths & expectations" },
  BEHAVIORAL: { label: "Behavioral", desc: "STAR stories, teamwork & failures" },
};

export function AiInterview({ defaultRole }: { defaultRole: string }) {
  const router = useRouter();
  const [type, setType] = useState<AiType>("TECHNICAL");
  const [role, setRole] = useState(defaultRole);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; perQuestion: Record<string, { score: number; comment: string; question: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bank = AI_QUESTION_BANK[type];
  const q = bank[current];
  const answer = answers[q?.id] ?? "";

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("type", type);
    fd.set("role", role);
    fd.set("answers", JSON.stringify(answers));
    const res = await submitAiInterviewAction(fd);
    if ("ok" in res) {
      setResult({ score: res.score, perQuestion: res.perQuestion });
      router.refresh();
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  };

  if (result) {
    const weak = Object.values(result.perQuestion).filter((g) => g.score < 50).length;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            AI Interview complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <p className="text-5xl font-bold text-indigo-600">{result.score}
              <span className="text-2xl text-slate-400">/100</span>
            </p>
            <div className="text-sm text-slate-500">
              <p>Overall score for {TYPE_META[type].label} interview</p>
              <Badge variant={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "danger"} className="mt-1">
                {result.score >= 70 ? "Strong" : result.score >= 40 ? "Developing" : "Needs practice"} · {weak} weak {weak === 1 ? "answer" : "answers"}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            {bank.map((bk) => {
              const g = result.perQuestion[bk.id];
              if (!g) return null;
              return (
                <div key={bk.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{bk.question}</p>
                    <Badge variant={g.score >= 70 ? "success" : g.score >= 40 ? "warning" : "danger"}>{g.score}/100</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{g.comment}</p>
                </div>
              );
            })}
          </div>
          <Button variant="outline" onClick={() => { setResult(null); setStarted(false); setAnswers({}); setCurrent(0); }}>
            Take another AI interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!started) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            AI Mock Interview
          </CardTitle>
          <p className="text-sm text-slate-500">
            Answer 5 questions on-screen. The AI grades you against the criteria recruiters use for your target role and saves the result to your history.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Interview type</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(TYPE_META) as AiType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    type === t ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <p className="text-sm font-semibold">{TYPE_META[t].label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{TYPE_META[t].desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="ai-role">
              Target role (drives marking criteria)
            </label>
            <input
              id="ai-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Software Developer"
            />
          </div>
          <Button variant="gradient" onClick={() => setStarted(true)}>
            <Sparkles className="h-4 w-4" />
            Start AI interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  const done = Object.keys(answers).length >= bank.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {current + 1} of {bank.length}
          </CardTitle>
          <Badge variant="secondary">{TYPE_META[type].label} · {role || "role"}</Badge>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Answer in full sentences with examples</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">{q.question}</p>
        <Textarea
          rows={5}
          value={answer}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          placeholder="Type your answer here..."
          className="min-h-28"
        />
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ArrowLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-xs text-slate-400">{Object.keys(answers).length} of {bank.length} answered</span>
          {current < bank.length - 1 ? (
            <Button onClick={() => setCurrent((c) => Math.min(bank.length - 1, c + 1))}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="gradient" onClick={submit} disabled={submitting || !done}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
              {submitting ? "Grading..." : "Submit & get feedback"}
            </Button>
          )}
        </div>
        {!done && current === bank.length - 1 && (
          <p className="text-xs text-amber-600">Answer every question before submitting for an accurate score.</p>
        )}
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        {done && <p className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> All questions answered — you can submit.</p>}
      </CardContent>
    </Card>
  );
}
