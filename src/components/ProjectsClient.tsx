"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "./Badge";
import Avatar from "./Avatar";
import ProjectModal, { ProjectFormData } from "./ProjectModal";
import PageHeader from "./PageHeader";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  type ProjectStatus,
} from "@/lib/constants";
import { fmtDate } from "@/lib/format";

export type ProjectCard = {
  id: string;
  name: string;
  client: string;
  description: string;
  status: string;
  startDate: string;
  deadline: string | null;
  taskTotal: number;
  taskDone: number;
  assignees: { id: string; initials: string; avatarColor: string; name: string }[];
};

export default function ProjectsClient({ projects }: { projects: ProjectCard[] }) {
  const [modal, setModal] = useState<ProjectFormData | null | "new">(null);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every engagement the Brotherhood has undertaken."
        action={
          <button className="btn-gold" onClick={() => setModal("new")}>
            + New Project
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const pct = p.taskTotal ? Math.round((p.taskDone / p.taskTotal) * 100) : 0;
          return (
            <div
              key={p.id}
              className="card animate-fade-up group flex flex-col p-6 transition-all duration-200 hover:border-gold/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <Link href={`/projects/${p.id}`} className="min-w-0">
                  <h3 className="font-display truncate text-xl font-semibold text-zinc-100 transition-colors group-hover:text-gold-light">
                    {p.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">{p.client}</p>
                </Link>
                <button
                  onClick={() =>
                    setModal({
                      id: p.id,
                      name: p.name,
                      client: p.client,
                      description: p.description,
                      status: p.status,
                      startDate: p.startDate.slice(0, 10),
                      deadline: p.deadline ? p.deadline.slice(0, 10) : "",
                    })
                  }
                  className="rounded-md p-1 text-zinc-600 opacity-0 transition-all hover:text-gold group-hover:opacity-100"
                  title="Edit project"
                >
                  ✎
                </button>
              </div>

              <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
                {p.description || "No description."}
              </p>

              <div className="mb-4 flex items-center justify-between">
                <Badge
                  label={PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                  className={PROJECT_STATUS_STYLES[p.status as ProjectStatus]}
                />
                <span className="text-xs text-zinc-500">Due {fmtDate(p.deadline)}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-zinc-500">
                  {p.taskDone}/{p.taskTotal}
                </span>
                <div className="flex -space-x-2">
                  {p.assignees.slice(0, 3).map((a) => (
                    <Avatar key={a.id} initials={a.initials} color={a.avatarColor} size="sm" title={a.name} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-zinc-600">
            No projects yet. Begin the first engagement.
          </p>
        )}
      </div>

      {modal && (
        <ProjectModal
          initial={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
