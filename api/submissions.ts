import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

let pool: Pool | null = null;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, ssl: { rejectUnauthorized: false } });
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed" });
  try {
    const db = getPool();
    if (!db) return res.status(500).json({ success: false, message: "DATABASE_URL chưa được cấu hình." });
    const auth = String(req.headers.authorization || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ success: false, message: "Cần đăng nhập giáo viên." });

    const session = await db.query<{ payload: any }>("SELECT payload FROM app_sessions WHERE token=$1", [token]);
    const user = session.rows[0]?.payload;
    if (!user || !["TEACHER", "SUPER_ADMIN"].includes(String(user.role))) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem kết quả." });
    }

    const studentName = String(req.query.studentName || "").trim();
    const className = String(req.query.className || "").trim();
    const lessonId = String(req.query.lessonId || "").trim();

    const allowedClasses = user.role === "SUPER_ADMIN"
      ? null
      : (await db.query<{ name: string }>("SELECT name FROM app_classes WHERE teacher_username=$1", [user.username])).rows.map(r => r.name);

    let rows = (await db.query<{ payload: any }>("SELECT payload FROM app_submissions ORDER BY recorded_at DESC")).rows.map(r => r.payload);
    if (allowedClasses) rows = rows.filter(s => allowedClasses.includes(String(s.className || "")));
    if (studentName) rows = rows.filter(s => String(s.studentName || "").toLowerCase() === studentName.toLowerCase());
    if (className) rows = rows.filter(s => String(s.className || "") === className);
    if (lessonId) rows = rows.filter(s => String(s.lessonId || "") === lessonId);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || "Lỗi máy chủ." });
  }
}
