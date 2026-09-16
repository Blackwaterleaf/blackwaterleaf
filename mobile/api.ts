const CONTROL_API_URL = "https://bwlstudio-zkjakwvz.manus.space";

type TrpcResponse<T> = { result?: { data?: { json: T } }; error?: { json?: { message?: string } } };

async function trpc<T>(procedure: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CONTROL_API_URL}/api/trpc/${procedure}`, {
    ...init,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json() as TrpcResponse<T>;
  if (!response.ok || !payload.result?.data?.json) throw new Error(payload.error?.json?.message ?? "Studio Control API request failed");
  return payload.result.data.json;
}

export function registerPushToken(accessToken: string, expoPushToken: string) {
  return trpc<{ success: true }>("studio.registerMobileDevice", accessToken, {
    method: "POST",
    body: JSON.stringify({ json: { expoPushToken, platform: "android" } }),
  });
}

export function getPendingApprovals(accessToken: string) {
  return trpc<Array<{ id: number; taskId: number; actionType: string; resourceScope: string; riskSummary: string; expiresAt: string }>>("studio.pendingApprovals", accessToken);
}

export function decideApproval(accessToken: string, approvalId: number, decision: "approved" | "denied") {
  return trpc<{ success: true }>("studio.decideApproval", accessToken, {
    method: "POST",
    body: JSON.stringify({ json: { approvalId, decision, reason: "Mobile Studio approval" } }),
  });
}
