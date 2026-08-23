"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MentorChecklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((rec, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          aria-pressed={done.has(i)}
          className={cn(
            "flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed text-slate-700 font-medium text-left transition-all cursor-pointer",
            done.has(i)
              ? "border-emerald-200 bg-emerald-50/60 text-slate-400 line-through"
              : "border-slate-100 bg-white/40 hover:border-indigo-200 hover:bg-indigo-50/40"
          )}
        >
          <span
            className={cn(
              "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full font-bold text-[10px] transition-colors",
              done.has(i) ? "bg-emerald-500 text-white" : "bg-indigo-100 text-indigo-600"
            )}
          >
            {done.has(i) ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span>{rec}</span>
        </button>
      ))}
    </div>
  );
}
