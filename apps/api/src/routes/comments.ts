import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sendError } from '../errors.js';
import { authMiddleware, AuthRequest } from '../auth/middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /tasks/:taskId/comments
router.get('/tasks/:taskId/comments', (req: AuthRequest, res) => {
  const taskId = parseInt(req.params.taskId);

  const comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.email as user_email
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ?
    ORDER BY c.created_at ASC
  `).all(taskId);

  res.json(comments);
});

// POST /tasks/:taskId/comments
const createCommentSchema = z.object({
  content: z.string().min(1),
});

router.post('/tasks/:taskId/comments', (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const body = createCommentSchema.parse(req.body);

    // Check if task exists
    const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return sendError(res, 404, {
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    const result = db.prepare(`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (?, ?, ?)
    `).run(taskId, req.userId!, body.content);

    const comment = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Create comment error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

export default router;