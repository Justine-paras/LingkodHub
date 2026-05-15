import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

console.log('--- USERS ---');
const users = db.prepare('SELECT id, email, role, full_name, otp, otp_expires_at FROM users').all();
console.table(users);

console.log('\n--- JOBS ---');
const jobs = db.prepare('SELECT id, client_id, title, status FROM jobs').all();
console.table(jobs);

db.close();
