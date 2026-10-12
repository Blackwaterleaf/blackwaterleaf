const ionosApiKeyFromParts = [
  process.env.IONOS_AI_API_KEY_PART_1,
  process.env.IONOS_AI_API_KEY_PART_2,
  process.env.IONOS_AI_API_KEY_PART_3,
  process.env.IONOS_AI_API_KEY_PART_4,
].every(Boolean)
  ? [
      process.env.IONOS_AI_API_KEY_PART_1,
      process.env.IONOS_AI_API_KEY_PART_2,
      process.env.IONOS_AI_API_KEY_PART_3,
      process.env.IONOS_AI_API_KEY_PART_4,
    ].join("")
  : "";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  oAuthPortalUrl: process.env.VITE_OAUTH_PORTAL_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  aiProvider: process.env.AI_PROVIDER?.trim().toLowerCase() === "ionos" ? "ionos" as const : "forge" as const,
  ionosApiUrl: process.env.IONOS_AI_API_URL ?? "https://openai.inference.de-txl.ionos.com",
  ionosApiKey: ionosApiKeyFromParts || process.env.IONOS_AI_API_KEY || "",
  ionosModel: process.env.IONOS_AI_MODEL ?? "Qwen/Qwen3.5-9B",
  selfHostedMediaOrigin: process.env.BWL_MEDIA_ORIGIN ?? "",
  selfHostedMediaControlSecret: process.env.BWL_MEDIA_CONTROL_SECRET ?? "",
};
