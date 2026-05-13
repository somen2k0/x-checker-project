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
    CREATE TABLE IF NOT EXISTS app_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableReady = true;
}

export async function getConfig(key: string): Promise<string | null> {
  try {
    await ensureTable();
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
  await ensureTable();
  await getPool().query(
    `INSERT INTO app_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value],
  );
}

export async function deleteConfig(key: string): Promise<void> {
  await ensureTable();
  await getPool().query("DELETE FROM app_config WHERE key = $1", [key]);
}

export async function getAllConfig(): Promise<Record<string, string>> {
  try {
    await ensureTable();
    const result = await getPool().query(
      "SELECT key, value FROM app_config",
    );
    return Object.fromEntries(
      (result.rows as { key: string; value: string }[]).map((r) => [r.key, r.value]),
    );
  } catch {
    return {};
  }
}
