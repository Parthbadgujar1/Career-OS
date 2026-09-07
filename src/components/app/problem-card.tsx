"use client";

import { useState } from "react";
import { recordCodingSubmissionAction, getAiCodingFeedbackAction } from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export function ProblemCard({
  problem,
  solved,
}: {
  problem: { id: string; title: string; topic: string; difficulty: string; description: string; starterCode: string | null; solution: string | null };
  solved: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    correctness: string;
    feedback: string;
    timeComplexity: string;
    spaceComplexity: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  async function submit(status: string) {
    setPending(true);
    await recordCodingSubmissionAction(problem.id, status, code);
    setPending(false);
    setOpen(false);
  }

  async function requestAiReview() {
    if (loadingAi) return;
    setLoadingAi(true);
    setAiError("");
    setAiFeedback(null);
    try {
      const res = await getAiCodingFeedbackAction(problem.id, code);
      if ("error" in res) {
        setAiError(res.error);
      } else {
        setAiFeedback(res);
      }
    } catch {
      setAiError("Failed to fetch feedback from AI. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  }

  const diffVariant = problem.difficulty === "EASY" ? "success" : problem.difficulty === "MEDIUM" ? "warning" : "danger";

  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-4 shadow-sm">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-medium">{problem.title}</p>
          <p className="text-xs text-slate-400">
            {problem.topic} · {problem.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {solved && <Badge variant="success">Solved</Badge>}
          <Badge variant={diffVariant}>{problem.difficulty}</Badge>
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-600">{problem.description}</p>
          {problem.starterCode && (
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {problem.starterCode}
            </pre>
          )}
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={5}
            placeholder="Paste or write your solution here (optional)..."
          />
          {problem.solution && (
            <details className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <summary className="cursor-pointer text-xs font-semibold text-slate-500">
                View hint / approach
              </summary>
              <p className="mt-2">{problem.solution}</p>
            </details>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => submit("ATTEMPTED")} disabled={pending || loadingAi}>
              Attempted
            </Button>
            <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50/50 hover:text-indigo-800" onClick={requestAiReview} disabled={pending || loadingAi}>
              {loadingAi ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                  Ask AI for Review
                </>
              )}
            </Button>
            <Button size="sm" onClick={() => submit("SOLVED")} disabled={pending || loadingAi}>
              Solved it
            </Button>
          </div>

          {aiError && (
            <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-50/50 p-2 rounded-lg border border-rose-100">
              {aiError}
            </p>
          )}

          {aiFeedback && (
            <div className="mt-3 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm text-sm space-y-3 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                  AI Code Review
                </span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px] bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100/50 border border-indigo-100">
                    Time: {aiFeedback.timeComplexity}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] bg-purple-100/50 text-purple-700 hover:bg-purple-100/50 border border-purple-100">
                    Space: {aiFeedback.spaceComplexity}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Correctness</p>
                  <p className="mt-0.5 text-slate-700 leading-relaxed font-medium">{aiFeedback.correctness}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Suggestions & Hints</p>
                  <p className="mt-0.5 text-slate-600 leading-relaxed whitespace-pre-line">{aiFeedback.feedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
