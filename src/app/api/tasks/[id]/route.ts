import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TASK_STATUS_LABELS, TaskStatus } from "@/lib/constants";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.projectId !== undefined && { projectId: body.projectId }),
      ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId || null }),
      ...(body.dueDate !== undefined && {
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      }),
    },
    include: { assignee: true, project: true, comments: { include: { author: true } } },
  });

  if (body.status !== undefined && body.status !== existing.status) {
    const completed = body.status === "DONE";
    await prisma.activity.create({
      data: {
        type: completed ? "TASK_COMPLETED" : "TASK_MOVED",
        message: completed
          ? `completed “${task.title}”`
          : `moved “${task.title}” to ${TASK_STATUS_LABELS[body.status as TaskStatus] ?? body.status}`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    });
  } else if (body.order === undefined) {
    await prisma.activity.create({
      data: {
        type: "TASK_UPDATED",
        message: `updated “${task.title}”`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
