"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Avatar from "./Avatar";
import Badge from "./Badge";
import PageHeader from "./PageHeader";
import TaskModal from "./TaskModal";
import { TaskDTO, UserDTO, ProjectOption } from "@/lib/types";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  type Priority,
  type TaskStatus,
} from "@/lib/constants";
import { dueLabel, DUE_TONE_CLASS } from "@/lib/format";

export default function KanbanBoard({
  initialTasks,
  projects,
  members,
}: {
  initialTasks: TaskDTO[];
  projects: ProjectOption[];
  members: UserDTO[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("project") ?? "";

  const [tasks, setTasks] = useState(initialTasks);
  const [modal, setModal] = useState<{ open: boolean; task: TaskDTO | null }>({
    open: false,
    task: null,
  });

  // Sync board state when the server refetches after a mutation (router.refresh).
  const [prevInitial, setPrevInitial] = useState(initialTasks);
  if (prevInitial !== initialTasks) {
    setPrevInitial(initialTasks);
    setTasks(initialTasks);
  }

  const visible = useMemo(
    () => (projectFilter ? tasks.filter((t) => t.projectId === projectFilter) : tasks),
    [tasks, projectFilter]
  );

  const columns = useMemo(() => {
    const map: Record<TaskStatus, TaskDTO[]> = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
    for (const t of visible) map[t.status as TaskStatus]?.push(t);
    for (const s of TASK_STATUSES) map[s].sort((a, b) => a.order - b.order);
    return map;
  }, [visible]);

  function setFilter(projectId: string) {
    router.replace(projectId ? `/tasks?project=${projectId}` : "/tasks");
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId as TaskStatus;
    const to = destination.droppableId as TaskStatus;

    const fromList = [...columns[from]];
    const [moved] = fromList.splice(source.index, 1);
    const toList = from === to ? fromList : [...columns[to]];
    toList.splice(destination.index, 0, { ...moved, status: to });

    const updates: { id: string; status: string; order: number }[] = [];
    toList.forEach((t, i) => updates.push({ id: t.id, status: to, order: i }));
    if (from !== to) fromList.forEach((t, i) => updates.push({ id: t.id, status: from, order: i }));

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        const u = updates.find((x) => x.id === t.id);
        return u ? { ...t, status: u.status, order: u.order } : t;
      })
    );

    const res = await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates, movedId: draggableId }),
    });
    if (!res.ok) {
      setTasks(initialTasks); // revert on failure
    } else {
      router.refresh();
    }
  }

  function handleSaved(saved: TaskDTO) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="The board of works. Drag cards to advance them."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input-base w-auto"
              value={projectFilter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn-gold" onClick={() => setModal({ open: true, task: null })}>
              + New Task
            </button>
          </div>
        }
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <div key={status} className="flex min-h-40 flex-col">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                  {TASK_STATUS_LABELS[status]}
                </h2>
                <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[10px] tabular-nums text-zinc-400">
                  {columns[status].length}
                </span>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 rounded-xl border p-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver
                        ? "border-gold/40 bg-gold/[0.04]"
                        : "border-ink-700/60 bg-ink-900/40"
                    }`}
                  >
                    {columns[status].map((task, index) => {
                      const due = dueLabel(task.dueDate);
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => setModal({ open: true, task })}
                              className={`card cursor-grab p-4 transition-shadow active:cursor-grabbing ${
                                snap.isDragging ? "gold-ring rotate-1" : "hover:border-gold/30"
                              }`}
                            >
                              <p className={`text-sm font-medium leading-snug ${status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                                {task.title}
                              </p>
                              <p className="mt-1 text-[11px] text-gold/50">{task.project.name}</p>
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    label={PRIORITY_LABELS[task.priority as Priority]}
                                    className={PRIORITY_STYLES[task.priority as Priority]}
                                  />
                                  {task.comments.length > 0 && (
                                    <span className="text-[11px] text-zinc-500">
                                      ❝ {task.comments.length}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[11px] ${DUE_TONE_CLASS[due.tone]}`}>
                                    {due.tone === "none" ? "" : due.text}
                                  </span>
                                  {task.assignee && (
                                    <Avatar
                                      initials={task.assignee.initials}
                                      color={task.assignee.avatarColor}
                                      size="sm"
                                      title={task.assignee.name}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {columns[status].length === 0 && !snapshot.isDraggingOver && (
                      <p className="px-2 py-6 text-center text-xs text-zinc-700">Empty</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultProjectId={projectFilter || undefined}
          projects={projects}
          members={members}
          onClose={() => setModal({ open: false, task: null })}
          onSaved={handleSaved}
          onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        />
      )}
    </>
  );
}
