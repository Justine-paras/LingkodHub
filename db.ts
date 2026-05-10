import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Create a new database instance
const dbPath = path.join(process.cwd(), 'database.sqlite');
const isDev = process.env.NODE_ENV !== 'production';
const db = new Database(dbPath, { verbose: isDev ? console.log : undefined });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('client', 'provider')),
      full_name TEXT NOT NULL,
      username TEXT,
      avatar_url TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      about_me TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS provider_services (
      provider_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      PRIMARY KEY (provider_id, service_id),
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      budget REAL NOT NULL,
      is_negotiable INTEGER DEFAULT 0,
      payment_method TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      scheduled_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      job_id INTEGER,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      is_read INTEGER DEFAULT 0,
      reference_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL UNIQUE,
      reviewer_id INTEGER NOT NULL,
      reviewee_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME,
      replaced_by_token_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ── Safe Migrations ─────────────────────────────────────────────────────────
  // SQLite doesn't support ALTER TABLE ... ADD COLUMN IF NOT EXISTS,
  // so we check PRAGMA table_info and only run if the column is absent.

  const jobCols = (db.prepare('PRAGMA table_info(jobs)').all() as any[]).map(c => c.name);
  if (!jobCols.includes('provider_id')) {
    db.exec('ALTER TABLE jobs ADD COLUMN provider_id INTEGER REFERENCES users(id)');
    console.log('[db] Migration: added jobs.provider_id');
  }

  const appCols = (db.prepare('PRAGMA table_info(applications)').all() as any[]).map(c => c.name);
  if (!appCols.includes('message')) {
    db.exec('ALTER TABLE applications ADD COLUMN message TEXT DEFAULT ""');
    console.log('[db] Migration: added applications.message');
  }

  // Seed the database if empty
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (usersCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertUser = db.prepare(`
    INSERT INTO users (role, full_name, username, avatar_url, email, password_hash, phone, location, about_me) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Default password "password123" for seed users
  const defaultHash = bcrypt.hashSync('password123', 10);

  insertUser.run('client', 'Juan Dela Cruz', 'juan_dc', 'https://api.dicebear.com/7.x/notionists/svg?seed=Juan', 'juan.delacruz@example.com', defaultHash, '+63 912 345 6789', 'Makati City, Metro Manila', 'Homeowner looking for reliable local services for property maintenance and occasional errands.');
  insertUser.run('provider', 'Maria Santos', 'maria.santos', 'https://api.dicebear.com/7.x/notionists/svg?seed=Maria', 'maria.santos@example.com', defaultHash, '+63 998 765 4321', 'Quezon City, Metro Manila', 'Professional service provider with 5+ years of experience in residential maintenance and cleaning.');

  const insertService = db.prepare('INSERT INTO services (name) VALUES (?)');
  const services = ['General Cleaning', 'Aircon Cleaning', 'Plumbing Repair', 'Electrical Help', 'Carpentry', 'Errands'];
  services.forEach(service => insertService.run(service));

  const insertProviderService = db.prepare('INSERT INTO provider_services (provider_id, service_id) VALUES (?, ?)');
  insertProviderService.run(2, 1); // Maria - General Cleaning
  insertProviderService.run(2, 2); // Maria - Aircon Cleaning
  insertProviderService.run(2, 3); // Maria - Plumbing Repair

  const insertJob = db.prepare(`
    INSERT INTO jobs (client_id, title, description, location, budget, is_negotiable, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertJob.run(1, 'Need Help Fixing Kitchen Sink', 'The pipe under the kitchen sink is leaking heavily. Need someone to fix or replace it today.', 'Makati City', 800, 1, 'cash', 'pending');
  insertJob.run(1, 'General Home Cleaning', 'Need a thorough cleaning of a 2-bedroom apartment. Cleaning supplies will be provided.', 'BGC, Taguig', 1200, 0, 'GCash', 'pending');
}

// ─── Notification Helper ──────────────────────────────────────────────────────

export function notify(
  userId: number,
  type: string,
  title: string,
  body: string,
  referenceId?: number
) {
  db.prepare(
    'INSERT INTO notifications (user_id, type, title, body, reference_id) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, type, title, body, referenceId ?? null);
}

export default db;
