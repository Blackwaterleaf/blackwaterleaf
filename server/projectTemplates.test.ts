import { describe, expect, it } from "vitest";
import { getProjectTemplate, PROJECT_TEMPLATES } from "./projectTemplates";

describe("project starter templates", () => {
  it("keeps one safe template for each supported target", () => {
    expect(PROJECT_TEMPLATES.map(template => template.id)).toEqual(["web-starter", "web-native-starter"]);
    expect(getProjectTemplate(undefined, "web").target).toBe("web");
    expect(getProjectTemplate(undefined, "web_native").target).toBe("web_native");
  });

  it("ships security notes and an entry file", () => {
    for (const template of PROJECT_TEMPLATES) {
      const paths = template.files.map(file => file.path);
      expect(paths).toContain("README.md");
      expect(paths).toContain("docs/SECURITY.md");
      expect(template.files.every(file => file.content.length > 0)).toBe(true);
    }
  });
});
