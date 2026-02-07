import express from "express";
import cors from "cors";
import { sendError } from "./errors.js";
import { initDatabase } from "./db/index.js";
import { seedDatabase } from "./db/seed.js";
import authRoutes from "./auth/routes.js";
import boardsRoutes from "./routes/boards.js";
import columnsRoutes from "./routes/columns.js";
import tasksRoutes from "./routes/tasks.js";
import commentsRoutes from "./routes/comments.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize database on startup
initDatabase();
await seedDatabase();

// Routes
app.use('/auth', authRoutes);
app.use('/boards', boardsRoutes);
app.use('/columns', columnsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/comments', commentsRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: "Route not found",
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});