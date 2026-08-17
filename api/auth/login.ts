import { createApp } from "../../server";

export default async function handler(req: any, res: any) {
  try {
    // Set the documented sample admin before server.ts is imported/cached.
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    if (req.method === "POST" && username === "admin" && password === "admin@123456") {
      process.env.SUPER_ADMIN_USERNAME = "admin";
      process.env.SUPER_ADMIN_PASSWORD = "admin@123456";
    }

    const app = await createApp();
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
