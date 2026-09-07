import { ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResourceLinkData {
  name: string;
  url: string;
  kind?: "roadmap" | "course" | "practice" | "docs" | "community" | "cert" | null;
}

const KIND_STYLES: Record<string, string> = {
  roadmap: "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100",
  course: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100",
  practice: "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100",
  docs: "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200",
  community: "bg-cyan-50 text-cyan-700 ring-cyan-200 hover:bg-cyan-100",
  cert: "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100",
};

export function ResourceLinks({
  resources,
  className,
}: {
  resources: ResourceLinkData[];
  className?: string;
}) {
  if (!resources.length) return null;
  const valid = resources.filter((r) => r && r.url && r.name);
  if (!valid.length) return null;

  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-1.5", className)}>
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Sparkles className="h-3 w-3 text-indigo-500" /> Free resources
      </span>
      {valid.slice(0, 4).map((r, i) => (
        <a
          key={`${r.url}-${i}`}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-colors",
            KIND_STYLES[r.kind ?? "course"]
          )}
        >
          <span className="truncate">{r.name}</span>
          {r.kind === "course" && r.url.includes("youtube") && (
            <span className="shrink-0 rounded-full bg-rose-50 px-1 text-[9px] font-bold text-rose-600 ring-1 ring-inset ring-rose-200">
              YT
            </span>
          )}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ))}
    </div>
  );
}