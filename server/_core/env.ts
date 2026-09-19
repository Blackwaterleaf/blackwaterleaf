const MIN_SESSION_SECRET_BYTES = 32;
const TEST_SESSION_SECRET = "blackwaterleaf-test-only-session-secret";
const encoder = new TextEncoder();

type RuntimeEnvironment = { JWT_SECRET?: string; NODE_ENV?: string };

function configuredSessionSecret(environment: RuntimeEnvironment): string {
  return environment.JWT_SECRET?.trim() ?? "";
}

/**
 * Returns the HMAC key used for signed sessions. Test runs receive an
 * in-memory fixture key; every executable application environment must supply
 * its own non-empty, sufficiently long secret.
 */
export function getSessionSecret(environment: RuntimeEnvironment = process.env as RuntimeEnvironment): Uint8Array {
  const configured = configuredSessionSecret(environment);
  if (!configured && environment.NODE_ENV === "test") {
    return encoder.encode(TEST_SESSION_SECRET);
  }

  const secret = encoder.encode(configured);
  if (secret.byteLength < MIN_SESSION_SECRET_BYTES) {
    throw new Error(`JWT_SECRET must contain at least ${MIN_SESSION_SECRET_BYTES} bytes outside tests`);
  }
  return secret;
}

/** Fails closed before HTTP routes are registered when session signing is unsafe. */
export function validateRuntimeEnvironment(environment: RuntimeEnvironment = process.env as RuntimeEnvironment): void {
  if (environment.NODE_ENV === "test") return;
  getSessionSecret(environment);
}

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
