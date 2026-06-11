import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(17, 0, 0, 0);
  return d;
}

async function main() {
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("brotherhood123", 10);

  const ahmed = await prisma.user.create({
    data: {
      email: "ahmed@elitebrotherhood.dev",
      passwordHash: password,
      name: "Ahmed Alkhudhur",
      role: "Founder & Lead Engineer",
      initials: "AA",
      avatarColor: "#C9A961",
    },
  });
  const jawadi = await prisma.user.create({
    data: {
      email: "jawadi@elitebrotherhood.dev",
      passwordHash: password,
      name: "Jawadi",
      role: "Engineer",
      initials: "JA",
      avatarColor: "#A67C52",
    },
  });

  const lumina = await prisma.project.create({
    data: {
      name: "Lumina Dental Website",
      client: "Lumina Dental Clinic",
      description:
        "Full marketing website with online booking, service pages, and an AI receptionist chatbot for appointment scheduling.",
      status: "IN_PROGRESS",
      startDate: daysFromNow(-14),
      deadline: daysFromNow(12),
    },
  });
  const atlas = await prisma.project.create({
    data: {
      name: "Atlas Logistics AI Agent",
      client: "Atlas Freight Co.",
      description:
        "Autonomous email triage agent that classifies inbound shipment inquiries, drafts replies, and syncs to their CRM.",
      status: "PLANNING",
      startDate: daysFromNow(-3),
      deadline: daysFromNow(30),
    },
  });
  const nour = await prisma.project.create({
    data: {
      name: "Nour Fitness App",
      client: "Nour Fitness Studio",
      description:
        "Cross-platform booking app with class schedules, memberships, and push notifications. Final review phase.",
      status: "REVIEW",
      startDate: daysFromNow(-45),
      deadline: daysFromNow(5),
    },
  });

  const tasks = [
    {
      title: "Build booking flow UI",
      description: "Multi-step appointment booking with date/time picker and confirmation email.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(3),
      projectId: lumina.id,
      assigneeId: jawadi.id,
      order: 0,
    },
    {
      title: "Train AI receptionist on FAQ data",
      description: "Ingest the clinic's FAQ and service docs, tune system prompt, evaluate on 50 sample queries.",
      status: "TODO",
      priority: "URGENT",
      dueDate: daysFromNow(5),
      projectId: lumina.id,
      assigneeId: jawadi.id,
      order: 0,
    },
    {
      title: "Service pages copy + SEO",
      description: "Write copy for 6 service pages, meta tags, and schema markup.",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: daysFromNow(8),
      projectId: lumina.id,
      assigneeId: ahmed.id,
      order: 1,
    },
    {
      title: "Deploy staging environment",
      description: "Staging on Vercel with the booking API stubbed against test data.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysFromNow(-2),
      projectId: lumina.id,
      assigneeId: ahmed.id,
      order: 0,
    },
    {
      title: "Map email triage categories",
      description: "Workshop with Atlas ops team to define the 8 inquiry categories and routing rules.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(4),
      projectId: atlas.id,
      assigneeId: ahmed.id,
      order: 1,
    },
    {
      title: "Prototype classification pipeline",
      description: "Claude-based classifier with structured output, target >95% accuracy on labeled sample set.",
      status: "TODO",
      priority: "HIGH",
      dueDate: daysFromNow(10),
      projectId: atlas.id,
      assigneeId: jawadi.id,
      order: 2,
    },
    {
      title: "CRM sync API research",
      description: "Evaluate Atlas's CRM API limits, auth model, and webhook support.",
      status: "TODO",
      priority: "LOW",
      dueDate: daysFromNow(14),
      projectId: atlas.id,
      assigneeId: jawadi.id,
      order: 3,
    },
    {
      title: "Fix push notification delays on iOS",
      description: "Notifications arriving 10+ min late on iOS 18. Investigate APNs priority settings.",
      status: "REVIEW",
      priority: "URGENT",
      dueDate: daysFromNow(1),
      projectId: nour.id,
      assigneeId: jawadi.id,
      order: 0,
    },
    {
      title: "Client UAT walkthrough",
      description: "Guided acceptance testing session with the studio owner, collect sign-off checklist.",
      status: "TODO",
      priority: "HIGH",
      dueDate: daysFromNow(4),
      projectId: nour.id,
      assigneeId: ahmed.id,
      order: 2,
    },
    {
      title: "App Store screenshots + listing",
      description: "Final marketing screenshots, description, and keywords for both stores.",
      status: "DONE",
      priority: "LOW",
      dueDate: daysFromNow(-5),
      projectId: nour.id,
      assigneeId: jawadi.id,
      order: 1,
    },
  ];

  const createdTasks = [];
  for (const t of tasks) {
    createdTasks.push(await prisma.task.create({ data: t }));
  }

  await prisma.comment.create({
    data: {
      taskId: createdTasks[0].id,
      authorId: ahmed.id,
      body: "Client wants the confirmation email to include a calendar invite (.ics). Can we add that to scope?",
    },
  });
  await prisma.comment.create({
    data: {
      taskId: createdTasks[0].id,
      authorId: jawadi.id,
      body: "Yes, easy add — I'll generate the .ics server-side after booking confirms.",
    },
  });
  await prisma.comment.create({
    data: {
      taskId: createdTasks[7].id,
      authorId: jawadi.id,
      body: "Looks like we were sending priority 5 instead of 10 on APNs. Fix is in review.",
    },
  });

  const activities = [
    { type: "PROJECT_CREATED", message: "created project Atlas Logistics AI Agent", userId: ahmed.id, projectId: atlas.id },
    { type: "TASK_CREATED", message: "created task “Prototype classification pipeline”", userId: ahmed.id, projectId: atlas.id, taskId: createdTasks[5].id },
    { type: "TASK_MOVED", message: "moved “Build booking flow UI” to In Progress", userId: jawadi.id, projectId: lumina.id, taskId: createdTasks[0].id },
    { type: "TASK_COMPLETED", message: "completed “Deploy staging environment”", userId: ahmed.id, projectId: lumina.id, taskId: createdTasks[3].id },
    { type: "TASK_MOVED", message: "moved “Fix push notification delays on iOS” to Review", userId: jawadi.id, projectId: nour.id, taskId: createdTasks[7].id },
    { type: "COMMENT_ADDED", message: "commented on “Build booking flow UI”", userId: jawadi.id, projectId: lumina.id, taskId: createdTasks[0].id },
    { type: "TASK_COMPLETED", message: "completed “App Store screenshots + listing”", userId: jawadi.id, projectId: nour.id, taskId: createdTasks[9].id },
  ];
  for (const a of activities) {
    await prisma.activity.create({ data: a });
  }

  console.log("Seeded: 2 users, 3 projects, 10 tasks, 3 comments, 7 activities");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
