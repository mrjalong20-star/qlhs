export interface AuthSession {
  role: "SUPER_ADMIN" | "TEACHER";
  username: string;
  displayName: string;
  token: string;
}

const KEY = "geo11_auth_session";

export const authService = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  save(session: AuthSession) { localStorage.setItem(KEY, JSON.stringify(session)); },
  clear() { localStorage.removeItem(KEY); },
  async login(username: string, password: string): Promise<AuthSession> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const raw = await res.text();
    let json: any = {};
    try { json = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON response */ }
    if (!res.ok || !json.success) {
      const serverMessage = json?.message || raw?.slice(0, 180);
      throw new Error(serverMessage ? `Đăng nhập lỗi (${res.status}): ${serverMessage}` : `Đăng nhập lỗi (${res.status}).`);
    }
    if (!json.session?.token || !json.session?.role) throw new Error("API đăng nhập không trả về phiên hợp lệ.");
    const session = json.session as AuthSession;
    authService.save(session);
    return session;
  },
  async logout() {
    const session = authService.get();
    try {
      if (session?.token) await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${session.token}` } });
    } catch {}
    authService.clear();
  },
  headers(): HeadersInit {
    const session = authService.get();
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  }
};
