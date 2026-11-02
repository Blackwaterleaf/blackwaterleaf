export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Opens the temporary Manus account sign-in from an explicit user action.
 * The one-time nonce binds the callback to the initiating browser and prevents
 * OAuth login CSRF/session fixation. Never call this during render.
 */
export const startLogin = () => {
  // IONOS runs self-hosted local/Google auth and deliberately disables the
  // legacy Manus endpoint. Protected actions must therefore land on the local
  // account screen instead of sending users to /api/oauth/start (410).
  const selfHostedHosts = new Set(["blackwaterleaf.com", "www.blackwaterleaf.com"]);
  if (selfHostedHosts.has(window.location.hostname)) {
    window.location.assign("/login");
    return;
  }

  // Keep managed OAuth configuration server-side for the WebDev preview.
  const params = new URLSearchParams({ origin: window.location.origin });
  window.location.assign(`/api/oauth/start?${params.toString()}`);
};

/** Starts Google sign-in through the BWL server. The server owns PKCE and the
 * redirect URI, so provider credentials never enter the browser bundle. */
export const startGoogleLogin = (forceAccountSelection = false) => {
  const params = new URLSearchParams({ origin: window.location.origin });
  if (forceAccountSelection) params.set("prompt", "select_account");
  window.location.assign(`/api/oauth/google/start?${params.toString()}`);
};
