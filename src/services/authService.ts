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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || "Đăng nhập thất bại");
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
