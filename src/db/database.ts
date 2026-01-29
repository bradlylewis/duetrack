import * as SQLite from 'expo-sqlite';
import { SCHEMA_VERSION } from '@/src/constants/database';

const DATABASE_NAME = 'billtracker.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await openDatabase();

  // Create all tables
  try {
    // Bills table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dueDate INTEGER NOT NULL,
        amount REAL,
        frequency TEXT NOT NULL,
        autopay BOOLEAN NOT NULL DEFAULT 0,
        notes TEXT,
        iconKey TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        notificationIds TEXT,
        timezone TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_bills_dueDate ON bills(dueDate);
      CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
      CREATE INDEX IF NOT EXISTS idx_bills_frequency ON bills(frequency);

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        billId TEXT NOT NULL REFERENCES bills(id),
        paidDate INTEGER NOT NULL,
        amountPaid REAL,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_payments_billId ON payments(billId);
      CREATE INDEX IF NOT EXISTS idx_payments_paidDate ON payments(paidDate);

      -- App meta table
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt INTEGER NOT NULL
      );
    `);

    // Initialize app meta if not exists
    const existingVersion = await getAppMeta('schema_version');
    if (!existingVersion) {
      await setAppMeta('schema_version', SCHEMA_VERSION);
      await setAppMeta('notification_permission_status', 'unknown');
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await setAppMeta('current_timezone', timezone);
    }
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

export async function runAsync(sql: string, params: any[] = []): Promise<void> {
  const database = await openDatabase();
  await database.runAsync(sql, params);
}

export async function getAsync<T>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const database = await openDatabase();
  const result = await database.getFirstAsync<T>(sql, params);
  return result || null;
}

export async function getAllAsync<T>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const database = await openDatabase();
  const results = await database.getAllAsync<T>(sql, params);
  return results || [];
}

export async function getAppMeta(key: string): Promise<string | null> {
  const result = await getAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [key]
  );
  return result?.value || null;
}

export async function setAppMeta(key: string, value: string): Promise<void> {
  const now = Date.now();
  await runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updatedAt)
     VALUES (?, ?, ?)`,
    [key, value, now]
  );
}

export async function deleteAppMeta(key: string): Promise<void> {
  await runAsync('DELETE FROM app_meta WHERE key = ?', [key]);
}

export async function clearAllData(): Promise<void> {
  const database = await openDatabase();
  await database.execAsync('DELETE FROM payments; DELETE FROM bills; DELETE FROM app_meta;');
}
