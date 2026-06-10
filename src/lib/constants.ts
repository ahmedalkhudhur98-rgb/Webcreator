export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  MEDIUM: "bg-sky-500/10 text-sky-300/90 border-sky-500/20",
  HIGH: "bg-amber-500/10 text-amber-300/90 border-amber-500/25",
  URGENT: "bg-red-500/10 text-red-400 border-red-500/25",
};

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  PLANNING: "bg-violet-500/10 text-violet-300/90 border-violet-500/25",
  IN_PROGRESS: "bg-gold/10 text-gold border-gold/25",
  REVIEW: "bg-sky-500/10 text-sky-300/90 border-sky-500/25",
  DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
};
