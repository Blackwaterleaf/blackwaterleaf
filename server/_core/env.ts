export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

export function assertProductionRuntimeConfiguration(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "production") return;

  const missing = ["VITE_APP_ID", "JWT_SECRET"].filter(key => !env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production runtime requires: ${missing.join(", ")}`);
  }

  if ((env.JWT_SECRET ?? "").length < 32) {
    throw new Error("Production runtime JWT_SECRET must be at least 32 characters");
  }
}
