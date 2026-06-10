import Avatar from "./Avatar";
import { timeAgo } from "@/lib/format";

const TYPE_ICONS: Record<string, string> = {
  TASK_CREATED: "＋",
  TASK_MOVED: "⇄",
  TASK_COMPLETED: "✓",
  TASK_UPDATED: "✎",
  PROJECT_CREATED: "▣",
  PROJECT_UPDATED: "▣",
  COMMENT_ADDED: "❝",
};

export type ActivityWithUser = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  user: { name: string; initials: string; avatarColor: string };
  project?: { name: string } | null;
};

export default function ActivityItem({ activity }: { activity: ActivityWithUser }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Avatar initials={activity.user.initials} color={activity.user.avatarColor} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-zinc-300">
          <span className="font-medium text-zinc-100">{activity.user.name}</span>{" "}
          {activity.message}
        </p>
        <p className="mt-0.5 text-xs text-zinc-600">
          {activity.project && (
            <span className="text-gold/60">{activity.project.name} · </span>
          )}
          {timeAgo(activity.createdAt)}
        </p>
      </div>
      <span className="mt-0.5 text-sm text-gold/50" aria-hidden>
        {TYPE_ICONS[activity.type] ?? "•"}
      </span>
    </div>
  );
}
