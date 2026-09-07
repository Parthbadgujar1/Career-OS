"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startAssessmentAction, submitRoundAction } from "@/server/actions/skills-assessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, Loader2, Map as MapIcon } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  topic: string;
  skillArea: string;
  difficulty: string;
}

interface Grade {
  name: string;
  category: string;
  grade: number;
  confidence: number;
  reasoning: string;
}

interface AssessmentResult {
  grades: Grade[];
  overallScore: number;
  summary: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendedPath: string;
}

const GRADE_COLORS: Record<number, string> = {
  1: "bg-rose-100 text-rose-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-emerald-100 text-emerald-700",
  5: "bg-indigo-100 text-indigo-700",
};

const GRADE_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Beginner",
  3: "Developing",
  4: "Proficient",
  5: "Expert",
};

export function AdaptiveAssessment() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "loading" | "round1" | "round2" | "grading" | "done">("idle");
  const [round1Questions, setRound1Questions] = useState<Question[]>([]);
  const [round2Questions, setRound2Questions] = useState<Question[]>([]);
  const [round1Answers, setRound1Answers] = useState<Record<string, number>>({});
  const [round2Answers, setRound2Answers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startAssessment = () => {
    setError(null);
    startTransition(async () => {
      setPhase("loading");
      const res = await startAssessmentAction();
      if ("error" in res) {
        setError(res.error);
        setPhase("idle");
        return;
      }
      setRound1Questions(res.questions);
      setPhase("round1");
    });
  };

  const submitRound1 = () => {
    const allAnswered = round1Questions.every((q) => round1Answers[q.id] !== undefined);
    if (!allAnswered) return;

    setError(null);
    startTransition(async () => {
      setPhase("loading");
      const answers = round1Questions.map((q) => ({
        questionId: q.id,
        answered: round1Answers[q.id],
        question: q.question,
        topic: q.topic,
        skillArea: q.skillArea,
        difficulty: q.difficulty,
      }));

      const res = await submitRoundAction(0, answers);
      if ("error" in res) {
        setError(res.error);
        setPhase("round1");
        return;
      }
      if ("nextQuestions" in res) {
        setRound2Questions(res.nextQuestions);
        setPhase("round2");
      }
    });
  };

  const submitRound2 = () => {
    const allAnswered = round2Questions.every((q) => round2Answers[q.id] !== undefined);
    if (!allAnswered) return;

    setError(null);
    startTransition(async () => {
      setPhase("grading");
      const answers = round2Questions.map((q) => ({
        questionId: q.id,
        answered: round2Answers[q.id],
        question: q.question,
        topic: q.topic,
        skillArea: q.skillArea,
        difficulty: q.difficulty,
      }));

      const res = await submitRoundAction(1, answers);
      if ("error" in res) {
        setError(res.error);
        setPhase("round2");
        return;
      }
      if ("done" in res) {
        setResult(res.result);
        setPhase("done");
      }
    });
  };

  const currentQuestions = phase === "round1" ? round1Questions : round2Questions;
  const currentAnswers = phase === "round1" ? round1Answers : round2Answers;
  const setCurrentAnswers = phase === "round1" ? setRound1Answers : setRound2Answers;
  const roundLabel = phase === "round1" ? "Round 1: Baseline" : "Round 2: Deep Dive";
  const allCurrentAnswered = currentQuestions.every((q) => currentAnswers[q.id] !== undefined);

  // ── Idle state ──
  if (phase === "idle") {
    return (
      <Card className="border-indigo-100 bg-surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-900/10">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Skill Assessment</CardTitle>
              <CardDescription>Adaptive questions that grade your real skills</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-surface p-4">
            <h3 className="text-sm font-semibold text-slate-800">How it works</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">1</span>
                <span><strong>10 baseline questions</strong> matched to your specialization and target role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">2</span>
                <span><strong>5 adaptive follow-ups</strong> that dig into your weak areas at the right difficulty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">3</span>
                <span><strong>AI grades every skill 1-5</strong> from your answers — no self-rating needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">4</span>
                <span><strong>Personalized roadmap</strong> generated based on your skill gaps and chosen path</span>
              </li>
            </ul>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          <Button onClick={startAssessment} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing questions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Skill Assessment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Loading ──
  if (phase === "loading") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            {phase === "loading" && "AI is generating personalized questions..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Grading ──
  if (phase === "grading") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">AI is grading your skills...</p>
          <p className="mt-1 text-xs text-slate-400">Analyzing all responses and building your skill profile</p>
        </CardContent>
      </Card>
    );
  }

  // ── Results ──
  if (phase === "done" && result) {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div>
                <CardTitle>Assessment Complete</CardTitle>
                <CardDescription>Your skills have been graded from your performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-700">{result.overallScore}</p>
                <p className="text-xs text-slate-500">Overall Score</p>
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-3">
                <p className="text-sm text-slate-600">{result.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Grades</CardTitle>
            <CardDescription>Graded 1-5 by AI from your assessment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.grades.map((g) => (
                <div key={g.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-surface p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.category}</p>
                  </div>
                  <Badge className={cn("shrink-0", GRADE_COLORS[g.grade])}>
                    {g.grade}/5 {GRADE_LABELS[g.grade]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {result.weakAreas.length > 0 && (
          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle className="text-amber-700">Areas to Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.weakAreas.map((area) => (
                  <Badge key={area} variant="warning">{area}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="text-indigo-700">Recommended Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{result.recommendedPath}</p>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => router.push("/app/roadmap")}>
                <MapIcon className="h-4 w-4 mr-2" />
                View Roadmap
              </Button>
              <Button variant="outline" onClick={() => router.push("/app/skills")}>
                View Skills
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Question rounds ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{roundLabel}</h2>
          <p className="text-sm text-slate-500">
            {phase === "round1" ? "10 questions to establish your baseline" : "5 questions targeting your weak areas"}
          </p>
        </div>
        <Badge variant={phase === "round1" ? "default" : "indigo"}>
          {Object.keys(currentAnswers).length}/{currentQuestions.length} answered
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {currentQuestions.map((q, qi) => (
        <Card key={q.id} className={cn(
          "transition-all",
          currentAnswers[q.id] !== undefined ? "border-emerald-100" : "border-slate-200"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-slate-800">
                {qi + 1}. {q.question}
              </p>
              <div className="flex gap-1.5 shrink-0">
                <Badge variant="secondary" className="text-[10px]">{q.skillArea}</Badge>
                <Badge variant={q.difficulty === "HARD" ? "danger" : q.difficulty === "MEDIUM" ? "warning" : "default"} className="text-[10px]">
                  {q.difficulty}
                </Badge>
              </div>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setCurrentAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    currentAnswers[q.id] === oi
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    currentAnswers[q.id] === oi
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 text-slate-500"
                  )}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button
          onClick={phase === "round1" ? submitRound1 : submitRound2}
          disabled={!allCurrentAnswered || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : phase === "round1" ? (
            <ArrowRight className="h-4 w-4 mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {phase === "round1" ? "Continue to Round 2" : "Grade My Skills"}
        </Button>
      </div>
    </div>
  );
}
