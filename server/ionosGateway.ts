import { ENV } from "./_core/env";

export type IonosReadiness = {
  enabled: boolean;
  configured: boolean;
  executionServerConfigured: boolean;
  baseUrl: string;
  reason: string;
};

export type IonosPreflight = {
  ok: boolean;
  reason: string;
  readiness: IonosReadiness;
  server: {
    id: string;
    name: string;
    vmState: string;
    cores: number | null;
    ram: number | null;
    availabilityZone: string | null;
  } | null;
};

function authHeaders() {
  return { Accept: "application/json", Authorization: `Bearer ${ENV.ionosApiToken}` };
}

export function getIonosReadiness(): IonosReadiness {
  const configured = Boolean(ENV.ionosApiToken && ENV.ionosDatacenterId);
  return {
    enabled: ENV.ionosEnabled,
    configured,
    executionServerConfigured: configured && Boolean(ENV.ionosExecutionServerId),
    baseUrl: ENV.ionosApiBaseUrl,
    reason: !ENV.ionosEnabled ? "IONOS_INTEGRATION_DISABLED" : !configured ? "IONOS_TOKEN_OR_DATACENTER_MISSING" : !ENV.ionosExecutionServerId ? "EXECUTION_SERVER_NOT_SELECTED" : "READY_FOR_PREFLIGHT",
  };
}

export async function listIonosServers() {
  const readiness = getIonosReadiness();
  if (!readiness.enabled || !readiness.configured) return { readiness, servers: [] as unknown[] };
  const response = await fetch(`${ENV.ionosApiBaseUrl}/datacenters/${ENV.ionosDatacenterId}/servers`, { headers: authHeaders() });
  if (!response.ok) throw new Error(`IONOS_SERVER_LIST_FAILED_${response.status}`);
  const payload = await response.json() as { items?: unknown[] };
  return { readiness, servers: payload.items ?? [] };
}

export async function getSelectedExecutionServer() {
  const readiness = getIonosReadiness();
  if (!readiness.executionServerConfigured) return { readiness, server: null };
  const response = await fetch(`${ENV.ionosApiBaseUrl}/datacenters/${ENV.ionosDatacenterId}/servers/${ENV.ionosExecutionServerId}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(`IONOS_EXECUTION_SERVER_READ_FAILED_${response.status}`);
  return { readiness, server: await response.json() };
}

export async function runIonosPreflight(): Promise<IonosPreflight> {
  const readiness = getIonosReadiness();
  if (!readiness.executionServerConfigured) {
    return { ok: false, reason: readiness.reason, readiness, server: null };
  }

  try {
    const { server } = await getSelectedExecutionServer();
    if (!server || typeof server !== "object") {
      return { ok: false, reason: "IONOS_EXECUTION_SERVER_NOT_FOUND", readiness, server: null };
    }

    const payload = server as { id?: string; properties?: Record<string, unknown> };
    const properties = payload.properties ?? {};
    return {
      ok: true,
      reason: "IONOS_API_REACHABLE",
      readiness,
      server: {
        id: payload.id ?? ENV.ionosExecutionServerId,
        name: typeof properties.name === "string" ? properties.name : "Unbenannter Server",
        vmState: typeof properties.vmState === "string" ? properties.vmState : "UNKNOWN",
        cores: typeof properties.cores === "number" ? properties.cores : null,
        ram: typeof properties.ram === "number" ? properties.ram : null,
        availabilityZone: typeof properties.availabilityZone === "string" ? properties.availabilityZone : null,
      },
    };
  } catch (error) {
    const reason = error instanceof Error && error.message.startsWith("IONOS_EXECUTION_SERVER_READ_FAILED_")
      ? error.message
      : "IONOS_PREFLIGHT_NETWORK_ERROR";
    return { ok: false, reason, readiness, server: null };
  }
}
