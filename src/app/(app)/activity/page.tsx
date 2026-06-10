import { format, isToday, isYesterday } from "date-fns";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import ActivityItem from "@/components/ActivityItem";

export const dynamic = "force-dynamic";

function dayLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export default async function ActivityPage() {
  const activities = await prisma.activity.findMany({
    include: { user: true, project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const groups = new Map<string, typeof activities>();
  for (const a of activities) {
    const key = dayLabel(a.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  return (
    <>
      <PageHeader title="Activity" subtitle="The chronicle of the Brotherhood's works." />

      <div className="mx-auto max-w-3xl space-y-8">
        {[...groups.entries()].map(([day, items]) => (
          <section key={day} className="animate-fade-up">
            <h2 className="mb-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/70">
              {day}
              <span className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
            </h2>
            <div className="card divide-y divide-ink-700/60 px-5 py-1">
              {items.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          </section>
        ))}
        {activities.length === 0 && (
          <p className="py-16 text-center text-sm text-zinc-600">
            The chronicle is empty. History awaits.
          </p>
        )}
      </div>
    </>
  );
}
