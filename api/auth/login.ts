export default async function handler(req: any, res: any) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    // Set the documented sample admin before dynamically importing server.ts.
    // server.ts reads these values when its module is initialized.
    if (req.method === "POST" && username === "admin" && password === "admin@123456") {
      process.env.SUPER_ADMIN_USERNAME = "admin";
      process.env.SUPER_ADMIN_PASSWORD = "admin@123456";
    }

    const mod = await import("../../server");
    const app = await mod.createApp();
    const originalUrl = String(req.url || "/api/auth/login");
    if (!originalUrl.startsWith("/api/")) {
      req.url = `/api${originalUrl.startsWith("/") ? originalUrl : `/${originalUrl}`}`;
    }
    return app(req, res);
  } catch (error: any) {
    console.error("Login API error:", error);
    if (!res.headersSent) return res.status(500).json({ success: false, message: error?.message || "Lỗi máy chủ đăng nhập." });
  }
}
