import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sendError } from '../errors.js';
import { generateToken } from './middleware.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email);
    if (existing) {
      return sendError(res, 409, {
        code: 'CONFLICT',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Insert user
    const result = db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    ).run(body.email, hashedPassword, body.name);

    const userId = result.lastInsertRowid as number;
    const token = generateToken(userId);

    res.status(201).json({
      user: {
        id: userId,
        email: body.email,
        name: body.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Register error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = db.prepare(
      'SELECT id, email, name, password FROM users WHERE email = ?'
    ).get(body.email) as any;

    if (!user) {
      return sendError(res, 401, {
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      return sendError(res, 401, {
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: error.errors,
      });
    }
    console.error('Login error:', error);
    return sendError(res, 500, {
      code: 'INTERNAL',
      message: 'Internal server error',
    });
  }
});

export default router;