import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/db/index.js';

describe('Database', () => {
  it('should have users table', () => {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).all();
    
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should have seeded demo user', () => {
    const user = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get('demo@example.com');
    
    expect(user).toBeDefined();
  });

  it('should have board structure', () => {
    const columns = db.prepare('SELECT * FROM columns').all();
    expect(columns.length).toBeGreaterThan(0);
  });
});