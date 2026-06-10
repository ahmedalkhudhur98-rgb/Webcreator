import { prisma } from "@/lib/prisma";
import ProjectsClient, { ProjectCard } from "@/components/ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { tasks: { include: { assignee: true } } },
    orderBy: { createdAt: "asc" },
  });

  const cards: ProjectCard[] = projects.map((p) => {
    const assignees = new Map<string, { id: string; initials: string; avatarColor: string; name: string }>();
    for (const t of p.tasks) {
      if (t.assignee) {
        assignees.set(t.assignee.id, {
          id: t.assignee.id,
          initials: t.assignee.initials,
          avatarColor: t.assignee.avatarColor,
          name: t.assignee.name,
        });
      }
    }
    return {
      id: p.id,
      name: p.name,
      client: p.client,
      description: p.description,
      status: p.status,
      startDate: p.startDate.toISOString(),
      deadline: p.deadline?.toISOString() ?? null,
      taskTotal: p.tasks.length,
      taskDone: p.tasks.filter((t) => t.status === "DONE").length,
      assignees: [...assignees.values()],
    };
  });

  return <ProjectsClient projects={cards} />;
}
