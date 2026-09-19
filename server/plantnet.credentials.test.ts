import { describe, expect, it } from "vitest";

describe("PlantNet credentials", () => {
  it("accepts the configured key on the lightweight identify request", async () => {
    const key = process.env.PLANTNET_API_KEY;
    if (!key) throw new Error("PLANTNET_API_KEY is not configured");

    const tinyJpeg = Buffer.from(
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=",
      "base64",
    );
    const formData = new FormData();
    formData.append("images", new Blob([tinyJpeg], { type: "image/jpeg" }), "test.jpg");
    formData.append("organs", "leaf");

    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(key)}&lang=de&nb-results=1`,
      { method: "POST", body: formData },
    );

    expect([200, 400, 404]).toContain(response.status);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  }, 15_000);
});
