import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sendError } from '../errors.js';
import { authMiddleware, AuthRequest } from '../auth/middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /columns/:columnId/tasks (with search & pagination)
router.get('/columns/:columnId/tasks', (req: AuthRequest, res) => {
  const columnId = parseInt(req.params.columnId);
  const search = (req.query.search as string) || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || 'created_at';
  const offset = (page - 1) * limit;

  let query = `
    SELECT t.*, u.name as creator_name
    FROM tasks t
    JOIN users u ON t.created_by = u.id
    WHERE t.column_id = ?
  `;
  const params: any[] = [columnId];

  if (search) {
    query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  // Validate sort
  const validSorts = ['created_at', 'priority', 'updated_at'];
  const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
  query += ` ORDER BY t.${sortColumn} DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const tasks = db.prepare(query).all(...params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE column_id = ?';
  const countParams: any[] = [columnId];
  if (search) {
    countQuery += ` AND (title LIKE ? OR description LIKE ?)`;
    countParams.push(`%${search}%`, `%${search}%`);
  }
  const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST /columns/:columnId/tasks
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

router.post('/columns/:columnId/tasks', (req: AuthRequest, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const body = createTaskSchema.parse(req.body);

    const result = db.prepare(`
      INSERT INTO tasks (column_id, title, description, priority, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      columnId,
      body.title,
      body.description || null,
      body.priority || 'medium',
      req.userId!
    );

    const task = db.prepare(`
      SELECT t.*, u.name as creator_name
      FROM tasks t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Create task error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

// PATCH /tasks/:taskId (including moving between columns)
const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  column_id: z.number().int().optional(), // For moving between columns
});

router.patch('/:taskId', (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const body = updateTaskSchema.parse(req.body);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return sendError(res, 404, {
        code: 'NOT_FOUND',
        message: 'Task not found',
      });
    }

    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.priority !== undefined) {
      updates.push('priority = ?');
      values.push(body.priority);
    }
    if (body.column_id !== undefined) {
      updates.push('column_id = ?');
      values.push(body.column_id);
    }

    values.push(taskId);
    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare(`
      SELECT t.*, u.name as creator_name
      FROM tasks t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `).get(taskId);

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Update task error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

// DELETE /tasks/:taskId
router.delete('/:taskId', (req: AuthRequest, res) => {
  const taskId = parseInt(req.params.taskId);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    return sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Task not found',
    });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  res.status(204).send();
});

export default router;