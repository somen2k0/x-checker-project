import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_stats (
      key        TEXT PRIMARY KEY,
      value      BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableReady = true;
}

export async function increment(key: string, amount = 1): Promise<void> {
  try {
    await ensureTable();
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

export async function getStats(): Promise<Record<string, number>> {
  try {
    await ensureTable();
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
