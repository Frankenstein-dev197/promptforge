import { describe, it, expect } from "vitest";
import {
  parseVariables,
  renderTemplate,
  slugify,
  truncate,
  initials,
  formatNumber,
} from "@/lib/utils";

describe("parseVariables", () => {
  it("extracts unique variables from {{var}} syntax", () => {
    expect(parseVariables("Hello {{name}}")).toEqual(["name"]);
  });

  it("handles multiple variables", () => {
    expect(parseVariables("{{a}} and {{b}}")).toEqual(["a", "b"]);
  });

  it("deduplicates repeated variables", () => {
    expect(parseVariables("{{x}} {{x}} {{x}}")).toEqual(["x"]);
  });

  it("preserves order of first occurrence", () => {
    expect(parseVariables("{{c}} {{a}} {{b}} {{a}}")).toEqual(["c", "a", "b"]);
  });

  it("returns empty array when no variables", () => {
    expect(parseVariables("No variables here")).toEqual([]);
  });

  it("ignores invalid variable names", () => {
    expect(parseVariables("{{1invalid}} {{good}}")).toEqual(["good"]);
  });

  it("handles whitespace inside braces", () => {
    expect(parseVariables("{{  spaced  }}")).toEqual(["spaced"]);
  });
});

describe("renderTemplate", () => {
  it("replaces variables with values", () => {
    expect(renderTemplate("Hello {{name}}", { name: "World" })).toBe("Hello World");
  });

  it("replaces multiple variables", () => {
    expect(renderTemplate("{{a}}+{{b}}", { a: "1", b: "2" })).toBe("1+2");
  });

  it("leaves unreplaced variables as-is", () => {
    expect(renderTemplate("{{missing}}", {})).toBe("{{missing}}");
  });

  it("handles empty content", () => {
    expect(renderTemplate("", { a: "1" })).toBe("");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes special chars", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("trims hyphens", () => {
    expect(slugify("--test--")).toBe("test");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
  });
  it("keeps short strings as-is", () => {
    expect(truncate("ab", 5)).toBe("ab");
  });
});

describe("initials", () => {
  it("returns initials for a name", () => {
    expect(initials("John Doe")).toBe("JD");
  });
  it("returns U for undefined", () => {
    expect(initials(undefined)).toBe("U");
  });
  it("handles single name", () => {
    expect(initials("John")).toBe("J");
  });
});

describe("formatNumber", () => {
  it("formats thousands", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });
  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});
