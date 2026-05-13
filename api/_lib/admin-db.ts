import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Add a PostgreSQL database URL to your Vercel environment variables.");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// ── app_config ────────────────────────────────────────────────────────────────

let configTableReady = false;

async function ensureConfigTable(): Promise<void> {
  if (configTableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_config (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  configTableReady = true;
}

export async function getConfig(key: string): Promise<string | null> {
  try {
    await ensureConfigTable();
    const result = await getPool().query(
      "SELECT value FROM app_config WHERE key = $1",
      [key],
    );
    return (result.rows[0] as { value: string } | undefined)?.value ?? null;
  } catch {
    return null;
  }
}

export async function setConfig(key: string, value: string): Promise<void> {
  await ensureConfigTable();
  await getPool().query(
    `INSERT INTO app_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value],
  );
}

export async function deleteConfig(key: string): Promise<void> {
  await ensureConfigTable();
  await getPool().query("DELETE FROM app_config WHERE key = $1", [key]);
}

export async function getAllConfig(): Promise<Record<string, string>> {
  try {
    await ensureConfigTable();
    const result = await getPool().query("SELECT key, value FROM app_config");
    return Object.fromEntries(
      (result.rows as { key: string; value: string }[]).map((r) => [r.key, r.value]),
    );
  } catch {
    return {};
  }
}

// ── app_stats ─────────────────────────────────────────────────────────────────

let statsTableReady = false;

async function ensureStatsTable(): Promise<void> {
  if (statsTableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_stats (
      key        TEXT PRIMARY KEY,
      value      BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  statsTableReady = true;
}

export async function getStats(): Promise<Record<string, number>> {
  try {
    await ensureStatsTable();
    const result = await getPool().query(
      "SELECT key, value FROM app_stats ORDER BY key",
    );
    return Object.fromEntries(
      (result.rows as { key: string; value: string }[]).map((r) => [
        r.key,
        parseInt(r.value, 10),
      ]),
    );
  } catch {
    return {};
  }
}

export async function increment(key: string, amount = 1): Promise<void> {
  try {
    await ensureStatsTable();
    await getPool().query(
      `INSERT INTO app_stats (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value      = app_stats.value + EXCLUDED.value,
             updated_at = NOW()`,
      [key, amount],
    );
  } catch {
    // fire-and-forget — never crash a route because of stat tracking
  }
}

// ── app_request_log ───────────────────────────────────────────────────────────

let logTableReady = false;

async function ensureLogTable(): Promise<void> {
  if (logTableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_request_log (
      id         SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      count      INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  logTableReady = true;
}

export interface ActivityEntry {
  id: number;
  event_type: string;
  count: number;
  created_at: string;
}

export async function logActivity(eventType: string, count = 1): Promise<void> {
  try {
    await ensureLogTable();
    await getPool().query(
      "INSERT INTO app_request_log (event_type, count) VALUES ($1, $2)",
      [eventType, count],
    );
    await getPool().query(`
      DELETE FROM app_request_log
      WHERE id NOT IN (
        SELECT id FROM app_request_log ORDER BY created_at DESC LIMIT 200
      )
    `);
  } catch {
    // fire-and-forget — never crash a route because of activity logging
  }
}

export async function getRecentActivity(limit = 50): Promise<ActivityEntry[]> {
  try {
    await ensureLogTable();
    const res = await getPool().query<ActivityEntry>(
      "SELECT id, event_type, count, created_at FROM app_request_log ORDER BY created_at DESC LIMIT $1",
      [limit],
    );
    return res.rows;
  } catch {
    return [];
  }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function getAdminPassword(): Promise<string | null> {
  const dbPw = await getConfig("admin_password");
  return dbPw ?? process.env.ADMIN_PASSWORD ?? null;
}

export function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
}
