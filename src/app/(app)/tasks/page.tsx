import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";
import { TaskDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, projects, members] = await Promise.all([
    prisma.task.findMany({
      include: {
        project: { select: { id: true, name: true } },
        assignee: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { order: "asc" },
    }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const dtos: TaskDTO[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
    order: t.order,
    projectId: t.projectId,
    assigneeId: t.assigneeId,
    project: t.project,
    assignee: t.assignee
      ? {
          id: t.assignee.id,
          name: t.assignee.name,
          role: t.assignee.role,
          initials: t.assignee.initials,
          avatarColor: t.assignee.avatarColor,
        }
      : null,
    comments: t.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        role: c.author.role,
        initials: c.author.initials,
        avatarColor: c.author.avatarColor,
      },
    })),
  }));

  const memberDtos = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    initials: m.initials,
    avatarColor: m.avatarColor,
  }));

  return (
    <Suspense>
      <KanbanBoard initialTasks={dtos} projects={projects} members={memberDtos} />
    </Suspense>
  );
}
