import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import ActivityItem from "@/components/ActivityItem";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Priority,
  type ProjectStatus,
} from "@/lib/constants";
import { fmtDate, dueLabel, DUE_TONE_CLASS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { include: { assignee: true }, orderBy: [{ status: "asc" }, { order: "asc" }] },
      activities: {
        include: { user: true, project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  if (!project) notFound();

  const done = project.tasks.filter((t) => t.status === "DONE").length;
  const pct = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : 0;

  return (
    <>
      <div className="animate-fade-up mb-8">
        <Link href="/projects" className="text-xs text-zinc-500 hover:text-gold">
          ← All projects
        </Link>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-wide text-champagne sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-1 text-sm uppercase tracking-wider text-zinc-500">
              {project.client}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              label={PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              className={PROJECT_STATUS_STYLES[project.status as ProjectStatus]}
            />
            <Link href={`/tasks?project=${project.id}`} className="btn-ghost">
              Open Board
            </Link>
          </div>
        </div>
      </div>

      <div className="card animate-fade-up mb-6 p-6">
        <p className="text-sm leading-relaxed text-zinc-300">
          {project.description || "No description."}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Start</p>
            <p className="mt-0.5 text-sm text-zinc-200">{fmtDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Deadline</p>
            <p className="mt-0.5 text-sm text-zinc-200">{fmtDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Tasks</p>
            <p className="mt-0.5 text-sm text-zinc-200">
              {done} of {project.tasks.length} done
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Progress</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-zinc-500">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card animate-fade-up p-6 xl:col-span-2">
          <h2 className="font-display mb-4 text-xl font-semibold text-champagne">Tasks</h2>
          {TASK_STATUSES.map((status) => {
            const tasks = project.tasks.filter((t) => t.status === status);
            if (tasks.length === 0) return null;
            return (
              <div key={status} className="mb-5 last:mb-0">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/60">
                  {TASK_STATUS_LABELS[status]}
                </h3>
                <div className="space-y-2">
                  {tasks.map((t) => {
                    const due = dueLabel(t.dueDate);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-900/60 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {t.assignee && (
                            <Avatar
                              initials={t.assignee.initials}
                              color={t.assignee.avatarColor}
                              size="sm"
                              title={t.assignee.name}
                            />
                          )}
                          <p className={`truncate text-sm ${status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                            {t.title}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <Badge
                            label={PRIORITY_LABELS[t.priority as Priority]}
                            className={PRIORITY_STYLES[t.priority as Priority]}
                          />
                          <span className={`hidden text-xs sm:block ${DUE_TONE_CLASS[due.tone]}`}>
                            {due.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {project.tasks.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-600">No tasks yet.</p>
          )}
        </section>

        <section className="card animate-fade-up h-fit p-6">
          <h2 className="font-display mb-2 text-xl font-semibold text-champagne">
            Project Activity
          </h2>
          <div className="divide-y divide-ink-700/60">
            {project.activities.map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
            {project.activities.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-600">No activity yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
