import { describe, expect, it } from "vitest";
import { PROMPT_LIBRARY, getPromptLibraryTemplate } from "@/lib/prompt-library";
import { parseVariables } from "@/lib/utils";

describe("prompt library", () => {
  it("contains seven stable templates", () => {
    expect(PROMPT_LIBRARY).toHaveLength(7);
    expect(new Set(PROMPT_LIBRARY.map((template) => template.slug)).size).toBe(7);
  });

  it("finds a template by slug", () => {
    expect(getPromptLibraryTemplate("code-review")?.title).toBe("Code reviewer");
    expect(getPromptLibraryTemplate("missing-template")).toBeUndefined();
  });

  it("keeps template variables discoverable", () => {
    for (const template of PROMPT_LIBRARY) {
      expect(template.content.length).toBeGreaterThan(80);
      expect(parseVariables(template.content).length).toBeGreaterThan(0);
      expect(template.tags.length).toBeGreaterThan(0);
    }
  });
});
