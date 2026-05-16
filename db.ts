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

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('gcash', 'maya')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      transaction_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      address_text TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
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

  if (!jobCols.includes('is_urgent')) {
    db.exec('ALTER TABLE jobs ADD COLUMN is_urgent INTEGER DEFAULT 0');
    console.log('[db] Migration: added jobs.is_urgent');
  }

  if (!jobCols.includes('category')) {
    db.exec('ALTER TABLE jobs ADD COLUMN category TEXT');
    console.log('[db] Migration: added jobs.category');
  }

  const appCols = (db.prepare('PRAGMA table_info(applications)').all() as any[]).map(c => c.name);
  if (!appCols.includes('message')) {
    db.exec('ALTER TABLE applications ADD COLUMN message TEXT DEFAULT ""');
    console.log('[db] Migration: added applications.message');
  }

  const userCols = (db.prepare('PRAGMA table_info(users)').all() as any[]).map(c => c.name);
  if (!userCols.includes('service_radius')) {
    db.exec('ALTER TABLE users ADD COLUMN service_radius INTEGER DEFAULT 15');
    console.log('[db] Migration: added users.service_radius');
  }

  if (!userCols.includes('is_email_verified')) {
    db.exec('ALTER TABLE users ADD COLUMN is_email_verified INTEGER DEFAULT 0');
    console.log('[db] Migration: added users.is_email_verified');
  }

  if (!userCols.includes('is_documents_verified')) {
    db.exec('ALTER TABLE users ADD COLUMN is_documents_verified INTEGER DEFAULT 0');
    console.log('[db] Migration: added users.is_documents_verified');
  }

  if (!userCols.includes('otp')) {
    db.exec('ALTER TABLE users ADD COLUMN otp TEXT');
    db.exec('ALTER TABLE users ADD COLUMN otp_expires_at DATETIME');
    console.log('[db] Migration: added users.otp columns');
  }

  if (!userCols.includes('document_status')) {
    db.exec('ALTER TABLE users ADD COLUMN document_status TEXT DEFAULT "none"');
    db.exec('ALTER TABLE users ADD COLUMN verification_document_url TEXT');
    console.log('[db] Migration: added users.document_status columns');
  }

  if (!userCols.includes('pref_email_messages')) {
    db.exec('ALTER TABLE users ADD COLUMN pref_email_messages INTEGER DEFAULT 1');
    db.exec('ALTER TABLE users ADD COLUMN pref_email_updates INTEGER DEFAULT 1');
    db.exec('ALTER TABLE users ADD COLUMN pref_email_promos INTEGER DEFAULT 0');
    db.exec('ALTER TABLE users ADD COLUMN pref_push_alerts INTEGER DEFAULT 1');
    db.exec('ALTER TABLE users ADD COLUMN pref_push_marketing INTEGER DEFAULT 0');
    console.log('[db] Migration: added notification preference columns');
  }

  if (!userCols.includes('is_public_profile')) {
    db.exec('ALTER TABLE users ADD COLUMN is_public_profile INTEGER DEFAULT 1');
    db.exec('ALTER TABLE users ADD COLUMN show_online_status INTEGER DEFAULT 0');
    console.log('[db] Migration: added visibility columns');
  }

  if (!userCols.includes('gcash_number')) {
    db.exec('ALTER TABLE users ADD COLUMN gcash_number TEXT');
    db.exec('ALTER TABLE users ADD COLUMN maya_number TEXT');
    console.log('[db] Migration: added payment method columns');
  }


  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (usersCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertService = db.prepare('INSERT INTO services (name) VALUES (?)');
  const services = ['General Cleaning', 'Aircon Cleaning', 'Plumbing Repair', 'Electrical Help', 'Carpentry', 'Errands', 'Tutoring', 'Delivery'];
  services.forEach(service => {
    try {
      insertService.run(service);
    } catch (e) {
      // Ignore duplicates
    }
  });
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
