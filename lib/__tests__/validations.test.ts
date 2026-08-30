import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  promptSchema,
  collectionSchema,
  onboardingSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "J" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-email" }).success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(registerSchema.safeParse({ ...valid, password: "password1", confirmPassword: "password1" }).success).toBe(false);
  });

  it("rejects password without number", () => {
    expect(registerSchema.safeParse({ ...valid, password: "Password", confirmPassword: "Password" }).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: "Different1" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
  });
});

describe("promptSchema", () => {
  it("accepts valid prompt", () => {
    expect(
      promptSchema.safeParse({
        title: "My prompt",
        content: "Do something useful",
        model: "gpt-4o",
      }).success
    ).toBe(true);
  });
  it("rejects short content", () => {
    expect(
      promptSchema.safeParse({ title: "T", content: "short", model: "gpt-4o" }).success
    ).toBe(false);
  });
  it("rejects missing title", () => {
    expect(
      promptSchema.safeParse({ title: "", content: "valid content here", model: "gpt-4o" }).success
    ).toBe(false);
  });
});

describe("collectionSchema", () => {
  it("accepts valid collection", () => {
    expect(collectionSchema.safeParse({ name: "Marketing" }).success).toBe(true);
  });
  it("rejects short name", () => {
    expect(collectionSchema.safeParse({ name: "M" }).success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("accepts valid input", () => {
    expect(onboardingSchema.safeParse({ jobRole: "Engineer", useCase: "Building AI" }).success).toBe(true);
  });
  it("rejects empty fields", () => {
    expect(onboardingSchema.safeParse({ jobRole: "", useCase: "" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "oldpass1",
    newPassword: "Newpass1",
    confirmPassword: "Newpass1",
  };
  it("accepts valid input", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects mismatched new passwords", () => {
    expect(changePasswordSchema.safeParse({ ...valid, confirmPassword: "Different1" }).success).toBe(false);
  });
  it("rejects weak new password", () => {
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: "weak", confirmPassword: "weak" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true;
  });
  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false;
  });
});


describe("resetPasswordSchema", () => {
  const valid = { token: "abc", password: "Password1", confirmPassword: "Password1" };
  it("accepts valid input", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true;
  });
 it("rejects mismatched passwords", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, confirmPassword: "Other1A" }).success).toBe(false;
  });
 it("rejects missing token", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: "" }).success).toBe(false;
  });
});
