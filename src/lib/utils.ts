import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function startOfDay(d: Date = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

export function startOfWeek(d: Date = new Date()): Date {
  const date = startOfDay(d);
  const day = (date.getDay() + 6) % 7; // Monday as 0
  date.setDate(date.getDate() - day);
  return date;
}

export function weekLabel(d: Date = new Date()): string {
  const start = startOfWeek(d);
  const end = addDays(start, 6);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// JSON helpers for SQLite-portable string fields
export function toJson<T>(value: T): string {
  return JSON.stringify(value);
}

export function fromJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
