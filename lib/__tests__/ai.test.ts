import { describe, it, expect } from "vitest";
import { complete, optimizePrompt } from "@/lib/ai";

describe("complete (local engine)", () => {
  it("returns a completion result with tokens and latency", async () => {
    const result = await complete("Tell me about {{topic}}", { topic: "cats" }, "gpt-4o");
    expect(result.output).toBeTruthy();
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.tokensIn).toBeGreaterThan(0);
    expect(result.tokensOut).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("renders variables into the input", async () => {
    const result = await complete("Hello {{name}}", { name: "World" }, "gpt-4o");
    // The local engine echoes parts of the input
    expect(result.output).toBeTruthy();
  });

  it("handles no variables", async () => {
    const result = await complete("Just a static prompt", {}, "gpt-4o-mini");
    expect(result.output).toBeTruthy();
  });
});

describe("optimizePrompt (local engine)", () => {
  it("returns an improved prompt with structure", async () => {
    const optimized = await optimizePrompt("Write a story about {{character}}");
    expect(optimized).toBeTruthy();
    expect(optimized).toContain("## Role");
    expect(optimized).toContain("## Task");
    expect(optimized).toContain("{{character}}");
  });

  it("preserves all variables", async () => {
    const optimized = await optimizePrompt("Summarize {{text}} for {{audience}} in {{language}}");
    expect(optimized).toContain("{{text}}");
    expect(optimized).toContain("{{audience}}");
    expect(optimized).toContain("{{language}}");
  });

  it("includes output format section", async () => {
    const optimized = await optimizePrompt("Do something");
    expect(optimized).toContain("## Output format");
  });
});
