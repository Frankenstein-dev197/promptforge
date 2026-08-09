import { describe, it, expect } from "vitest";
import { PLANS, getPlanConfig, MODELS } from "@/lib/plans";

describe("PLANS", () => {
  it("has 3 plans: FREE, PRO, TEAM", () => {
    expect(PLANS).toHaveLength(3);
    expect(PLANS.map((p) => p.id)).toEqual(["FREE", "PRO", "TEAM"]);
  });

  it("PRO plan is highlighted", () => {
    const pro = PLANS.find((p) => p.id === "PRO");
    expect(pro?.highlight).toBe(true);
  });

  it("FREE plan has price 0", () => {
    expect(PLANS.find((p) => p.id === "FREE")?.price).toBe(0);
  });

  it("all plans have limits", () => {
    for (const plan of PLANS) {
      expect(plan.limits.maxPrompts).toBeGreaterThan(0);
      expect(plan.limits.maxCollections).toBeGreaterThan(0);
      expect(plan.limits.maxRunsPerMonth).toBeGreaterThan(0);
    }
  });

  it("limits scale with plan tier", () => {
    const free = getPlanConfig("FREE");
    const pro = getPlanConfig("PRO");
    const team = getPlanConfig("TEAM");
    expect(pro.limits.maxPrompts).toBeGreaterThan(free.limits.maxPrompts);
    expect(team.limits.maxPrompts).toBeGreaterThan(pro.limits.maxPrompts);
  });

  it("AI optimize only on PRO and TEAM", () => {
    expect(getPlanConfig("FREE").limits.aiOptimize).toBe(false);
    expect(getPlanConfig("PRO").limits.aiOptimize).toBe(true);
    expect(getPlanConfig("TEAM").limits.aiOptimize).toBe(true);
  });
});

describe("MODELS", () => {
  it("includes popular models", () => {
    const ids = MODELS.map((m) => m.id);
    expect(ids).toContain("gpt-4o");
    expect(ids).toContain("claude-3-5-sonnet");
    expect(ids).toContain("gemini-1.5-pro");
  });

  it("each model has a provider", () => {
    for (const m of MODELS) {
      expect(m.provider).toBeTruthy();
      expect(m.name).toBeTruthy();
    }
  });
});

describe("getPlanConfig", () => {
  it("returns config for valid plan", () => {
    expect(getPlanConfig("PRO").name).toBe("Pro");
  });
  it("returns FREE config as fallback", () => {
    // @ts-expect-error testing invalid input
    expect(getPlanConfig("INVALID").id).toBe("FREE");
  });
});
