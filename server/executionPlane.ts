import { buildDefaultSandboxSpec, type SandboxSpec, validateSandboxSpec } from "./sandboxContract";

export type ExecutionRequest = { taskId: number; workspaceId: number; command: string[]; spec: SandboxSpec };
export type ExecutionResult = { status: "not_configured" | "succeeded" | "failed"; reason: string; outputArtifactId?: number };

export interface ExecutionPlane {
  readonly name: string;
  readonly configured: boolean;
  preflight(request: ExecutionRequest): void;
  execute(request: ExecutionRequest, signal?: AbortSignal): Promise<ExecutionResult>;
}

class NotConfiguredExecutionPlane implements ExecutionPlane {
  readonly name = "isolated-worker-not-configured";
  readonly configured = false;

  preflight(request: ExecutionRequest) {
    validateSandboxSpec(request.spec);
    if (request.command.length === 0) throw new Error("SANDBOX_COMMAND_REQUIRED");
    if (request.command.some(part => part.length > 4096)) throw new Error("SANDBOX_COMMAND_ARGUMENT_TOO_LONG");
  }

  async execute(request: ExecutionRequest, signal?: AbortSignal): Promise<ExecutionResult> {
    this.preflight(request);
    if (signal?.aborted) return { status: "failed", reason: "SANDBOX_EXECUTION_ABORTED" };
    return { status: "not_configured", reason: "ISOLATED_EXECUTION_PLANE_NOT_CONFIGURED" };
  }
}

export function getExecutionPlane(): ExecutionPlane {
  return new NotConfiguredExecutionPlane();
}

export function getExecutionPlanePreflight(imageDigest = "sha256:" + "0".repeat(64)) {
  const spec = buildDefaultSandboxSpec(imageDigest);
  const plane = getExecutionPlane();
  plane.preflight({ taskId: 0, workspaceId: 0, command: ["/usr/bin/true"], spec });
  return { plane: plane.name, configured: plane.configured, spec };
}
