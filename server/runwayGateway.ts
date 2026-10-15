import RunwayML, { TaskFailedError } from "@runwayml/sdk";
import { ENV } from "./_core/env";

export type RunwayQuality = "draft" | "standard" | "high";

const MODEL_BY_QUALITY = {
  draft: "gen4_turbo",
  standard: "gen4.5",
  high: "gen4.5",
} as const;

export function getRunwayStatus() {
  const configured = ENV.runwayEnabled && Boolean(ENV.runwayApiKey);
  return {
    provider: "runway" as const,
    configured,
    modelByQuality: MODEL_BY_QUALITY,
    reason: configured
      ? "ready_for_approval_gated_video_jobs"
      : !ENV.runwayEnabled
        ? "provider_disabled"
        : "missing_runway_configuration",
  } as const;
}

export function getRunwayModel(quality: RunwayQuality) {
  return MODEL_BY_QUALITY[quality];
}

export function getRunwayClient() {
  if (!ENV.runwayEnabled || !ENV.runwayApiKey) throw new Error("RUNWAY_NOT_CONFIGURED");
  return new RunwayML({ apiKey: ENV.runwayApiKey });
}

export async function generateRunwayClip(input: {
  promptText: string;
  quality: RunwayQuality;
  ratio?: "1280:720" | "720:1280" | "1584:672";
  duration?: 5 | 10;
  promptImage?: string;
  signal?: AbortSignal;
}) {
  const client = getRunwayClient();
  const duration = input.duration ?? 5;
  const ratio = input.ratio === "1584:672" ? "1280:720" : (input.ratio ?? "1280:720");
  const task = input.promptImage
    ? input.quality === "draft"
      ? client.imageToVideo.create({ model: "gen4_turbo", promptImage: input.promptImage, promptText: input.promptText, ratio, duration })
      : client.imageToVideo.create({ model: "gen4.5", promptImage: input.promptImage, promptText: input.promptText, ratio, duration })
    : client.textToVideo.create({ model: "gen4.5", promptText: input.promptText, ratio, duration });

  try {
    const completed = await task.waitForTaskOutput({ timeout: 10 * 60 * 1000, abortSignal: input.signal });
    return { taskId: completed.id, outputUrl: completed.output?.[0] ?? null, status: "succeeded" as const };
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return { taskId: error.taskDetails?.id ?? null, outputUrl: null, status: "failed" as const, reason: "RUNWAY_TASK_FAILED" };
    }
    throw error;
  }
}
