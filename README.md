# The Elite Brotherhood

Private team workspace for an AI automation agency — projects, kanban tasks, timeline, team, and an activity chronicle, wrapped in a dark charcoal + champagne-gold private-club aesthetic.

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS v4** — custom dark theme with gold accents
- **PostgreSQL (Neon) + Prisma** — free hosted Postgres, works with any Postgres locally
- **NextAuth (Auth.js v5)** — email/password credentials, invite-only (no public signup)
- **@hello-pangea/dnd** — drag-and-drop kanban
- Deploys to **Vercel** (see below)

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

## Quick start (local)

You need a Postgres connection string — either a free [Neon](https://neon.tech) database or a local Postgres.

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npx prisma db push     # create tables from schema
npm run db:seed        # seed 2 members, 3 projects, 10 tasks
npm run dev            # http://localhost:3000
```

## Deploying to Vercel + Neon

1. **Create the database** — sign up at [neon.tech](https://neon.tech) (free tier), create a project, and copy the **pooled connection string** (the one containing `-pooler`, ending in `?sslmode=require`).
2. **Create the tables and seed data** — from your machine:
   ```bash
   DATABASE_URL="<neon-pooled-url>" npx prisma db push
   DATABASE_URL="<neon-pooled-url>" npm run db:seed
   ```
3. **Import the repo on Vercel** — at [vercel.com/new](https://vercel.com/new), import `ahmedalkhudhur98-rgb/Webcreator` and select the branch to deploy. Build settings need no changes (`npm run build` already runs `prisma generate`).
4. **Set environment variables** in the Vercel project settings (Production + Preview):
   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon pooled connection string |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |
5. **Deploy.** Share the `*.vercel.app` URL with the team — everyone logs in with their seeded account.

> Tip: Vercel's Neon integration (Storage → Neon) can create the database and inject `DATABASE_URL` automatically — you'd then only add `AUTH_SECRET` and run step 2 against the URL it generated.

## Test accounts

All seeded members share the password **`brotherhood123`**:

| Email | Member |
| --- | --- |
| `ahmed@elitebrotherhood.dev` | Ahmed Alkhudhur — Founder & Lead Engineer |
| `jawadi@elitebrotherhood.dev` | Jawadi — Engineer |

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
