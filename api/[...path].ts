import { createApp } from "../server";

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) appPromise = createApp();
    const app = await appPromise;

    // Vercel can pass the catch-all function a path without the /api prefix.
    // Our Express routes intentionally use /api/*, so normalize it here.
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
