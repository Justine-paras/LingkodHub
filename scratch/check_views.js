import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

try {
    const views = db.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'view'").all();
    console.log(JSON.stringify(views, null, 2));
} catch (e) {
    console.error(e);
}
