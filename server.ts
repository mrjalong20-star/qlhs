import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createHmac, timingSafeEqual } from "crypto";

export type Session = { role: "SUPER_ADMIN" | "TEACHER"; username: string; displayName: string; createdAt: number };

const HEARTBEAT_MAX_GAP_SECONDS = 90;
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || "admin";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "admin@123456";
const ADMIN_TOKEN_SECRET = process.env.SUPER_ADMIN_SECRET || SUPER_ADMIN_PASSWORD;

let pool: any = null;
let dbReady: Promise<void> | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    const loadPg = new Function("return import('pg')") as () => Promise<any>;
    pool = loadPg().then(({ Pool }) => new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    }));
  }
  return pool;
}

async function initDatabase() {
  const db = await getPool();
  if (!db) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_teachers (
      username TEXT PRIMARY KEY, password TEXT NOT NULL, display_name TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_classes (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, class_code TEXT NOT NULL,
      school_year TEXT NOT NULL DEFAULT '', teacher_username TEXT NOT NULL,
      teacher_name TEXT NOT NULL, students JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_submissions (
      attempt_id TEXT PRIMARY KEY, payload JSONB NOT NULL, recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS app_presence (
      session_id TEXT PRIMARY KEY, payload JSONB NOT NULL, last_seen_ms BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_sessions (
      token TEXT PRIMARY KEY, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS app_submissions_payload_gin ON app_submissions USING GIN (payload);
    CREATE INDEX IF NOT EXISTS app_classes_teacher_idx ON app_classes (teacher_username);
    CREATE INDEX IF NOT EXISTS app_presence_last_seen_idx ON app_presence (last_seen_ms);
  `);
}

async function ensureDatabase() {
  if (!getPool()) return;
  if (!dbReady) {
    dbReady = initDatabase().catch((err) => { dbReady = null; throw err; });
  }
  await dbReady;
}

async function query<T = any>(text: string, values: any[] = []) {
  await ensureDatabase();
  const db = await getPool();
  if (!db) throw new Error("DATABASE_URL chưa được cấu hình.");
  return db.query(text, values);
}

function slugifyClass(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "-").replace(/-+/g, "-");
}
function memoryFallback() { return !getPool(); }

function makeAdminToken(): string {
  const payload = Buffer.from(JSON.stringify({ role: "SUPER_ADMIN", username: SUPER_ADMIN_USERNAME, displayName: "Quản trị viên", createdAt: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", ADMIN_TOKEN_SECRET).update(payload).digest("base64url");
  return `admin.${payload}.${sig}`;
}

function verifyAdminToken(token: string): Session | null {
  if (!token.startsWith("admin.")) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const expected = createHmac("sha256", ADMIN_TOKEN_SECRET).update(parts[1]).digest("base64url");
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Session;
    if (session.role !== "SUPER_ADMIN" || session.username !== SUPER_ADMIN_USERNAME) return null;
    return session;
  } catch { return null; }
}

export async function createApp() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  const memory = {
    submissions: [] as any[], presence: new Map<string, any>(), sessions: new Map<string, Session>(),
    classes: new Map<string, any>(), teachers: new Map<string, { username: string; password: string; displayName: string; active: boolean; createdAt: string }>(),
  };

  async function getSession(req: express.Request): Promise<(Session & { token: string }) | null> {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return null;
    const adminSession = verifyAdminToken(token);
    if (adminSession) return { token, ...adminSession };
    if (memoryFallback()) {
      const session = memory.sessions.get(token);
      return session ? { token, ...session } : null;
    }
    const result = await query<{ payload: Session }>("SELECT payload FROM app_sessions WHERE token=$1", [token]);
    const session = result.rows[0]?.payload;
    return session ? { token, ...session } : null;
  }

  async function requireRole(req: express.Request, res: express.Response, roles: Session["role"][]) {
    const session = await getSession(req);
    if (!session) { res.status(401).json({ success: false, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }); return null; }
    if (!roles.includes(session.role)) { res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này." }); return null; }
    return session;
  }
  const requireAdmin = (req: express.Request, res: express.Response) => requireRole(req, res, ["SUPER_ADMIN"]);
  const requireTeacher = (req: express.Request, res: express.Response) => requireRole(req, res, ["TEACHER"]);

  app.get("/api/health", async (_req, res) => {
    try {
      await ensureDatabase();
      if (memoryFallback()) return res.json({ status: "ok", database: "memory", time: new Date().toISOString() });
      await query("SELECT 1");
      res.json({ status: "ok", database: "postgres", time: new Date().toISOString() });
    } catch (err: any) { res.status(500).json({ status: "error", database: "postgres", message: err.message }); }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const cleanUsername = String(req.body?.username || "").trim();
      const cleanPassword = String(req.body?.password || "");
      let session: Session | null = null;
      if (cleanUsername === SUPER_ADMIN_USERNAME && cleanPassword === SUPER_ADMIN_PASSWORD) {
        session = { role: "SUPER_ADMIN", username: SUPER_ADMIN_USERNAME, displayName: "Quản trị viên", createdAt: Date.now() };
      } else if (memoryFallback()) {
        const teacher = memory.teachers.get(cleanUsername);
        if (teacher?.active && teacher.password === cleanPassword) session = { role: "TEACHER", username: teacher.username, displayName: teacher.displayName, createdAt: Date.now() };
      } else {
        const result = await query<{ username: string; display_name: string; active: boolean; password: string }>("SELECT username, display_name, active, password FROM app_teachers WHERE username=$1", [cleanUsername]);
        const teacher = result.rows[0];
        if (teacher?.active && teacher.password === cleanPassword) session = { role: "TEACHER", username: teacher.username, displayName: teacher.display_name, createdAt: Date.now() };
      }
      if (!session) return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa." });
      const token = session.role === "SUPER_ADMIN" ? makeAdminToken() : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
      if (session.role === "TEACHER") {
        if (memoryFallback()) memory.sessions.set(token, session);
        else await query("INSERT INTO app_sessions(token,payload) VALUES($1,$2::jsonb)", [token, JSON.stringify(session)]);
      }
      res.json({ success: true, session: { token, ...session } });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message || "Lỗi máy chủ." }); }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      if (token && !verifyAdminToken(token)) {
        if (memoryFallback()) memory.sessions.delete(token); else await query("DELETE FROM app_sessions WHERE token=$1", [token]);
      }
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  app.get("/api/teachers", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      if (memoryFallback()) return res.json({ success: true, data: Array.from(memory.teachers.values()).map(({ password, ...t }) => t) });
      const r = await query("SELECT username, display_name AS \"displayName\", active, created_at AS \"createdAt\" FROM app_teachers ORDER BY created_at DESC");
      res.json({ success: true, data: r.rows });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const username = String(req.body?.username || "").trim(), password = String(req.body?.password || ""), displayName = String(req.body?.displayName || "").trim();
      if (!username || !password || !displayName) return res.status(400).json({ success: false, message: "Cần tài khoản, mật khẩu và tên giáo viên." });
      if (username === SUPER_ADMIN_USERNAME) return res.status(409).json({ success: false, message: "Tài khoản đã tồn tại." });
      if (memoryFallback()) {
        if (memory.teachers.has(username)) return res.status(409).json({ success: false, message: "Tài khoản đã tồn tại." });
        memory.teachers.set(username, { username, password, displayName, active: true, createdAt: new Date().toISOString() });
      } else {
        const r = await query("INSERT INTO app_teachers(username,password,display_name,active) VALUES($1,$2,$3,true) ON CONFLICT(username) DO NOTHING RETURNING username", [username,password,displayName]);
        if (!r.rowCount) return res.status(409).json({ success: false, message: "Tài khoản đã tồn tại." });
      }
      res.json({ success: true, data: { username, displayName, active: true } });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  app.patch("/api/teachers/:username", async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const username = req.params.username;
      if (memoryFallback()) {
        const teacher = memory.teachers.get(username);
        if (!teacher) return res.status(404).json({ success: false, message: "Không tìm thấy giáo viên." });
        if (typeof req.body?.active === "boolean") teacher.active = req.body.active;
        if (typeof req.body?.password === "string" && req.body.password) teacher.password = req.body.password;
        if (typeof req.body?.displayName === "string" && req.body.displayName.trim()) teacher.displayName = req.body.displayName.trim();
        memory.teachers.set(username, teacher);
        return res.json({ success: true, data: { username, displayName: teacher.displayName, active: teacher.active } });
      }
      const current = await query<{ display_name: string; active: boolean }>("SELECT display_name, active FROM app_teachers WHERE username=$1", [username]);
      if (!current.rowCount) return res.status(404).json({ success: false, message: "Không tìm thấy giáo viên." });
      const displayName = typeof req.body?.displayName === "string" && req.body.displayName.trim() ? req.body.displayName.trim() : current.rows[0].display_name;
      const active = typeof req.body?.active === "boolean" ? req.body.active : current.rows[0].active;
      const password = typeof req.body?.password === "string" && req.body.password ? req.body.password : undefined;
      if (password) await query("UPDATE app_teachers SET display_name=$2, active=$3, password=$4 WHERE username=$1", [username,displayName,active,password]);
      else await query("UPDATE app_teachers SET display_name=$2, active=$3 WHERE username=$1", [username,displayName,active]);
      res.json({ success: true, data: { username, displayName, active } });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const auth = await requireTeacher(req, res); if (!auth) return;
      const cleanName = String(req.body?.name || "").trim();
      if (!cleanName) return res.status(400).json({ success: false, message: "Vui lòng nhập tên lớp." });
      const id = `class_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const classCode = `${slugifyClass(cleanName)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const schoolYear = String(req.body?.schoolYear || "");
      const record = { id, name: cleanName, classCode, schoolYear, teacherUsername: auth.username, teacherName: auth.displayName, createdAt: new Date().toISOString(), students: [] as any[] };
      if (memoryFallback()) memory.classes.set(id, record); else await query("INSERT INTO app_classes(id,name,class_code,school_year,teacher_username,teacher_name,students) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)", [id,cleanName,classCode,schoolYear,auth.username,auth.displayName,"[]"]);
      res.json({ success: true, data: record, joinUrl: `/?class=${encodeURIComponent(id)}` });
    } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
  });

  // Keep the remainder of the existing API routes below this point unchanged.
  return app;
}

// Local development entry point. Vercel imports createApp() instead.
if (process.env.VERCEL !== "1") {
  createApp().then(async (app) => {
    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => console.log(`QLHS server running at http://localhost:${port}`));
  }).catch((err) => { console.error(err); process.exit(1); });
}
