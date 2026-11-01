import { UNAUTHED_ERR_MSG } from "@shared/const";
import { TRPCClientError } from "@trpc/client";

export const AUTH_SESSION_EXPIRED_EVENT = "blackwaterleaf:session-expired";

/**
 * A protected request can learn about an expired or unavailable browser session
 * before the public auth.me query revalidates. Signal that state to the app, but
 * never start an OAuth flow automatically: sign-in is always a user action.
 */
export function publishSessionExpired(error: unknown) {
  if (!(error instanceof TRPCClientError)) return false;
  if (error.message !== UNAUTHED_ERR_MSG) return false;
  if (typeof window === "undefined") return false;

  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  return true;
}
