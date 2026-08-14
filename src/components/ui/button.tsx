import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/25 active:scale-[0.97]",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 active:scale-[0.97]",
  outline: "border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 bg-white active:scale-[0.97]",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.97]",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 hover:shadow-md active:scale-[0.97]",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 hover:shadow-md active:scale-[0.97]",
  gradient: "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-600 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.97]",
};

const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
  icon: "h-9 w-9",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
