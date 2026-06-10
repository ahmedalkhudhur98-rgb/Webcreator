import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title || !body.projectId) {
    return NextResponse.json({ error: "Title and project are required" }, { status: 400 });
  }

  const maxOrder = await prisma.task.aggregate({
    where: { projectId: body.projectId, status: body.status ?? "TODO" },
    _max: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description ?? "",
      status: body.status ?? "TODO",
      priority: body.priority ?? "MEDIUM",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: body.projectId,
      assigneeId: body.assigneeId || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
    include: { assignee: true, project: true, comments: true },
  });

  await prisma.activity.create({
    data: {
      type: "TASK_CREATED",
      message: `created task “${task.title}”`,
      userId: session.user.id,
      projectId: task.projectId,
      taskId: task.id,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
