import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

let pool: Pool | null = null;
function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL chưa được cấu hình.");
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
  return pool;
}

async function ensureSchema() {
  await db().query(`CREATE TABLE IF NOT EXISTS app_formulas(id TEXT PRIMARY KEY,grade INTEGER NOT NULL DEFAULT 6,teacher_username TEXT NOT NULL,payload JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
}

async function session(req: VercelRequest) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const r = await db().query("SELECT payload FROM app_sessions WHERE token=$1", [token]);
  return r.rows[0]?.payload || null;
}

function grade(value: unknown) {
  const g = Number(value || 6);
  return Number.isInteger(g) && g >= 6 && g <= 12 ? g : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();
    if (req.method === "GET") {
      const g = req.query.grade === undefined ? null : grade(req.query.grade);
      if (req.query.grade !== undefined && g === null) return res.status(400).json({ success: false, message: "Khối phải từ 6 đến 12." });
      const result = g === null
        ? await db().query("SELECT payload FROM app_formulas ORDER BY grade, created_at")
        : await db().query("SELECT payload FROM app_formulas WHERE grade=$1 ORDER BY created_at", [g]);
      return res.status(200).json({ success: true, data: result.rows.map((r: any) => r.payload) });
    }

    const current = await session(req);
    if (!current || !["TEACHER", "SUPER_ADMIN"].includes(String(current.role))) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập giáo viên/admin." });

    if (req.method === "POST") {
      const body = req.body || {};
      const g = grade(body.grade);
      if (g === null || !String(body.title || "").trim() || !String(body.formula || "").trim()) return res.status(400).json({ success: false, message: "Cần khối, tên công thức và công thức." });
      const id = String(body.id || `formula_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
      const payload = { ...body, id, grade: g, title: String(body.title).trim(), formula: String(body.formula).trim() };
      await db().query("INSERT INTO app_formulas(id,grade,teacher_username,payload) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(id) DO UPDATE SET grade=EXCLUDED.grade,teacher_username=EXCLUDED.teacher_username,payload=EXCLUDED.payload,updated_at=NOW()", [id, g, current.username, JSON.stringify(payload)]);
      return res.status(200).json({ success: true, data: payload });
    }

    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id công thức." });
    if (req.method === "PATCH") {
      const body = req.body || {};
      const existing = await db().query("SELECT payload FROM app_formulas WHERE id=$1", [id]);
      if (!existing.rowCount) return res.status(404).json({ success: false, message: "Không tìm thấy công thức." });
      const payload = { ...existing.rows[0].payload, ...body, id };
      const g = grade(payload.grade);
      if (g === null) return res.status(400).json({ success: false, message: "Khối phải từ 6 đến 12." });
      await db().query("UPDATE app_formulas SET grade=$2,payload=$3::jsonb,updated_at=NOW() WHERE id=$1", [id, g, JSON.stringify({ ...payload, grade: g })]);
      return res.status(200).json({ success: true, data: { ...payload, grade: g } });
    }
    if (req.method === "DELETE") {
      await db().query("DELETE FROM app_formulas WHERE id=$1", [id]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error: any) {
    console.error("Formula API error:", error);
    return res.status(500).json({ success: false, message: error?.message || "Lỗi máy chủ." });
  }
}
