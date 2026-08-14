import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-indigo-100 text-indigo-700 border-indigo-200",
  secondary: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-rose-100 text-rose-700 border-rose-200",
  outline: "border border-slate-300 text-slate-600",
  indigo: "bg-indigo-600 text-white border-indigo-600",
  gradient: "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white border-0",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

const Progress = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value?: number }>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0 bg-slate-200 h-[1px] w-full", className)} {...props} />
  )
);
Separator.displayName = "Separator";

export { Badge, Progress, Separator };
