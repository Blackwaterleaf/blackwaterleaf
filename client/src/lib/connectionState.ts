export type ConnectionState = "ready" | "offline" | "server_error" | "database_not_connected";

export function resolveConnectionState(input: {
  online: boolean;
  platformError: boolean;
  database?: "available" | "not_connected" | "disabled_by_policy" | "temporarily_unavailable";
}): ConnectionState {
  if (!input.online) return "offline";
  if (input.platformError) return "server_error";
  if (input.database && input.database !== "available") return "database_not_connected";
  return "ready";
}
