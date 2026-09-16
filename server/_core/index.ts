import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  aiRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  communityRateLimiter,
  sameOriginMutationGuard,
  securityHeaders,
  uploadRateLimiter,
} from "../security";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(securityHeaders);
  // 12 MB request limit allows an 8 MB image plus base64 overhead while
  // preventing the previous unrestricted 50 MB API payload surface.
  app.use(express.json({ limit: "12mb" }));
  app.use(express.urlencoded({ limit: "12mb", extended: true }));
  registerStorageProxy(app);
  app.use("/api/oauth", authRateLimiter);
  registerOAuthRoutes(app);
  app.use("/api/trpc/profile.uploadAvatar", uploadRateLimiter);
  app.use("/api/trpc/observations.uploadImage", uploadRateLimiter);
  app.use("/api/trpc/community.uploadDraftImage", uploadRateLimiter);
  app.use("/api/trpc/community", communityRateLimiter);
  app.use("/api/trpc/ai", aiRateLimiter);
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

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
