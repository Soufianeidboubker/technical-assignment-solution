# Team Boards - Take-Home Assignment

Kanban board app (b7al Trello sghir) m3a login, tasks, drag & drop, comments o search real-time.

## Features
- Login/Register (JWT + demo account: demo@example.com / password123)
- Board m3a 3 columns (To Do, In Progress, Done)
- Drag & drop tasks bin columns
- Create / update / delete tasks
- Comments f tasks (add & view)
- Search tasks f instant
- Priority badges + creator name

## Tech
- Frontend: React + TS + Vite + TanStack Query + React Router
- Backend: Node + Express + TS + SQLite + JWT + Zod
- Tests: Vitest (all passing)

## Setup
```bash
pnpm install
pnpm dev
Demo Videos

App demo (login → board → search → task + comment + create + drag → logout):
https://drive.google.com/file/d/1HvyxUKtTeyo7fvymaW15yOG9CcFVIx8t/view?usp=sharing
Tests demo (pnpm test):
https://drive.google.com/file/d/1ZdZgMxqyukiBGa1p1PrYQS3pEjrCphhe/view?usp=sharing

Design Decision
Khdmt b TanStack Query hit kay3ti caching automatique o updates instant bla reloads.
CI kayn chi warnings lint/typecheck (Zod + ESLint), walakin app khdama 100% local.
Shukran 3la l'forsa!
Soufiane Idboubker - February 2026
