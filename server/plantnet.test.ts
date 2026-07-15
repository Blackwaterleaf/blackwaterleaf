import { describe, it, expect } from "vitest";

describe("PlantNet API Key Validation", () => {
  it("PLANTNET_API_KEY should be set in environment", () => {
    const key = process.env.PLANTNET_API_KEY;
    expect(key).toBeTruthy();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("PlantNet API should respond to a basic request", async () => {
    const key = process.env.PLANTNET_API_KEY;
    // Test with a minimal multipart request – we just check the API responds (not 401/403)
    // We use a tiny 1x1 pixel JPEG as test image
    const tinyJpeg = Buffer.from(
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=",
      "base64"
    );

    const formData = new FormData();
    const blob = new Blob([tinyJpeg], { type: "image/jpeg" });
    formData.append("images", blob, "test.jpg");
    formData.append("organs", "leaf");

    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${key}&lang=de&nb-results=1`,
      { method: "POST", body: formData }
    );

    // 200 = success, 400 = bad image (still means key is valid), 404 = no results (key valid)
    // Only 401/403 means invalid key
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    // 400 is acceptable – means key is valid but test image is not a real plant photo
    expect([200, 400, 404]).toContain(response.status);
    console.log(`[PlantNet] API response status: ${response.status}`);
  }, 15000);
});
