"use client";

import { useState } from "react";
import { recordCodingSubmissionAction } from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";

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

  async function submit(status: string) {
    setPending(true);
    await recordCodingSubmissionAction(problem.id, status, code);
    setPending(false);
    setOpen(false);
  }

  const diffVariant = problem.difficulty === "EASY" ? "success" : problem.difficulty === "MEDIUM" ? "warning" : "danger";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => submit("ATTEMPTED")} disabled={pending}>
              Attempted
            </Button>
            <Button size="sm" onClick={() => submit("SOLVED")} disabled={pending}>
              Solved it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
