import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import ActivityItem from "@/components/ActivityItem";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  TASK_STATUS_LABELS,
  type Priority,
  type ProjectStatus,
  type TaskStatus,
} from "@/lib/constants";
import { dueLabel, DUE_TONE_CLASS, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = (await auth())!;
  const userId = session.user.id;

  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);

  const [activeProjects, myTasks, upcoming, activities, memberCount] = await Promise.all([
    prisma.project.findMany({
      where: { status: { not: "DONE" } },
      include: { tasks: { select: { status: true } } },
      orderBy: { deadline: "asc" },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId, status: { not: "DONE" } },
      include: { project: { select: { name: true } } },
      orderBy: [{ dueDate: "asc" }],
      take: 6,
    }),
    prisma.task.findMany({
      where: { status: { not: "DONE" }, dueDate: { lte: weekAhead } },
      include: { project: { select: { name: true } }, assignee: true },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.activity.findMany({
      include: { user: true, project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.user.count(),
  ]);

  const openTaskCount = await prisma.task.count({
    where: { assigneeId: userId, status: { not: "DONE" } },
  });

  const firstName = session.user.name.split(" ")[0];
  const stats = [
    { label: "Active Projects", value: activeProjects.length },
    { label: "My Open Tasks", value: openTaskCount },
    { label: "Due This Week", value: upcoming.length },
    { label: "Brothers", value: memberCount },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="The state of the Brotherhood, at a glance."
      />

      {/* Stats */}
      <div className="animate-fade-up mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="font-display text-4xl font-semibold text-gold">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Active projects */}
          <section className="card animate-fade-up p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-champagne">
                Active Projects
              </h2>
              <Link href="/projects" className="text-xs text-gold/70 hover:text-gold">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {activeProjects.map((p) => {
                const done = p.tasks.filter((t) => t.status === "DONE").length;
                const pct = p.tasks.length ? Math.round((done / p.tasks.length) * 100) : 0;
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block rounded-lg border border-ink-700 bg-ink-900/60 p-4 transition-colors hover:border-gold/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-zinc-100">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.client}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          label={PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                          className={PROJECT_STATUS_STYLES[p.status as ProjectStatus]}
                        />
                        <span className="text-xs text-zinc-500">{fmtDate(p.deadline)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-zinc-500">{pct}%</span>
                    </div>
                  </Link>
                );
              })}
              {activeProjects.length === 0 && (
                <p className="py-6 text-center text-sm text-zinc-600">
                  No active projects. The Brotherhood rests.
                </p>
              )}
            </div>
          </section>

          {/* Upcoming deadlines */}
          <section className="card animate-fade-up p-6">
            <h2 className="font-display mb-4 text-xl font-semibold text-champagne">
              Upcoming Deadlines
            </h2>
            <div className="divide-y divide-ink-700">
              {upcoming.map((t) => {
                const due = dueLabel(t.dueDate);
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">{t.title}</p>
                      <p className="text-xs text-zinc-500">
                        {t.project.name}
                        {t.assignee ? ` · ${t.assignee.name}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium ${DUE_TONE_CLASS[due.tone]}`}>
                      {due.text}
                    </span>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <p className="py-6 text-center text-sm text-zinc-600">
                  Nothing due in the next seven days.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* My tasks */}
          <section className="card animate-fade-up p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-champagne">My Tasks</h2>
              <Link href="/tasks" className="text-xs text-gold/70 hover:text-gold">
                Board →
              </Link>
            </div>
            <div className="space-y-2.5">
              {myTasks.map((t) => (
                <div key={t.id} className="rounded-lg border border-ink-700 bg-ink-900/60 p-3">
                  <p className="text-sm text-zinc-200">{t.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      label={PRIORITY_LABELS[t.priority as Priority]}
                      className={PRIORITY_STYLES[t.priority as Priority]}
                    />
                    <span className="text-[11px] text-zinc-500">
                      {TASK_STATUS_LABELS[t.status as TaskStatus]} · {t.project.name}
                    </span>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="py-6 text-center text-sm text-zinc-600">
                  Your slate is clean, brother.
                </p>
              )}
            </div>
          </section>

          {/* Recent activity */}
          <section className="card animate-fade-up p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-champagne">
                Recent Activity
              </h2>
              <Link href="/activity" className="text-xs text-gold/70 hover:text-gold">
                Feed →
              </Link>
            </div>
            <div className="divide-y divide-ink-700/60">
              {activities.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
