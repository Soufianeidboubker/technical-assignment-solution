import { db } from './index.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('⏭️  Database already seeded');
    return;
  }

  console.log('🌱 Seeding database...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const insertUser = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)');
  const user1 = insertUser.run('demo@example.com', 'Demo User', hashedPassword);
  const user2 = insertUser.run('john@example.com', 'John Doe', hashedPassword);

  // Create demo board
  const insertBoard = db.prepare('INSERT INTO boards (title, created_by) VALUES (?, ?)');
  const board = insertBoard.run('Team Project Board', user1.lastInsertRowid);

  // Create columns
  const insertColumn = db.prepare('INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)');
  const todoCol = insertColumn.run(board.lastInsertRowid, 'To Do', 0);
  const inProgressCol = insertColumn.run(board.lastInsertRowid, 'In Progress', 1);
  const doneCol = insertColumn.run(board.lastInsertRowid, 'Done', 2);

  // Create demo tasks
  const insertTask = db.prepare(
    'INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)'
  );
  
  const task1 = insertTask.run(
    todoCol.lastInsertRowid,
    'Design new landing page',
    'Create mockups for the new landing page design',
    'high',
    user1.lastInsertRowid
  );
  
  insertTask.run(
    todoCol.lastInsertRowid,
    'Setup CI/CD pipeline',
    'Configure GitHub Actions for automated testing',
    'medium',
    user2.lastInsertRowid
  );
  
  insertTask.run(
    inProgressCol.lastInsertRowid,
    'Implement authentication',
    'Add JWT-based authentication to the API',
    'high',
    user1.lastInsertRowid
  );
  
  insertTask.run(
    doneCol.lastInsertRowid,
    'Project setup',
    'Initialize project with TypeScript and dependencies',
    'medium',
    user2.lastInsertRowid
  );

  // Create demo comments
  const insertComment = db.prepare('INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)');
  insertComment.run(task1.lastInsertRowid, user1.lastInsertRowid, 'Let\'s use Figma for this');
  insertComment.run(task1.lastInsertRowid, user2.lastInsertRowid, 'Sounds good! I\'ll review it once ready');

  console.log('✅ Database seeded successfully');
  console.log('📧 Demo login: demo@example.com / password123');
}