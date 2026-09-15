import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerBackupRoutes } from "./backupRoutes";
import { registerAdminBackupRoutes } from "./adminBackupRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
  
  // SECURITY FIX: Reduce body limit and add rate limiting
  app.use(express.json({ limit: "35mb" }));
  app.use(express.urlencoded({ limit: "35mb", extended: true }));
  
  // Rate limiting for uploads (max 10 uploads per 15 minutes per IP)
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many uploads, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply rate limiting to upload endpoints
  app.use("/api/trpc/plants.addPhoto", uploadLimiter);
  app.use("/api/trpc/aquariums.addPhoto", uploadLimiter);
  app.use("/api/trpc/posts.create", uploadLimiter);
  app.use("/api/trpc/users.uploadAvatar", uploadLimiter);
  
  // Register backup routes (for individual users)
  registerBackupRoutes(app);
  
  // Register admin backup routes (for entire database)
  registerAdminBackupRoutes(app);
  
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // General rate limiting (100 requests per 15 minutes per IP)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/trpc", generalLimiter);
  // tRPC API
  app.use(
    "/api/trpc",
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