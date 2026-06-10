"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";

export type ProjectFormData = {
  id?: string;
  name: string;
  client: string;
  description: string;
  status: string;
  startDate: string;
  deadline: string;
};

export default function ProjectModal({
  initial,
  onClose,
}: {
  initial?: ProjectFormData;
  onClose: () => void;
}) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState<ProjectFormData>(
    initial ?? {
      name: "",
      client: "",
      description: "",
      status: "PLANNING",
      startDate: new Date().toISOString().slice(0, 10),
      deadline: "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(editing ? `/api/projects/${form.id}` : "/api/projects", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        client: form.client,
        description: form.description,
        status: form.status,
        startDate: form.startDate || null,
        deadline: form.deadline || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Something went wrong. Try again.");
      return;
    }
    onClose();
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id || !confirm("Delete this project and all its tasks?")) return;
    await fetch(`/api/projects/${form.id}`, { method: "DELETE" });
    onClose();
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="card gold-ring animate-fade-up relative w-full max-w-lg p-6 sm:p-8">
        <h2 className="font-display mb-6 text-2xl font-semibold text-champagne">
          {editing ? "Edit Project" : "New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Name</label>
            <input className="input-base" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Project name" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Client</label>
            <input className="input-base" required value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="Client name" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Description</label>
            <textarea className="input-base min-h-20 resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What are we building?" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Status</label>
              <select className="input-base" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Start</label>
              <input type="date" className="input-base" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">Deadline</label>
              <input type="date" className="input-base" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-between pt-2">
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
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
