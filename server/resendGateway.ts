import { ENV } from "./_core/env";

export function getResendStatus() {
  return {
    configured: Boolean(ENV.resendApiKey),
    fromConfigured: Boolean(ENV.resendFromEmail),
    publicUrlConfigured: Boolean(ENV.studioPublicUrl),
    provider: "resend" as const,
    reason: ENV.resendApiKey && ENV.resendFromEmail ? "configured" as const : "missing_server_configuration" as const,
  };
}

export async function sendStudioEmail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!ENV.resendApiKey || !ENV.resendFromEmail) throw new Error("RESEND_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${ENV.resendApiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: ENV.resendFromEmail, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
  });
  if (!response.ok) throw new Error(`RESEND_SEND_FAILED_${response.status}`);
  return await response.json() as { id?: string };
}
