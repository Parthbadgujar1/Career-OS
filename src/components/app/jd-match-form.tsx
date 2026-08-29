"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { matchJdAction } from "@/server/actions/jd-match";
import {
  Target,
  CheckCircle,
  MinusCircle,
  XCircle,
  Gauge,
  Briefcase,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  Lightbulb,
  ListTodo,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  responsibilities: number;
}

interface NextStep {
  action: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
}

interface JdMatchResult {
  matchScore: number;
  verdict: string;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  matchBreakdown: MatchBreakdown;
  experience: { present: string[]; gap: string[]; note: string };
  education: { present: string[]; gap: string[]; note: string };
  responsibilities: { canDo: string[]; gap: string[] };
  redFlags: string[];
  proofPoints: string[];
  nextSteps: NextStep[];
  analysis: string;
  suggestions: string[];
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
  analysis: JdMatchResult | null;
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

const IMPACT_STYLES: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

function barColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-rose-500";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value}/100</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${barColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ChipSection({
  title,
  icon,
  items,
  empty,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  empty: string;
  badge: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {icon}
        {title} ({items.length}) {badge}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((s, i) => (
            <Badge key={i} className="text-[11px]">{s}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function PairSection({
  title,
  present,
  gap,
  note,
  emptyLabel,
}: {
  title: React.ReactNode;
  present: string[];
  gap: string[];
  note?: string;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="mb-1.5 text-xs font-semibold text-emerald-700">Covered by your resume</p>
          {present.length === 0 ? (
            <p className="text-xs text-slate-400">{emptyLabel}</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {present.map((s, i) => (
                <Badge key={i} variant="success" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
          <p className="mb-1.5 text-xs font-semibold text-rose-700">Missing</p>
          {gap.length === 0 ? (
            <p className="text-xs text-slate-400">Nothing missing</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {gap.map((s, i) => (
                <Badge key={i} variant="danger" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    </div>
  );
}

export function JdMatchForm({ history }: { history: HistoryEntry[] }) {
  const [result, setResult] = useState<JdMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
        <p className="text-sm text-slate-500">Paste a job description and get a detailed breakdown of how you match</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Analyze Match
          </CardTitle>
          <CardDescription>We scan your latest resume against the JD, then split the match into skills, experience, education and responsibilities</CardDescription>
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
                rows={9}
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
        <Card className="border-indigo-100">
          <CardContent className="space-y-6 p-5">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center sm:border-r sm:border-slate-100">
                <p className="text-5xl font-bold text-indigo-600">{result.matchScore}</p>
                <p className="text-sm text-slate-500 mt-1">Overall match (0-100)</p>
                <Badge variant={VERDICT_BADGE[result.verdict] ?? "secondary"} className="mt-2">
                  {VERDICT_LABEL[result.verdict] ?? result.verdict}
                </Badge>
              </div>
              <div className="sm:col-span-2 space-y-3 flex flex-col justify-center">
                {(result.matchBreakdown?.skills ?? 0) >= 0 && (
                  <div className="space-y-2">
                    <ScoreBar label="Skills" value={result.matchBreakdown.skills} />
                    <ScoreBar label="Experience" value={result.matchBreakdown.experience} />
                    <ScoreBar label="Education" value={result.matchBreakdown.education} />
                    <ScoreBar label="Responsibilities" value={result.matchBreakdown.responsibilities} />
                  </div>
                )}
              </div>
            </div>

            {result.analysis && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-slate-700 leading-relaxed">
                <span className="flex items-center gap-1.5 font-semibold text-indigo-700 mb-1">
                  <Gauge className="h-4 w-4" /> Overall assessment
                </span>
                {result.analysis}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <ChipSection
                title="Matched"
                icon={<CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                items={result.matchedSkills ?? []}
                empty="No explicit matches"
                badge={<span className="rounded bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">STRONG</span>}
              />
              <ChipSection
                title="Partial"
                icon={<MinusCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                items={result.partialSkills ?? []}
                empty="No partial matches"
                badge={<span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">IMPLIED</span>}
              />
              <ChipSection
                title="Missing"
                icon={<XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                items={result.missingSkills ?? []}
                empty="Nothing missing"
                badge={<span className="rounded bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700">GAP</span>}
              />
            </div>

            <PairSection
              title={<><Briefcase className="h-4 w-4 text-indigo-500 shrink-0" /> Experience</>}
              present={result.experience?.present ?? []}
              gap={result.experience?.gap ?? []}
              note={result.experience?.note}
              emptyLabel="No experience evidence found"
            />

            <PairSection
              title={<><GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" /> Education</>}
              present={result.education?.present ?? []}
              gap={result.education?.gap ?? []}
              note={result.education?.note}
              emptyLabel="No education overlap found"
            />

            <PairSection
              title={<><ClipboardList className="h-4 w-4 text-indigo-500 shrink-0" /> Responsibilities</>}
              present={result.responsibilities?.canDo ?? []}
              gap={result.responsibilities?.gap ?? []}
              emptyLabel="No responsibilities evidence found"
            />

            {(result.proofPoints?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                  Proof-point bullets to add to your resume
                </p>
                <ul className="space-y-1.5">
                  {result.proofPoints.map((p, i) => (
                    <li key={i} className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-xs text-slate-700 leading-relaxed">
                      {i + 1}. {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result.nextSteps?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <ListTodo className="h-4 w-4 text-indigo-500 shrink-0" />
                  Priority next steps
                </p>
                <ul className="space-y-1.5">
                  {result.nextSteps.map((s, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-2 text-xs text-slate-700 leading-relaxed">
                      <span>{i + 1}. {s.action}</span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${IMPACT_STYLES[s.impact] ?? IMPACT_STYLES.LOW}`}>
                        {s.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result.redFlags?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Red flags to fix
                </p>
                <ul className="space-y-1.5">
                  {result.redFlags.map((r, i) => (
                    <li key={i} className="rounded-lg border border-rose-100 bg-rose-50/50 p-2 text-xs text-slate-700 leading-relaxed">
                      {i + 1}. {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result.suggestions?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Tailoring tips</p>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-relaxed">
                      {i + 1}. {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Recent Matches
            </CardTitle>
            <CardDescription>Tap a match to re-open its full breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((entry) => {
              const isOpen = expanded === entry.id;
              return (
                <div key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                  >
                    <div className="min-w-0">
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
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </button>
                  {isOpen &&
                    (entry.analysis ? (
                      <div className="mt-2 rounded-b-lg border-x border-b border-slate-100 p-4">
                        <JdMatchFormDetail result={entry.analysis} />
                      </div>
                    ) : (
                      <div className="mt-2 rounded-b-lg border-x border-b border-slate-100 p-4">
                        <p className="text-sm font-semibold text-slate-700">Matched ({entry.matchedSkills.length})</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entry.matchedSkills.map((s, i) => (
                            <Badge key={`m${i}`} variant="success" className="text-[10px]">{s}</Badge>
                          ))}
                          {entry.matchedSkills.length === 0 && <p className="text-xs text-slate-400">None</p>}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700">Missing ({entry.missingKeywords.length})</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entry.missingKeywords.map((s, i) => (
                            <Badge key={`x${i}`} variant="danger" className="text-[10px]">{s}</Badge>
                          ))}
                          {entry.missingKeywords.length === 0 && <p className="text-xs text-slate-400">None</p>}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700">Tips</p>
                        <ul className="mt-1 space-y-1">
                          {entry.suggestions.map((s, i) => (
                            <li key={`s${i}`} className="text-xs text-slate-600">{i + 1}. {s}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function JdMatchFormDetail({ result }: { result: JdMatchResult }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {(result.matchBreakdown?.skills ?? 0) >= 0 && (
          <ScoreBar label="Skills" value={result.matchBreakdown.skills} />
        )}
        {(result.matchBreakdown?.experience ?? 0) >= 0 && (
          <ScoreBar label="Experience" value={result.matchBreakdown.experience} />
        )}
        {(result.matchBreakdown?.education ?? 0) >= 0 && (
          <ScoreBar label="Education" value={result.matchBreakdown.education} />
        )}
        {(result.matchBreakdown?.responsibilities ?? 0) >= 0 && (
          <ScoreBar label="Responsibilities" value={result.matchBreakdown.responsibilities} />
        )}
      </div>
      {result.analysis && (
        <p className="rounded-lg bg-indigo-50/40 p-3 text-xs text-slate-700 leading-relaxed">{result.analysis}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">Matched: {result.matchedSkills?.length ?? 0}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(result.matchedSkills ?? []).map((s, i) => (
              <Badge key={`m${i}`} variant="success" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">Partial: {result.partialSkills?.length ?? 0}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(result.partialSkills ?? []).map((s, i) => (
              <Badge key={`p${i}`} variant="warning" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">Missing: {result.missingSkills?.length ?? 0}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {(result.missingSkills ?? []).map((s, i) => (
              <Badge key={`x${i}`} variant="danger" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </div>
      </div>
      {(result.nextSteps ?? []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-700">Next steps</p>
          <ul className="mt-1 space-y-1">
            {result.nextSteps.map((s, i) => (
              <li key={`n${i}`} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span>{i + 1}. {s.action}</span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${IMPACT_STYLES[s.impact] ?? IMPACT_STYLES.LOW}`}>
                  {s.impact}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}