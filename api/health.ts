import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ status: "ok", database: "not-configured", message: "DATABASE_URL chưa được cấu hình" });
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 8000, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({ status: "ok", database: "postgres" });
  } catch (error: any) {
    return res.status(500).json({ status: "error", database: "postgres", message: error?.message || "Database error" });
  } finally {
    await pool.end().catch(() => {});
  }
}
