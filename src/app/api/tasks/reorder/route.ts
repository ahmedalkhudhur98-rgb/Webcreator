import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TASK_STATUS_LABELS, TaskStatus } from "@/lib/constants";

// Persists a drag-and-drop move: bulk order/status updates for the affected
// columns, plus an activity entry for the task that was moved.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { updates, movedId } = (await req.json()) as {
    updates: { id: string; status: string; order: number }[];
    movedId: string;
  };

  const moved = await prisma.task.findUnique({ where: { id: movedId } });
  if (!moved) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const movedUpdate = updates.find((u) => u.id === movedId);
  const statusChanged = movedUpdate && movedUpdate.status !== moved.status;

  await prisma.$transaction(
    updates.map((u) =>
      prisma.task.update({
        where: { id: u.id },
        data: { status: u.status, order: u.order },
      })
    )
  );

  if (statusChanged) {
    const completed = movedUpdate.status === "DONE";
    await prisma.activity.create({
      data: {
        type: completed ? "TASK_COMPLETED" : "TASK_MOVED",
        message: completed
          ? `completed “${moved.title}”`
          : `moved “${moved.title}” to ${TASK_STATUS_LABELS[movedUpdate.status as TaskStatus]}`,
        userId: session.user.id,
        projectId: moved.projectId,
        taskId: moved.id,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
