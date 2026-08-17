import { createApp } from "../server";

let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) appPromise = createApp();
    const app = await appPromise;
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
