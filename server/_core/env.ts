const DEFAULT_IONOS_API_BASE_URL = "https://api.ionos.com/cloudapi/v6";
const configuredIonosApiBaseUrl = process.env.IONOS_API_BASE_URL ?? "";
const ionosApiBaseUrl = configuredIonosApiBaseUrl.startsWith("https://") ? configuredIonosApiBaseUrl : DEFAULT_IONOS_API_BASE_URL;
const configuredIonosApiToken = process.env.IONOS_API_TOKEN ?? "";
const ionosApiToken = configuredIonosApiToken.length > 1000 && configuredIonosApiToken.split(".").length === 3 && !configuredIonosApiToken.includes("<redacted>") && !configuredIonosApiToken.includes("...") ? configuredIonosApiToken : "";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  kimiApiKey: process.env.KIMI_API_KEY ?? "",
  kimiBaseUrl: process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1",
  kimiModel: process.env.KIMI_MODEL ?? "kimi-k2.5",
  kimiEnabled: process.env.KIMI_ENABLED === "true",
  agentProvider: process.env.AGENT_PROVIDER === "kimi" && process.env.KIMI_ENABLED === "true" ? "kimi" : "builtin",
  ionosApiToken,
  ionosApiBaseUrl,
  ionosEnabled: process.env.IONOS_ENABLED === "true",
  ionosDatacenterId: process.env.IONOS_DATACENTER_ID ?? "",
  ionosExecutionServerId: process.env.IONOS_EXECUTION_SERVER_ID ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
  studioPublicUrl: process.env.STUDIO_PUBLIC_URL ?? "",
};
