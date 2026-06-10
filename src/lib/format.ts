import { format, formatDistanceToNow, isPast, isToday, differenceInCalendarDays } from "date-fns";

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

export function fmtShort(d: Date | string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "MMM d");
}

export function timeAgo(d: Date | string) {
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function dueLabel(d: Date | string | null | undefined): { text: string; tone: "overdue" | "soon" | "ok" | "none" } {
  if (!d) return { text: "No due date", tone: "none" };
  const date = new Date(d);
  if (isToday(date)) return { text: "Due today", tone: "soon" };
  if (isPast(date)) return { text: `Overdue · ${fmtShort(date)}`, tone: "overdue" };
  const days = differenceInCalendarDays(date, new Date());
  if (days <= 3) return { text: `Due in ${days}d`, tone: "soon" };
  return { text: fmtShort(date), tone: "ok" };
}

export const DUE_TONE_CLASS = {
  overdue: "text-red-400",
  soon: "text-amber-400",
  ok: "text-zinc-400",
  none: "text-zinc-600",
} as const;
