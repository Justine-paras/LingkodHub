import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);
const passwordHash = bcrypt.hashSync('password123', 10);

db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'testclient@example.com');
db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'testprovider@example.com');

console.log('Updated passwords for testclient@example.com and testprovider@example.com to password123');
