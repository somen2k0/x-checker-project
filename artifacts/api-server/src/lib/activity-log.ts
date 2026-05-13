import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let tableReady = false;

async function ensureTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_request_log (
      id        SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      count     INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getPool(): Promise<Pool> {
  if (!tableReady) {
    await ensureTable();
    tableReady = true;
  }
  return pool;
}

export async function logActivity(eventType: string, count = 1): Promise<void> {
  try {
    const p = await getPool();
    await p.query(
      "INSERT INTO app_request_log (event_type, count) VALUES ($1, $2)",
      [eventType, count],
    );
    await p.query(`
      DELETE FROM app_request_log
      WHERE id NOT IN (
        SELECT id FROM app_request_log ORDER BY created_at DESC LIMIT 200
      )
    `);
  } catch (err) {
    console.error("logActivity error", err);
  }
}

export interface ActivityEntry {
  id: number;
  event_type: string;
  count: number;
  created_at: string;
}

export async function getRecentActivity(limit = 50): Promise<ActivityEntry[]> {
  try {
    const p = await getPool();
    const res = await p.query<ActivityEntry>(
      "SELECT id, event_type, count, created_at FROM app_request_log ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return res.rows;
  } catch {
    return [];
  }
}
