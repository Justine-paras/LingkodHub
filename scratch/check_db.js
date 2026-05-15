import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

try {
    const info = db.prepare('PRAGMA table_info(users)').all();
    console.log(JSON.stringify(info, null, 2));
} catch (e) {
    console.error(e);
}
