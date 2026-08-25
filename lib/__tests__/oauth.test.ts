// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock environment for oauth.ts
beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret";
  process.env.APP_URL = "http://localhost:3000";
  process.env.GOOGLE_CLIENT_ID = "google-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  process.env.GITHUB_CLIENT_ID = "github-id";
  process.env.GITHUB_CLIENT_SECRET = "github-secret";
});

describe("oauth provider registry", () => {
  it("exposes google and github providers", async () => {
    const mod = await import("@/lib/oauth");
    expect(mod.OAUTH_PROVIDERS.google.id).toBe("google");
    expect(mod.OAUTH_PROVIDERS.github.id).toBe("github");
  });

  it("getProvider returns the provider by id", async () => {
    const mod = await import("@/lib/oauth");
    expect(mod.getProvider("google")?.name).toBe("Google");
    expect(mod.getProvider("github")?.name).toBe("GitHub");
    expect(mod.getProvider("twitter")).toBeNull();
  });

  it("isProviderEnabled reflects env vars", async () => {
    const mod = await import("@/lib/oauth");
    expect(mod.isProviderEnabled("google")).toBe(true);
    expect(mod.isProviderEnabled("github")).toBe(true);
  });

  it("isProviderEnabled is false when credentials are missing", async () => {
    const mod = await import("@/lib/oauth");
    delete process.env.GOOGLE_CLIENT_ID;
    expect(mod.isProviderEnabled("google")).toBe(false);
  });

  it("enabledProviders lists only configured providers", async () => {
    const mod = await import("@/lib/oauth");
    const enabled = mod.enabledProviders();
    expect(enabled.map((p) => p.id).sort()).toEqual(["github", "google"]);
  });
});

describe("oauth url building", () => {
  it("builds a callback url from APP_URL", async () => {
    const mod = await import("@/lib/oauth");
    expect(mod.callbackUrl("google")).toBe(
      "http://localhost:3000/api/auth/oauth/google/callback"
    );
  });

  it("strips a trailing slash from APP_URL", async () => {
    const mod = await import("@/lib/oauth");
    process.env.APP_URL = "https://example.com/";
    expect(mod.callbackUrl("github")).toBe(
      "https://example.com/api/auth/oauth/github/callback"
    );
  });

  it("uses the request origin when APP_URL is not configured", async () => {
    const mod = await import("@/lib/oauth");
    const configuredAppUrl = process.env.APP_URL;
    delete process.env.APP_URL;
    expect(mod.callbackUrl("github", "https://preview.example.com/")).toBe(
      "https://preview.example.com/api/auth/oauth/github/callback"
    );
    process.env.APP_URL = configuredAppUrl;
  });

  it("builds an authorize url with PKCE challenge and state", async () => {
    const mod = await import("@/lib/oauth");
    const provider = mod.OAUTH_PROVIDERS.google;
    const url = mod.buildAuthorizeUrl(provider, "challenge-abc", "state-xyz");
    expect(url).toContain("response_type=code");
    expect(url).toContain("client_id=google-id");
    expect(url).toContain("code_challenge=challenge-abc");
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("state=state-xyz");
    expect(url).toContain(
      "redirect_uri=" + encodeURIComponent("http://localhost:3000/api/auth/oauth/google/callback")
    );
  });
});

describe("oauth state JWT", () => {
  it("signs and verifies a state payload", async () => {
    const mod = await import("@/lib/oauth");
    const payload = {
      provider: "google" as const,
      ver: "verifier-123",
      mode: "login" as const,
      nonce: "nonce-abc",
    };
    const token = await mod.signState(payload);
    const decoded = await mod.verifyState(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.provider).toBe("google");
    expect(decoded?.ver).toBe("verifier-123");
    expect(decoded?.nonce).toBe("nonce-abc");
  });

  it("rejects a tampered state token", async () => {
    const mod = await import("@/lib/oauth");
    const token = await mod.signState({
      provider: "google",
      ver: "v",
      nonce: "n",
    });
    const tampered = token.slice(0, -4) + "AAAA";
    expect(await mod.verifyState(tampered)).toBeNull();
  });
});

describe("oauth PKCE", () => {
  it("generates a verifier and a challenge", async () => {
    const mod = await import("@/lib/oauth");
    const { verifier, challenge } = await mod.generateCodeVerifier();
    expect(verifier.length).toBeGreaterThan(0);
    expect(challenge.length).toBeGreaterThan(0);
    expect(verifier).not.toBe(challenge);
  });

  it("randomNonce returns a unique-ish string", async () => {
    const mod = await import("@/lib/oauth");
    const a = mod.randomNonce();
    const b = mod.randomNonce();
    expect(a).not.toBe(b);
  });
});

describe("oauth token exchange + profile fetch", () => {
  it("exchanges a code for tokens", async () => {
    const mod = await import("@/lib/oauth");
    const provider = mod.OAUTH_PROVIDERS.github;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "tok-123", token_type: "bearer" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const tokens = await mod.exchangeCodeForToken(provider, "code", "verifier");
    expect(tokens.access_token).toBe("tok-123");
    expect(fetchSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("throws when token exchange fails", async () => {
    const mod = await import("@/lib/oauth");
    const provider = mod.OAUTH_PROVIDERS.github;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "bad_verification_code" }), { status: 400 })
    );
    await expect(mod.exchangeCodeForToken(provider, "code", "verifier")).rejects.toThrow();
  });

  it("fetches a github profile via the user + emails endpoints", async () => {
    const mod = await import("@/lib/oauth");
    const provider = mod.OAUTH_PROVIDERS.github;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input: any) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.endsWith("/user")) {
          return new Response(
            JSON.stringify({ id: 42, login: "octocat", name: "The Octocat", avatar_url: "https://x/a.png", email: null }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        if (url.endsWith("/user/emails")) {
          return new Response(
            JSON.stringify([
              { email: "octo@example.com", primary: true, verified: true },
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response("{}", { status: 404 });
      });
    const profile = await mod.fetchProfile(provider, "tok");
    expect(profile.providerAccountId).toBe("42");
    expect(profile.email).toBe("octo@example.com");
    expect(profile.name).toBe("The Octocat");
    expect(profile.avatarUrl).toBe("https://x/a.png");
    fetchSpy.mockRestore();
  });

  it("fetches a google profile from userinfo", async () => {
    const mod = await import("@/lib/oauth");
    const provider = mod.OAUTH_PROVIDERS.google;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: "g-123",
          email: "User@Example.com",
          email_verified: true,
          name: "User Example",
          picture: "https://g/p.png",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    const profile = await mod.fetchProfile(provider, "tok");
    expect(profile.providerAccountId).toBe("g-123");
    expect(profile.email).toBe("user@example.com"); // lowercased
    expect(profile.emailVerified).toBe(true);
    fetchSpy.mockRestore();
  });
});
