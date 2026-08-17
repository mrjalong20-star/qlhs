import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || !process.env.DATABASE_URL) return res.status(200).json({ success: true });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 8000, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS app_sessions (token TEXT PRIMARY KEY, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
    await pool.query("DELETE FROM app_sessions WHERE token=$1", [token]);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || "Lỗi đăng xuất." });
  } finally {
    await pool.end().catch(() => {});
  }
}
