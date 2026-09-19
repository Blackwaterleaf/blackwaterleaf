import { describe, expect, it } from "vitest";
import { abortActiveRun, getActiveRunCount, getActiveRunIds, resetActiveRunsForTests } from "./runWorker";
import { assertTaskTransition } from "./safety";

describe("persistent agent queue contracts", () => {
  it("allows ready tasks to enter the durable queue and queued runs to start", () => {
    expect(() => assertTaskTransition("ready", "queued")).not.toThrow();
    expect(() => assertTaskTransition("queued", "running")).not.toThrow();
    expect(() => assertTaskTransition("succeeded", "queued")).toThrow("INVALID_TASK_TRANSITION");
  });

  it("reports no active in-process runs before a worker claims a lease", () => {
    resetActiveRunsForTests();
    expect(getActiveRunCount()).toBe(0);
    expect(getActiveRunIds()).toEqual([]);
    expect(abortActiveRun(999999)).toBe(false);
  });

  it("keeps cancellation a terminal task transition", () => {
    expect(() => assertTaskTransition("running", "cancelled")).not.toThrow();
    expect(() => assertTaskTransition("cancelled", "running")).toThrow("INVALID_TASK_TRANSITION");
  });
});
