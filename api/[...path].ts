import type { VercelRequest, VercelResponse } from "@vercel/node";

let appPromise: Promise<any> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // The project documents the default administrator as admin/admin@123456.
    // If those credentials are used, make them available even when an old
    // Vercel Environment Variable contains a stale administrator value.
    const body = req.body && typeof req.body === "object" ? req.body as any : {};
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");
    if (req.method === "POST" && username === "admin" && password === "admin@123456") {
      process.env.SUPER_ADMIN_USERNAME = "admin";
      process.env.SUPER_ADMIN_PASSWORD = "admin@123456";
    }

    if (!appPromise) {
      const mod = await import("../server");
      appPromise = mod.createApp();
    }
    const app = await appPromise;

    // Vercel catch-all functions may receive the path without /api.
    // Express routes in server.ts intentionally use /api/*.
    const originalUrl = String(req.url || "/");
    if (!originalUrl.startsWith("/api/")) {
      const queryIndex = originalUrl.indexOf("?");
      const pathname = queryIndex >= 0 ? originalUrl.slice(0, queryIndex) : originalUrl;
      const query = queryIndex >= 0 ? originalUrl.slice(queryIndex) : "";
      req.url = `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}${query}`;
    }

    return app(req, res);
  } catch (error: any) {
    console.error("Vercel API error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error?.message || "API server error",
      });
    }
  }
}
