import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getDb } from "../db";
import { acceptMediaState, authorizeMediaTransport, redirectMemberToMediaPlayer } from "../selfHostedLiveMedia";
import { serveStatic, setupVite } from "./vite";
import {
  aiRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  communityRateLimiter,
  localAuthRateLimiter,
  sameOriginMutationGuard,
  securityHeaders,
  uploadRateLimiter,
  weatherRateLimiter,
} from "../security";

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok", releaseId: process.env.RELEASE_ID ?? "development" }));
  app.get("/livez", (_req, res) => res.status(200).json({ status: "ok" }));
  app.get("/readyz", async (_req, res) => {
    const db = await getDb();
    let database: "ready" | "not_ready" = "not_ready";
    if (db) {
      try {
        await Promise.race([
          db.execute(sql`SELECT 1`),
          new Promise((_, reject) => setTimeout(() => reject(new Error("readiness_timeout")), 2_000)),
        ]);
        database = "ready";
      } catch {
        database = "not_ready";
      }
    }
    const mediaStorage = process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY ? "ready" : "not_ready";
    const ready = database === "ready" && mediaStorage === "ready";
    return res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", releaseId: process.env.RELEASE_ID ?? "development", checks: { database, mediaStorage } });
  });
  app.use(securityHeaders);
  // 24 MB request limit allows a 16 MB video plus base64 overhead while
  // keeping the API payload surface bounded.
  app.use(express.json({ limit: "24mb" }));
  app.use(express.urlencoded({ limit: "24mb", extended: true }));
  registerStorageProxy(app);
  // Called only by the separately deployed IONOS media stack. Both routes require
  // the server-side media-control secret and never expose ingest credentials.
  app.post("/api/live-media/auth", authorizeMediaTransport);
  app.post("/api/live-media/session/:sessionId/state", acceptMediaState);
  app.get("/api/live-media/session/:sessionId/watch", redirectMemberToMediaPlayer);
  app.use("/api/oauth", authRateLimiter);
  registerOAuthRoutes(app);
  app.use([
    "/api/trpc/auth.register",
    "/api/trpc/auth.login",
    "/api/trpc/auth.requestPasswordReset",
    "/api/trpc/auth.resetPassword",
    "/api/trpc/auth.verifyEmail",
    "/api/trpc/auth.resendVerification",
  ], localAuthRateLimiter);
  app.use("/api/trpc/profile.uploadAvatar", uploadRateLimiter);
  app.use("/api/trpc/observations.uploadImage", uploadRateLimiter);
  app.use("/api/trpc/community.uploadDraftImage", uploadRateLimiter);
  app.use("/api/trpc/community", communityRateLimiter);
  app.use("/api/trpc/assistant", aiRateLimiter);
  app.use("/api/trpc/sensors.outdoor", weatherRateLimiter);
  // tRPC API
  app.use(
    "/api/trpc",
    apiRateLimiter,
    sameOriginMutationGuard,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // The managed runtime routes traffic only to the declared PORT. Falling back to
  // another free port leaves the deploy healthy-looking but externally unreachable.
  if (process.env.NODE_ENV === "production" && !process.env.PORT) {
    throw new Error("Production runtime requires a managed PORT");
  }
  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
