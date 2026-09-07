"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { addStudentSkillAction, updateStudentSkillRatingAction } from "@/server/actions/skills";

export interface SkillRow {
  id: string;
  skillId: string;
  name: string;
  category: string;
  rating: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGES: "Languages",
  DATA: "Data",
  AI: "AI",
  WEB: "Web",
  CS_FUNDAMENTALS: "CS Fundamentals",
  SOFT_SKILLS: "Soft Skills",
  TOOLS: "Tools",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  BUSINESS: "Business & Management",
  DESIGN: "Design",
  CLOUD: "Cloud & DevOps",
  CYBER: "Cybersecurity",
  MOBILE: "Mobile Development",
};

export function SkillsPanel({
  skills,
  available,
}: {
  skills: SkillRow[];
  available: SkillRow[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [rating, setRating] = useState("3");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const addSkill = () => {
    if (!selected) return;
    const skill = available.find((s) => s.id === selected);
    if (!skill) return;
    startTransition(async () => {
      await addStudentSkillAction(skill.skillId, Number(rating));
      setSavedId(skill.id);
      setSelected("");
      setRating("3");
      router.refresh();
      setTimeout(() => setSavedId(null), 2000);
    });
  };

  const updateRating = (skillId: string, value: string) => {
    startTransition(async () => {
      await updateStudentSkillRatingAction(skillId, Number(value));
      router.refresh();
    });
  };

  const byCategory = (rows: SkillRow[]) =>
    rows.reduce<Record<string, SkillRow[]>>((acc, row) => {
      (acc[row.category] ??= []).push(row);
      return acc;
    }, {});

  const grouped = byCategory(skills);

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Skill</label>
          <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-56">
            <option value="">Select a skill to add...</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {CATEGORY_LABELS[s.category] ?? s.category}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Self rating (1–5)</label>
          <Select value={rating} onChange={(e) => setRating(e.target.value)} className="w-28">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="default" disabled={!selected || isPending} onClick={addSkill}>
          {savedId === selected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added
            </>
          ) : isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Skill
        </Button>
      </div>

      {Object.entries(grouped).map(([category, rows]) => (
        <div key={category}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">
              {(CATEGORY_LABELS[category] ?? category).toLowerCase().replace(/_/g, " ")}
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              {rows.length} skill{rows.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-surface px-4 py-3">
                <div>
                  <p className="font-medium text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">{CATEGORY_LABELS[row.category] ?? row.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(row.rating)}
                    disabled={isPending}
                    onChange={(e) => updateRating(row.skillId, e.target.value)}
                    className="h-9 w-20 text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}/5
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No skills tracked yet</p>
          <p className="mt-1 text-sm text-slate-500">Add skills above to start building your readiness score.</p>
        </div>
      )}
    </>
  );
}
