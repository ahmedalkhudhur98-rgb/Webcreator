import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.taskId || !body.body?.trim()) {
    return NextResponse.json({ error: "Task and comment body are required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      body: body.body.trim(),
      taskId: body.taskId,
      authorId: session.user.id,
    },
    include: { author: true, task: true },
  });

  await prisma.activity.create({
    data: {
      type: "COMMENT_ADDED",
      message: `commented on “${comment.task.title}”`,
      userId: session.user.id,
      projectId: comment.task.projectId,
      taskId: comment.taskId,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
