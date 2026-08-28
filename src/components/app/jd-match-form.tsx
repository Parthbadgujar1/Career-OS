"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { matchJdAction } from "@/server/actions/jd-match";
import { Target, CheckCircle, XCircle, Lightbulb, History } from "lucide-react";

interface JdMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  verdict: string;
}

interface HistoryEntry {
  id: string;
  jobTitle: string | null;
  company: string | null;
  matchScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  verdict: string | null;
  createdAt: string;
}

const VERDICT_BADGE: Record<string, "success" | "default" | "warning" | "danger"> = {
  strong_match: "success",
  good_match: "default",
  partial_match: "warning",
  weak_match: "danger",
};

const VERDICT_LABEL: Record<string, string> = {
  strong_match: "Strong Match",
  good_match: "Good Match",
  partial_match: "Partial Match",
  weak_match: "Weak Match",
};

export function JdMatchForm({ history }: { history: HistoryEntry[] }) {
  const [result, setResult] = useState<JdMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const jobTitle = (formData.get("jobTitle") as string) || "";
    const company = (formData.get("company") as string) || "";
    const jdText = (formData.get("jdText") as string) || "";

    if (!jdText.trim()) {
      setError("Please paste the job description.");
      setLoading(false);
      return;
    }

    const response = await matchJdAction({ jobTitle, company, jdText });

    if ("error" in response) {
      setError(response.error);
    } else {
      setResult(response.result);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">JD Match</h1>
        <p className="text-sm text-slate-500">Compare your resume against a job description to see how well you match</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Analyze Match
            </CardTitle>
            <CardDescription>Paste the job description and we will analyze your resume against it</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" placeholder="e.g. Frontend Developer" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" placeholder="e.g. Google" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jdText">Job Description *</Label>
                <Textarea
                  id="jdText"
                  name="jdText"
                  rows={10}
                  required
                  placeholder="Paste the full job description here..."
                />
              </div>
              <Button type="submit" variant="gradient" disabled={loading} className="w-full">
                {loading ? "Analyzing..." : "Analyze Match"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-indigo-600">{result.matchScore}</p>
                <p className="text-sm text-slate-500 mt-1">out of 100</p>
                <Badge
                  variant={VERDICT_BADGE[result.verdict] ?? "secondary"}
                  className="mt-2"
                >
                  {VERDICT_LABEL[result.verdict] ?? result.verdict}
                </Badge>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Matched Skills ({result.matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills.map((skill, i) => (
                    <Badge key={i} variant="success" className="text-[11px]">{skill}</Badge>
                  ))}
                  {result.matchedSkills.length === 0 && (
                    <p className="text-xs text-slate-400">No matching skills found</p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <XCircle className="h-4 w-4 text-rose-500" />
                  Missing Keywords ({result.missingKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.missingKeywords.map((kw, i) => (
                    <Badge key={i} variant="danger" className="text-[11px]">{kw}</Badge>
                  ))}
                  {result.missingKeywords.length === 0 && (
                    <p className="text-xs text-slate-400">No missing keywords</p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Suggestions
                </p>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-relaxed">
                      {i + 1}. {s}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Recent Matches
            </CardTitle>
            <CardDescription>Your last {history.length} JD match analyses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {entry.jobTitle || "Untitled"}{entry.company ? ` @ ${entry.company}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-indigo-600">{entry.matchScore}</span>
                  <Badge variant={VERDICT_BADGE[entry.verdict ?? "partial_match"] ?? "secondary"}>
                    {VERDICT_LABEL[entry.verdict ?? "partial_match"] ?? entry.verdict}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
