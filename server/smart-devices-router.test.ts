import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { smartDevicesRouter } from "./routers/smartDevices";

function anonymousContext(): TrpcContext {
  return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("smart device selection authorization", () => {
  it("rejects anonymous reads, selections, and removal before any device data can be accessed", async () => {
    const caller = smartDevicesRouter.createCaller(anonymousContext());
    await expect(caller.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.measurements({ habitatId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.recordManualMeasurement({ habitatId: 1, metric: "ph", value: 6.8 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.select({ provider: "water_monitor", habitatId: null, modelLabel: null, requestedMetrics: ["ph"] })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.remove({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
