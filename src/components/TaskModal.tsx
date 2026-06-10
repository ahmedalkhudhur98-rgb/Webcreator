"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { TaskDTO, CommentDTO, UserDTO, ProjectOption } from "@/lib/types";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/constants";
import { timeAgo } from "@/lib/format";

export default function TaskModal({
  task,
  defaultProjectId,
  projects,
  members,
  onClose,
  onSaved,
  onDeleted,
}: {
  task: TaskDTO | null;
  defaultProjectId?: string;
  projects: ProjectOption[];
  members: UserDTO[];
  onClose: () => void;
  onSaved: (task: TaskDTO) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const editing = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "TODO",
    priority: task?.priority ?? "MEDIUM",
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    projectId: task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "",
    assigneeId: task?.assigneeId ?? "",
  });
  const [comments, setComments] = useState<CommentDTO[]>(task?.comments ?? []);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(editing ? `/api/tasks/${task!.id}` : "/api/tasks", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Something went wrong. Try again.");
      return;
    }
    const saved = await res.json();
    onSaved(saved);
    router.refresh();
    onClose();
  }

  async function handleDelete() {
    if (!task || !confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
    router.refresh();
    onClose();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setPosting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, body: newComment }),
    });
    setPosting(false);
    if (res.ok) {
      const comment = await res.json();
      setComments((c) => [...c, comment]);
      setNewComment("");
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8 sm:items-center">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="card gold-ring animate-fade-up relative my-auto w-full max-w-xl p-6 sm:p-8">
        <h2 className="font-display mb-6 text-2xl font-semibold text-champagne">
          {editing ? "Task Details" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Title</label>
            <input className="input-base" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="What needs doing?" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Description</label>
            <textarea className="input-base min-h-20 resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Details, context, links…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Project</label>
              <select className="input-base" required value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Assignee</label>
              <select className="input-base" value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Priority</label>
              <select className="input-base" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Due Date</label>
              <input type="date" className="input-base" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Status</label>
              <select className="input-base" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-between pt-1">
            {editing ? (
              <button type="button" onClick={handleDelete} className="text-sm text-red-500/80 hover:text-red-400">
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-gold">
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>

        {editing && (
          <div className="mt-7 border-t border-ink-700 pt-5">
            <h3 className="font-display mb-3 text-lg font-semibold text-champagne">
              Discussion
              <span className="ml-2 text-sm font-normal text-zinc-500">{comments.length}</span>
            </h3>
            <div className="max-h-56 space-y-4 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar initials={c.author.initials} color={c.author.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1 rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200">{c.author.name}</span>
                      <span className="shrink-0 text-[10px] text-zinc-600">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-300">{c.body}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="py-2 text-sm text-zinc-600">No comments yet. Start the discussion.</p>
              )}
            </div>
            <form onSubmit={handleComment} className="mt-4 flex gap-2">
              <input
                className="input-base"
                placeholder="Add a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={posting || !newComment.trim()} className="btn-gold shrink-0">
                {posting ? "…" : "Post"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
