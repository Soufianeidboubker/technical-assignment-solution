# Team Boards - Take-Home Assignment

A full-stack Kanban board application (simplified Trello-like) with login, tasks, drag & drop, comments, and real-time search.

## Features
- Login/Register (JWT + demo account: demo@example.com / password123)
- Board with 3 columns (To Do, In Progress, Done)
- Drag & drop tasks between columns
- Create / update / delete tasks
- Add & view comments on tasks
- Instant real-time search
- Priority badges + creator name

## Tech Stack
- Frontend: React + TypeScript + Vite + TanStack Query + React Router
- Backend: Node + Express + TypeScript + SQLite + JWT + Zod
- Tests: Vitest (all passing)

## Demo Videos (Silent Screen Recordings)
- **App Demo** (login → board → search → task details + comment + create + drag & drop → logout):  
  [Watch on Google Drive](https://drive.google.com/file/d/1HvyxUKtTeyo7fvymaW15yOG9CcFVIx8t/view?usp=sharing)

- **Tests Demo** (pnpm test – all passing):  
  [Watch on Google Drive](https://drive.google.com/file/d/1ZdZgMxqyukiBGa1p1PrYQS3pEjrCphhe/view?usp=sharing)

## Setup
```bash
pnpm install
pnpm dev
Design Decision
I used TanStack Query because it provides automatic caching and instant updates without reloads, making the app fast and responsive.
Note on CI
There are some lint/typecheck warnings in GitHub Actions (Zod types + ESLint config), but the app runs perfectly locally as shown in the videos.
Thank you for the opportunity!
Soufiane Idboubker – February 2026
