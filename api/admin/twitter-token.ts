import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminPassword, getConfig, setConfig, deleteConfig, maskKey } from "../_lib/admin-db";

async function checkAuth(req: VercelRequest): Promise<boolean> {
  const pw = await getAdminPassword();
  if (!pw) return false;
  return req.headers["x-admin-password"] === pw;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  if (!(await checkAuth(req))) {
    res.status(401).json({ error: "Invalid password." });
    return;
  }

  if (req.method === "GET") {
    const token = await getConfig("twitter_bearer_token");
    const envToken = process.env.TWITTER_BEARER_TOKEN;
    res.json({
      set: !!(token || envToken),
      source: token ? "db" : envToken ? "env" : "default",
      masked: token ? maskKey(token) : envToken ? maskKey(envToken) : "Using built-in default",
    });
    return;
  }

  if (req.method === "PUT") {
    const { token } = req.body as { token?: string };
    if (!token || token.trim().length === 0) {
      res.status(400).json({ error: "token is required." });
      return;
    }
    await setConfig("twitter_bearer_token", token.trim());
    res.json({ ok: true });
    return;
  }

  if (req.method === "DELETE") {
    await deleteConfig("twitter_bearer_token");
    res.json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}
