import Link from "next/link";
import {
  addDays,
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  max,
  min,
  startOfMonth,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  type ProjectStatus,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const DAY_PX = 26;

const TASK_BAR_COLORS: Record<string, string> = {
  TODO: "bg-zinc-600/70",
  IN_PROGRESS: "bg-gold/80",
  REVIEW: "bg-sky-500/70",
  DONE: "bg-emerald-600/70",
};

export default async function TimelinePage() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: { include: { assignee: true }, orderBy: { dueDate: "asc" } },
    },
    orderBy: { startDate: "asc" },
  });

  if (projects.length === 0) {
    return (
      <>
        <PageHeader title="Timeline" subtitle="What lies ahead for the Brotherhood." />
        <p className="py-16 text-center text-sm text-zinc-600">No projects to chart yet.</p>
      </>
    );
  }

  const allDates: Date[] = [new Date()];
  for (const p of projects) {
    allDates.push(p.startDate);
    if (p.deadline) allDates.push(p.deadline);
    for (const t of p.tasks) {
      allDates.push(t.createdAt);
      if (t.dueDate) allDates.push(t.dueDate);
    }
  }
  const rangeStart = startOfMonth(min(allDates));
  const rangeEnd = endOfMonth(addDays(max(allDates), 7));
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  const totalWidth = totalDays * DAY_PX;

  const pos = (d: Date) => differenceInCalendarDays(d, rangeStart) * DAY_PX;
  const today = new Date();
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  return (
    <>
      <PageHeader title="Timeline" subtitle="What lies ahead for the Brotherhood." />

      <div className="card animate-fade-up overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ width: totalWidth, minWidth: "100%" }} className="relative">
            {/* Month header */}
            <div className="sticky top-0 flex border-b border-ink-700 bg-ink-850">
              {months.map((m) => {
                const days =
                  differenceInCalendarDays(min([endOfMonth(m), rangeEnd]), max([m, rangeStart])) + 1;
                return (
                  <div
                    key={m.toISOString()}
                    style={{ width: days * DAY_PX }}
                    className="shrink-0 border-r border-ink-700/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70"
                  >
                    {format(m, "MMMM yyyy")}
                  </div>
                );
              })}
            </div>

            {/* Today line */}
            <div
              className="absolute bottom-0 top-9 z-10 w-px bg-gold/70"
              style={{ left: pos(today) + DAY_PX / 2 }}
            >
              <span className="absolute -left-[14px] -top-1 rounded bg-gold px-1 py-px text-[8px] font-bold uppercase text-ink-950">
                Now
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-ink-700/50">
              {projects.map((p) => {
                const pStart = p.startDate;
                const pEnd = p.deadline ?? addDays(p.startDate, 14);
                return (
                  <div key={p.id} className="py-1">
                    {/* Project row */}
                    <div className="relative h-12">
                      <div
                        className="absolute top-1/2 flex h-7 -translate-y-1/2 items-center gap-2 overflow-hidden rounded-md border border-gold/40 bg-gradient-to-r from-gold/25 to-gold/10 px-3"
                        style={{
                          left: pos(pStart),
                          width: Math.max((differenceInCalendarDays(pEnd, pStart) + 1) * DAY_PX, DAY_PX * 3),
                        }}
                      >
                        <Link
                          href={`/projects/${p.id}`}
                          className="truncate text-xs font-semibold text-gold-light hover:underline"
                        >
                          {p.name}
                        </Link>
                        <Badge
                          label={PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                          className={`hidden sm:inline-flex ${PROJECT_STATUS_STYLES[p.status as ProjectStatus]}`}
                        />
                      </div>
                    </div>
                    {/* Task rows */}
                    {p.tasks.map((t) => {
                      const tStart = max([t.createdAt, pStart]);
                      const tEnd = t.dueDate ?? addDays(tStart, 3);
                      const safeEnd = max([tEnd, tStart]);
                      return (
                        <div key={t.id} className="relative h-8">
                          <div
                            className={`absolute top-1/2 flex h-5 -translate-y-1/2 items-center overflow-hidden rounded px-2 ${TASK_BAR_COLORS[t.status] ?? "bg-zinc-600/70"}`}
                            style={{
                              left: pos(tStart),
                              width: Math.max((differenceInCalendarDays(safeEnd, tStart) + 1) * DAY_PX, DAY_PX * 2),
                            }}
                            title={`${t.title}${t.assignee ? ` — ${t.assignee.name}` : ""}`}
                          >
                            <span className="truncate text-[10px] font-medium text-ink-950">
                              {t.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-gold/40 bg-gold/20" /> Project span</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-zinc-600/70" /> To Do</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-gold/80" /> In Progress</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-sky-500/70" /> Review</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-emerald-600/70" /> Done</span>
      </div>
    </>
  );
}
