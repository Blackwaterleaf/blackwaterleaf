import { createTRPCRouter } from "../trpc";
import { exportRouter } from "./export";
import { importRouter } from "./import";

export const appRouter = createTRPCRouter({
  export: exportRouter,
  import: importRouter,
  // ... other routers will be added here
});

export type AppRouter = typeof appRouter;