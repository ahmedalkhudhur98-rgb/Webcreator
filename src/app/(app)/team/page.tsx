import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import { PRIORITY_LABELS, PRIORITY_STYLES, type Priority } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await prisma.user.findMany({
    include: {
      tasks: {
        where: { status: { in: ["IN_PROGRESS", "REVIEW"] } },
        include: { project: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { tasks: { where: { status: { not: "DONE" } } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageHeader title="The Brothers" subtitle="The members of the order and their current works." />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {members.map((m) => (
          <div key={m.id} className="card animate-fade-up p-6">
            <div className="flex items-center gap-4">
              <Avatar initials={m.initials} color={m.avatarColor} size="lg" />
              <div className="min-w-0">
                <h3 className="font-display truncate text-xl font-semibold text-zinc-100">
                  {m.name}
                </h3>
                <p className="text-xs uppercase tracking-wider text-gold/70">{m.role}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {m._count.tasks} open task{m._count.tasks === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-ink-700 pt-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Currently working on
              </p>
              <div className="space-y-2">
                {m.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">{t.title}</p>
                      <p className="text-[11px] text-zinc-500">{t.project.name}</p>
                    </div>
                    <Badge
                      label={PRIORITY_LABELS[t.priority as Priority]}
                      className={PRIORITY_STYLES[t.priority as Priority]}
                    />
                  </div>
                ))}
                {m.tasks.length === 0 && (
                  <p className="py-2 text-sm italic text-zinc-600">Between engagements.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
