import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const usernameForAdmin = () => process.env.SUPER_ADMIN_USERNAME || "admin";
const passwordForAdmin = () => process.env.SUPER_ADMIN_PASSWORD || "admin@123456";

let pool: Pool | null = null;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureTables(db: Pool) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_teachers (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_sessions (
      token TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    let session: any = null;
    if (username === usernameForAdmin() && password === passwordForAdmin()) {
      session = { role: "SUPER_ADMIN", username, displayName: "Quản trị viên", createdAt: Date.now() };
    } else {
      const db = getPool();
      if (!db) return res.status(503).json({ success: false, message: "Database chưa được cấu hình. Hãy thêm DATABASE_URL trên Vercel." });
      await ensureTables(db);
      const result = await db.query(
        "SELECT username, display_name, active, password FROM app_teachers WHERE username=$1",
        [username]
      );
      const teacher = result.rows[0];
      if (!teacher?.active || teacher.password !== password) {
        return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa." });
      }
      session = { role: "TEACHER", username: teacher.username, displayName: teacher.display_name, createdAt: Date.now() };
    }

    const token = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
    const db = getPool();
    if (!db) {
      return res.status(503).json({ success: false, message: "Database chưa được cấu hình." });
    }
    await ensureTables(db);
    await db.query("INSERT INTO app_sessions(token,payload) VALUES($1,$2::jsonb)", [token, JSON.stringify(session)]);

    return res.status(200).json({ success: true, session: { token, ...session } });
  } catch (error: any) {
    console.error("login error", error);
    return res.status(500).json({ success: false, message: error?.message || "Lỗi máy chủ đăng nhập." });
  }
}
