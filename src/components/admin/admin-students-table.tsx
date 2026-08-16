"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Badge, Progress } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { assignMentorAction } from "@/server/actions/admin";

export interface AdminStudentRow {
  id: string;
  name: string;
  email: string;
  targetRole: string | null;
  readinessScore: number;
  mentorId: string | null;
  mentorName: string | null;
  onboardedAt: Date | null;
  createdAt: string;
  createdLabel: string;
}

export interface AdminMentorOption {
  id: string;
  name: string;
  assignedCount: number;
}

type SortKey = "recent" | "readiness-desc" | "readiness-asc";
type StatusFilter = "all" | "onboarded" | "pending";

export function AdminStudentsTable({
  students,
  mentors,
}: {
  students: AdminStudentRow[];
  mentors: AdminMentorOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let rows = students.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.targetRole ?? "").toLowerCase().includes(q) ||
          (s.mentorName ?? "").toLowerCase().includes(q)
      );
    }
    if (status === "onboarded") rows = rows.filter((s) => s.onboardedAt);
    if (status === "pending") rows = rows.filter((s) => !s.onboardedAt);
    rows.sort((a, b) => {
      if (sort === "readiness-desc") return b.readinessScore - a.readinessScore;
      if (sort === "readiness-asc") return a.readinessScore - b.readinessScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return rows;
  }, [students, query, status, sort]);

  const assignMentor = (studentId: string, mentorId: string) => {
    startTransition(async () => {
      await assignMentorAction(studentId, mentorId);
      router.refresh();
    });
  };

  return (
    <>
      <div className="pt-2 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="w-40">
          <option value="all">All Students</option>
          <option value="onboarded">Onboarded</option>
          <option value="pending">Pending Onboarding</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-48">
          <option value="recent">Most Recent</option>
          <option value="readiness-desc">Highest Readiness</option>
          <option value="readiness-asc">Lowest Readiness</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-4">Student</th>
              <th className="pb-2 pr-4">Target Role</th>
              <th className="pb-2 pr-4">Readiness</th>
              <th className="pb-2 pr-4">Mentor</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Joined</th>
              <th className="pb-2">Assign Mentor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
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
                <td className="py-2 pr-4 text-slate-600">{s.mentorName ?? "Unassigned"}</td>
                <td className="py-2 pr-4">
                  {s.onboardedAt ? <Badge variant="success">Onboarded</Badge> : <Badge variant="secondary">Pending</Badge>}
                </td>
                <td className="py-2 pr-4 text-slate-400">{s.createdLabel}</td>
                <td className="py-2">
                  <Select
                    value={s.mentorId ?? "none"}
                    disabled={isPending}
                    onChange={(e) => assignMentor(s.id, e.target.value)}
                    className="w-44 text-xs"
                  >
                    <option value="none">Unassigned</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.assignedCount})
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
