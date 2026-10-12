import { ENV } from "./_core/env";

export type IonosReadiness = {
  enabled: boolean;
  configured: boolean;
  executionServerConfigured: boolean;
  baseUrl: string;
  reason: string;
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
