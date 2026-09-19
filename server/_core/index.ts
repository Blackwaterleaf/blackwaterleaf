import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { validateRuntimeEnvironment } from "./env";
import { appRouter } from "../routers";
import { createContext } from "./context";
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
  validateRuntimeEnvironment();
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use(securityHeaders);
  // 12 MB request limit allows an 8 MB image plus base64 overhead while
  // preventing the previous unrestricted 50 MB API payload surface.
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ limit: "12mb", extended: true }));
  registerStorageProxy(app);
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
