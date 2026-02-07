import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sendError } from '../errors.js';
import { authMiddleware, AuthRequest } from '../auth/middleware.js';

const router = Router();
router.use(authMiddleware);

// PATCH /columns/:columnId
const updateColumnSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
});

router.patch('/:columnId', (req: AuthRequest, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const body = updateColumnSchema.parse(req.body);

    const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(columnId);
    if (!column) {
      return sendError(res, 404, {
        code: 'NOT_FOUND',
        message: 'Column not found',
      });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    if (body.position !== undefined) {
      updates.push('position = ?');
      values.push(body.position);
    }

    if (updates.length > 0) {
      values.push(columnId);
      db.prepare(`UPDATE columns SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM columns WHERE id = ?').get(columnId);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Update column error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

// DELETE /columns/:columnId
router.delete('/:columnId', (req: AuthRequest, res) => {
  const columnId = parseInt(req.params.columnId);

  const column = db.prepare('SELECT * FROM columns WHERE id = ?').get(columnId);
  if (!column) {
    return sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Column not found',
    });
  }

  db.prepare('DELETE FROM columns WHERE id = ?').run(columnId);
  res.status(204).send();
});

export default router;