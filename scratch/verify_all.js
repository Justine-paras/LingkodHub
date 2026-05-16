import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);
const result = db.prepare('UPDATE users SET is_email_verified = 1').run();
console.log(`Updated ${result.changes} users to verified.`);
