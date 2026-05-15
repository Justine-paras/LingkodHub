import db from '../db.js';
const users = db.prepare('SELECT id, role, email, is_email_verified FROM users').all();
console.log(JSON.stringify(users, null, 2));
process.exit(0);
