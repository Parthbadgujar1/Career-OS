"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, MessageSquare, AlertCircle, TrendingUp, X, Check } from "lucide-react";
import { Badge, Progress } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { mentorSendFeedbackAction } from "@/server/actions/mentor";

export interface MentorStudentRow {
  id: string;
  name: string;
  email: string;
  targetRole: string | null;
  readinessScore: number;
  currentStreak: number;
  onboarded: boolean;
  completionRate: number | null;
  weakSkills: string[];
  pendingTasks: number;
}

function signalFor(readiness: number): { label: string; variant: "success" | "warning" | "danger" } {
  if (readiness >= 70) return { label: "On track", variant: "success" };
  if (readiness >= 40) return { label: "Needs support", variant: "warning" };
  return { label: "Falling behind", variant: "danger" };
}

type Filter = "all" | "needs-support" | "on-track";

function FeedbackComposer({
  value,
  onChange,
  onCancel,
  onSend,
  pending,
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
  pending: boolean;
}) {
  return (
    <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
      <Textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write feedback — the student will see it as a notification..."
        className="min-h-[70px] bg-white"
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button variant="gradient" size="sm" disabled={!value.trim() || pending} onClick={onSend}>
          {pending ? "Sending..." : "Send feedback"}
          <Send className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export function MentorStudentsPanel({ students }: { students: MentorStudentRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(id);
  }, [router]);

  const filtered = useMemo(() => {
    let rows = students.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.targetRole ?? "").toLowerCase().includes(q)
      );
    }
    if (filter === "needs-support") {
      rows = rows.filter((s) => s.readinessScore < 60 || (s.completionRate ?? 100) < 50);
    }
    if (filter === "on-track") {
      rows = rows.filter((s) => s.readinessScore >= 70 && (s.completionRate ?? 100) >= 70);
    }
    return rows;
  }, [students, query, filter]);

  const needsSupport = students.filter(
    (s) => s.readinessScore < 60 || (s.completionRate ?? 100) < 50
  );
  const onTrack = students.filter(
    (s) => s.readinessScore >= 70 && (s.completionRate ?? 100) >= 70
  );

  const sendFeedback = (studentId: string) => {
    if (!feedbackText.trim()) return;
    const text = feedbackText;
    setFeedbackText("");
    setFeedbackFor(null);
    startTransition(async () => {
      await mentorSendFeedbackAction(studentId, text);
      setSent((prev) => ({ ...prev, [studentId]: true }));
      router.refresh();
    });
  };

  const composerProps = {
    value: feedbackText,
    onChange: setFeedbackText,
    onCancel: () => {
      setFeedbackFor(null);
      setFeedbackText("");
    },
    pending: isPending,
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="w-44">
          <option value="all">All Students ({students.length})</option>
          <option value="needs-support">Needs Support ({needsSupport.length})</option>
          <option value="on-track">On Track ({onTrack.length})</option>
        </Select>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · refreshes automatically
        </span>
      </div>

      {filter !== "on-track" && needsSupport.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 animate-slide-in-up">
          <div className="px-4 py-3 border-b border-amber-200/60 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Intervention list — who needs what</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200/60 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 px-4 pr-4">Student</th>
                  <th className="py-2 pr-4">Readiness</th>
                  <th className="py-2 pr-4">Signal</th>
                  <th className="py-2 pr-4">What they need</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {needsSupport.map((s) => {
                  const sig = signalFor(s.readinessScore);
                  const needs = [...s.weakSkills, ...(s.completionRate != null ? [`Completion: ${Math.round(s.completionRate)}%`] : [])].slice(0, 3);
                  return (
                    <tr key={s.id} className="border-b border-amber-100 last:border-0">
                      <td className="py-2 px-4 pr-4">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.targetRole ?? "—"}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <Progress value={s.readinessScore} className="w-20 h-2" />
                          <span className="text-xs">{s.readinessScore}/100</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={sig.variant}>{sig.label}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">
                        {needs.length > 0 ? needs.join(" · ") : "Coaching call + weekly plan review"}
                      </td>
                      <td className="py-2">
                        {sent[s.id] ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Check className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : feedbackFor === s.id ? (
                          <div className="w-64">
                            <FeedbackComposer {...composerProps} onSend={() => sendFeedback(s.id)} />
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setFeedbackFor(s.id)}>
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Feedback
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-4">Student</th>
              <th className="pb-2 pr-4">Target Role</th>
              <th className="pb-2 pr-4">Readiness</th>
              <th className="pb-2 pr-4">Weak Skills</th>
              <th className="pb-2 pr-4">Streak</th>
              <th className="pb-2 pr-4">Pending Tasks</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const sig = signalFor(s.readinessScore);
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 pr-4">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{s.targetRole ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <Progress value={s.readinessScore} className="w-20 h-2" />
                      <span className="text-xs">{s.readinessScore}/100</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {s.weakSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {s.weakSkills.length === 0 && <span className="text-xs text-slate-400">No gaps</span>}
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="font-medium text-emerald-600">{s.currentStreak}</span>
                    <span className="text-xs text-slate-400"> 🔥</span>
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{s.pendingTasks}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={sig.variant}>{sig.label}</Badge>
                  </td>
                  <td className="py-2">
                    {sent[s.id] ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check className="h-3.5 w-3.5" /> Sent
                      </span>
                    ) : feedbackFor === s.id ? (
                      <div className="w-64">
                        <FeedbackComposer {...composerProps} onSend={() => sendFeedback(s.id)} />
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setFeedbackFor(s.id)}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Feedback
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center">
          <TrendingUp className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No students assigned yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Your admin will pair you with students. Their progress will appear here automatically.
          </p>
        </div>
      )}
    </>
  );
}
