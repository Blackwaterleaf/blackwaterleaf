export type LocalAuthEmailConfig = {
  apiKey: string;
  from: string;
  replyTo: string;
  publicOrigin: string;
};

function normalized(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getLocalAuthEmailConfig(env: NodeJS.ProcessEnv = process.env): LocalAuthEmailConfig | null {
  const apiKey = normalized(env.RESEND_API_KEY);
  const from = normalized(env.AUTH_FROM_EMAIL);
  const replyTo = normalized(env.AUTH_REPLY_TO_EMAIL);
  const publicOrigin = normalized(env.AUTH_PUBLIC_ORIGIN).replace(/\/$/, "");

  if (!apiKey || !from || !replyTo || !publicOrigin) return null;
  try {
    const url = new URL(publicOrigin);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) return null;
  } catch {
    return null;
  }

  return { apiKey, from, replyTo, publicOrigin };
}
