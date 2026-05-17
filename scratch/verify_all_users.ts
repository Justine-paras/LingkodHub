import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('database.sqlite');
const db = new Database(dbPath);

const result = db.prepare('UPDATE users SET is_email_verified = 1').run();
console.log(`Successfully verified all users in the database! Rows affected: ${result.changes}`);
