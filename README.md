# Team Boards – Take-Home Assignment

A full-stack **Kanban-style board** application (similar to a simplified Trello) built with **React + TypeScript** (frontend) and **Node.js + Express + TypeScript** (backend). Includes user authentication, task management, drag & drop, comments, real-time search, and automated tests.

## Features Implemented

- JWT-based authentication (login / register + demo account)
- Kanban board with multiple columns (To Do, In Progress, Done)
- Drag & drop tasks between columns (using native HTML5 Drag & Drop API)
- Full task CRUD (create, read, update, delete, move columns)
- Add and view comments on tasks
- Real-time task search & filtering
- Task priority badges (high/medium/low) + creator info
- Responsive basic UI with modals
- All core API endpoints tested (Vitest)

## Tech Stack

**Frontend**  
- React 18 + TypeScript  
- Vite (build tool)  
- TanStack Query (data fetching, caching, optimistic updates)  
- React Router v6  
- Tailwind CSS / basic styling  

**Backend**  
- Node.js + Express  
- TypeScript  
- SQLite (local database)  
- JWT for authentication  
- Zod for schema validation  
- bcrypt for password hashing  

**Testing & Tools**  
- Vitest (unit/integration tests)  
- ESLint + Prettier  
- pnpm workspaces  
- GitHub Actions (CI)

## Demo Account

- **Email**: demo@example.com  
- **Password**: password123

## Setup & Run Locally

```bash
# Clone the repo
git clone https://github.com/Soufianeidboubker/technical-assignment-solution.git
cd technical-assignment-solution

# Install dependencies
pnpm install

# Start both frontend & backend
pnpm dev
# → Frontend: http://localhost:5173
# → Backend: http://localhost:4000
Tests
Bashpnpm test
All tests pass (API endpoints + frontend smoke tests).
Demo Videos (Silent Screen Recordings)

[App Demo] – Full user flows: login, board overview, real-time search, task details & comments, create task, drag & drop, logout
https://drive.google.com/file/d/1HvyxUKtTeyo7fvymaW15yOG9CcFVIx8t/view?usp=sharing
[Tests Demo] – Running pnpm test (all passing)
https://drive.google.com/file/d/1ZdZgMxqyukiBGa1p1PrYQS3pEjrCphhe/view?usp=sharing

Key Design Decision
I chose TanStack Query for the frontend data layer because:

It handles automatic caching, background refetching, and stale-while-revalidate out of the box
Supports optimistic updates (e.g. instant drag & drop feedback)
Reduces boilerplate compared to Redux or manual state management
Makes the app feel fast and responsive even on slow networks

This decision prioritizes developer experience and user-perceived performance while keeping the codebase simple.
Note on CI
Some lint/typecheck warnings appear in GitHub Actions (mainly Zod type inference + ESLint config), but the application runs perfectly locally with all tests passing as shown in the videos.
Thank you for reviewing my submission!
Looking forward to your feedback.
Soufiane Idboubker
February 2026
