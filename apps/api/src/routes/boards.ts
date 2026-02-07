import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sendError } from '../errors.js';
import { authMiddleware, AuthRequest } from '../auth/middleware.js';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /boards/:boardId
router.get('/:boardId', (req: AuthRequest, res) => {
  const boardId = parseInt(req.params.boardId);

  const board = db.prepare(`
    SELECT b.*, u.name as creator_name 
    FROM boards b 
    JOIN users u ON b.created_by = u.id 
    WHERE b.id = ?
  `).get(boardId);

  if (!board) {
    return sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Board not found',
    });
  }

  res.json(board);
});

// GET /boards/:boardId/columns
router.get('/:boardId/columns', (req: AuthRequest, res) => {
  const boardId = parseInt(req.params.boardId);

  const columns = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM tasks WHERE column_id = c.id) as tasks_count
    FROM columns c
    WHERE c.board_id = ?
    ORDER BY c.position
  `).all(boardId);

  res.json(columns);
});

// POST /boards/:boardId/columns
const createColumnSchema = z.object({
  title: z.string().min(1),
  position: z.number().int().min(0),
});

router.post('/:boardId/columns', (req: AuthRequest, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const body = createColumnSchema.parse(req.body);

    const result = db.prepare(
      'INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)'
    ).run(boardId, body.title, body.position);

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(column);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Create column error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

export default router;