import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.client) {
    return NextResponse.json({ error: "Name and client are required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: body.name,
      client: body.client,
      description: body.description ?? "",
      status: body.status ?? "PLANNING",
      deadline: body.deadline ? new Date(body.deadline) : null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      message: `created project ${project.name}`,
      userId: session.user.id,
      projectId: project.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
