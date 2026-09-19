import { ENV } from "./_core/env";

export type KimiMessage = { role: "system" | "user" | "assistant"; content: string };
export type KimiRequest = { model?: string; messages: KimiMessage[]; maxTokens?: number; signal?: AbortSignal };
export type KimiResponse = { id: string; model: string; choices: Array<{ message: { role: "assistant"; content: string }; finish_reason: string | null }> };

export function getKimiProviderStatus() {
  return {
    configured: Boolean(ENV.kimiApiKey),
    enabled: ENV.kimiEnabled,
    baseUrl: ENV.kimiBaseUrl,
    model: ENV.kimiModel,
    reason: ENV.kimiEnabled && ENV.kimiApiKey ? "ready_for_server_side_use" : "disabled_until_provider_configuration",
  } as const;
}

export async function invokeKimi(request: KimiRequest): Promise<KimiResponse> {
  const status = getKimiProviderStatus();
  if (!status.enabled || !ENV.kimiApiKey) throw new Error("KIMI_PROVIDER_NOT_CONFIGURED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("KIMI_REQUEST_TIMEOUT")), 90_000);
  const signal = request.signal ? AbortSignal.any([request.signal, controller.signal]) : controller.signal;
  try {
    const response = await fetch(`${ENV.kimiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${ENV.kimiApiKey}` },
      body: JSON.stringify({ model: request.model ?? ENV.kimiModel, messages: request.messages, max_tokens: request.maxTokens ?? 4096 }),
      signal,
    });
    if (!response.ok) throw new Error(`KIMI_REQUEST_FAILED_${response.status}`);
    return (await response.json()) as KimiResponse;
  } finally {
    clearTimeout(timeout);
  }
}
