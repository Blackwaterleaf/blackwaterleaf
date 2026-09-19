import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const PORT = Number(process.env.PORT ?? 8080);
const MEDIA_ORIGIN = process.env.BWL_MEDIA_ORIGIN ?? "";
const SECRET = process.env.BWL_MEDIA_CONTROL_SECRET ?? "";
const UPSTREAM = process.env.MEDIA_HLS_UPSTREAM ?? "http://mediamtx:8888";
const COOKIE_NAME = "bwl_live_player";
const PATH_PATTERN = /^bwl-live-v1-\d+-[a-z0-9_-]{12,32}$/;

if (!MEDIA_ORIGIN.startsWith("https://") || SECRET.length < 32) throw new Error("missing_gateway_runtime_configuration");

const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = value => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
const sign = payload => createHmac("sha256", SECRET).update(payload).digest("base64url");
const same = (left, right) => {
  const a = Buffer.from(left ?? "", "utf8");
  const b = Buffer.from(right ?? "", "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
};

function ticketFrom(value) {
  try {
    const parsed = decode(value);
    const payload = `${parsed.path}.${parsed.sessionId}.${parsed.expiresAt}.${parsed.nonce}`;
    if (!PATH_PATTERN.test(parsed.path) || !Number.isInteger(parsed.sessionId) || Number(parsed.path.split("-")[3]) !== parsed.sessionId || parsed.expiresAt <= Date.now() || !same(parsed.signature, sign(payload))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sessionFromCookie(request) {
  const values = Object.fromEntries((request.headers.cookie ?? "").split(";").map(part => part.trim().split("=")).filter(([key, value]) => key && value));
  try {
    const parsed = decode(values[COOKIE_NAME]);
    const payload = `${parsed.path}.${parsed.expiresAt}.${parsed.nonce}`;
    if (!PATH_PATTERN.test(parsed.path) || parsed.expiresAt <= Date.now() || !same(parsed.signature, sign(payload))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; media-src 'self'; connect-src 'self'; frame-ancestors https://blackwaterleaf.com https://www.blackwaterleaf.com https://bwlparity-nearrhpw.manus.space");
}

async function proxyHls(request, response, viewer, path) {
  const remainder = path.slice(`/hls/${viewer.path}/`.length);
  if (!remainder || remainder.includes("..") || !/^[a-zA-Z0-9._-]+$/.test(remainder)) {
    response.writeHead(404).end();
    return;
  }
  const upstream = await fetch(`${UPSTREAM}/${viewer.path}/${remainder}`, { headers: { accept: request.headers.accept ?? "*/*" } });
  response.statusCode = upstream.status;
  const contentType = upstream.headers.get("content-type");
  if (contentType) response.setHeader("content-type", contentType);
  response.setHeader("cache-control", upstream.headers.get("cache-control") ?? "no-store");
  writeSecurityHeaders(response);
  if (!upstream.body) return response.end();
  const buffer = Buffer.from(await upstream.arrayBuffer());
  response.end(buffer);
}

const playerHtml = await readFile(new URL("./public/player.html", import.meta.url), "utf8");
const hlsBundle = await readFile(new URL("./public/hls.min.js", import.meta.url));

createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", MEDIA_ORIGIN);
    if (requestUrl.pathname === "/healthz") {
      response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (requestUrl.pathname === "/auth") {
      const ticket = ticketFrom(requestUrl.searchParams.get("ticket") ?? "");
      if (!ticket) {
        response.writeHead(401).end("unauthorized");
        return;
      }
      const expiresAt = new Date(ticket.expiresAt).toUTCString();
      const cookiePayload = { path: ticket.path, expiresAt: ticket.expiresAt, nonce: ticket.nonce };
      const cookie = encode({ ...cookiePayload, signature: sign(`${cookiePayload.path}.${cookiePayload.expiresAt}.${cookiePayload.nonce}`) });
      response.writeHead(302, { "set-cookie": `${COOKIE_NAME}=${cookie}; Path=/; Expires=${expiresAt}; Secure; HttpOnly; SameSite=Lax`, location: `/watch/${ticket.path}` }).end();
      return;
    }
    if (requestUrl.pathname === "/assets/hls.min.js") {
      writeSecurityHeaders(response);
      response.writeHead(200, { "content-type": "application/javascript", "cache-control": "public, max-age=604800, immutable" }).end(hlsBundle);
      return;
    }
    const viewer = sessionFromCookie(request);
    if (!viewer) {
      response.writeHead(401).end("member authentication required");
      return;
    }
    if (requestUrl.pathname === `/watch/${viewer.path}`) {
      writeSecurityHeaders(response);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }).end(playerHtml.replaceAll("__STREAM_PATH__", viewer.path));
      return;
    }
    if (requestUrl.pathname.startsWith(`/hls/${viewer.path}/`)) {
      await proxyHls(request, response, viewer, requestUrl.pathname);
      return;
    }
    response.writeHead(404).end("not found");
  } catch (error) {
    console.error("live_gateway_error", error instanceof Error ? error.message : "unknown");
    response.writeHead(502).end("upstream unavailable");
  }
}).listen(PORT, "0.0.0.0", () => console.log(`live gateway listening on ${PORT}`));
