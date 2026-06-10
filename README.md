# The Elite Brotherhood

Private team workspace for an AI automation agency — projects, kanban tasks, timeline, team, and an activity chronicle, wrapped in a dark charcoal + champagne-gold private-club aesthetic.

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS v4** — custom dark theme with gold accents
- **SQLite + Prisma** — local file database, zero external services
- **NextAuth (Auth.js v5)** — email/password credentials, invite-only (no public signup)
- **@hello-pangea/dnd** — drag-and-drop kanban

## Features

| Page | What it does |
| --- | --- |
| **Dashboard** | Active projects with progress, your open tasks, deadlines due this week, recent activity |
| **Projects** | Create/edit/delete projects — name, client, description, status, start date, deadline |
| **Tasks** | Drag-and-drop kanban (To Do / In Progress / Review / Done), priority, assignee, due dates, project filter |
| **Timeline** | Gantt-style chart of all projects and tasks across the calendar with a "Now" marker |
| **Team** | Member profiles with role, avatar, and what each brother is currently working on |
| **Activity** | Day-grouped feed of everything that happens (created, moved, completed, commented) |
| **Comments** | Discussion thread inside every task |

## Quick start

```bash
npm install
npx prisma db push     # create SQLite db from schema
npm run db:seed        # seed 3 members, 3 projects, 10 tasks
npm run dev            # http://localhost:3000
```

`.env` needs:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="any-long-random-string"
AUTH_TRUST_HOST=true
```

## Test accounts

All seeded members share the password **`brotherhood123`**:

| Email | Member |
| --- | --- |
| `ahmed@elitebrotherhood.dev` | Ahmed Alkhudhur — Founder & Lead Engineer |
| `omar@elitebrotherhood.dev` | Omar Hassan — AI Engineer |
| `youssef@elitebrotherhood.dev` | Youssef Karim — Design & Frontend |

## Inviting new members

There is intentionally no signup page. Add a member directly:

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p = new PrismaClient();
p.user.create({ data: {
  email: 'new@elitebrotherhood.dev',
  passwordHash: await bcrypt.hash('their-password', 10),
  name: 'New Brother', role: 'Engineer', initials: 'NB', avatarColor: '#C9A961',
}}).then(() => console.log('invited'));
"
```
