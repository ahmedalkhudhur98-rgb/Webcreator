# TeamOS — Internal Team Productivity App

A full-stack team productivity app built for a small AI solutions business team in Bahrain. Dark theme, electric blue accent, no fluff.

## Stack

- **Frontend:** React 18 + Vite, CSS Modules, @hello-pangea/dnd
- **Backend:** Node.js + Express
- **Database:** SQLite via better-sqlite3 (local file, no setup needed)
- **Auth:** JWT (local username/password)

## Project Structure

```
Webcreator/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Layout/      # Sidebar, Layout wrapper
│       │   ├── Tasks/       # KanbanBoard, TaskList, TaskModal
│       │   └── common/      # Avatar, Badge, Modal, Button
│       ├── context/         # AuthContext
│       ├── pages/           # Dashboard, Tasks, TeamDirectory, UserProfile, Feed, Login
│       └── utils/           # Axios API client
└── server/          # Express + SQLite backend
    └── src/
        ├── db/              # DB init + seed script
        ├── middleware/       # JWT auth middleware
        └── routes/          # auth, users, tasks, feed, dashboard
```

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Seed the database

```bash
cd server && npm run seed
```

This creates `server/data/app.db` with 3 demo users and sample tasks.

### 3. Run the app

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Accounts

| Username | Password   | Role   |
|----------|------------|--------|
| `admin`  | `admin123` | Admin  |
| `omar`   | `omar123`  | Member |
| `layla`  | `layla123` | Member |

---

## Features

- **Dashboard** — My tasks widget, upcoming deadlines (next 7 days), team stats, recent activity feed
- **Tasks** — Kanban board (drag & drop between columns) + list view toggle, filter by priority/assignee/search, task comments/activity log
- **Team** — Member cards with skills, bio, active tasks; Ping button; editable profiles
- **Feed** — Activity log, announcements with pin support (admin only), post updates

## API Routes

All routes require `Authorization: Bearer <token>` except `/api/auth/login`.

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/login` | Login — returns JWT + user object |
| `GET`  | `/api/auth/me` | Get current authenticated user |

### Users
| Method   | Route | Description |
|----------|-------|-------------|
| `GET`    | `/api/users` | List all team members |
| `GET`    | `/api/users/:id` | Get user profile + active tasks |
| `POST`   | `/api/users` | Create user (admin only) |
| `PUT`    | `/api/users/:id` | Update profile (own or admin) |
| `DELETE` | `/api/users/:id` | Delete user (admin only) |

### Tasks
| Method   | Route | Description |
|----------|-------|-------------|
| `GET`    | `/api/tasks` | List tasks (query: `status`, `priority`, `assignee`, `tag`, `search`) |
| `GET`    | `/api/tasks/:id` | Get task detail + comments |
| `POST`   | `/api/tasks` | Create task |
| `PUT`    | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task (owner or admin) |
| `POST`   | `/api/tasks/:id/comments` | Add comment to task |

### Feed
| Method   | Route | Description |
|----------|-------|-------------|
| `GET`    | `/api/feed` | Get activity feed + announcements |
| `POST`   | `/api/feed/announcements` | Post announcement |
| `PUT`    | `/api/feed/announcements/:id/pin` | Toggle pin (admin only) |
| `DELETE` | `/api/feed/announcements/:id` | Delete announcement |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/api/dashboard` | Aggregated: my tasks, deadlines, stats, recent activity |

---

## Roles

- **Admin** — full access: manage users, delete any task, pin/delete announcements
- **Member** — create/edit own tasks, view all, post updates, edit own profile
