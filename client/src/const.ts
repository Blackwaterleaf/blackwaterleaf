export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Opens the temporary Manus account sign-in from an explicit user action.
 * The one-time nonce binds the callback to the initiating browser and prevents
 * OAuth login CSRF/session fixation. Never call this during render.
 */
export const startLogin = () => {
  // Keep OAuth configuration server-side. This also prevents a stale or missing
  // VITE_OAUTH_PORTAL_URL in a preview build from producing an unusable URL.
  const params = new URLSearchParams({ origin: window.location.origin });
  window.location.assign(`/api/oauth/start?${params.toString()}`);
};
