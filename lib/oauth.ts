import { SignJWT, jwtVerify } from "jose";

/**
 * OAuth core for PromptForge.
 *
 * Providers are registered in `OAUTH_PROVIDERS` so adding a new one later is a
 * matter of appending an entry. Secrets are read from environment variables and
 * never reach the client. State is a short-lived signed JWT that carries the
 * PKCE code_verifier and the post-login redirect target, so we don't have to
 * trust additional round-trip cookies (we still set one as a belt-and-suspenders
 * CSRF mitigation).
 */

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
);
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

export type OAuthProviderId = "google" | "github";

export type OAuthProviderConfig = {
  id: OAuthProviderId;
  name: string;
  /** Required environment variable names; presence determines `isEnabled`. */
  clientIdEnv: string;
  clientSecretEnv: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  /** Returns the provider-specific user profile from an access token. */
  fetchProfile: (accessToken: string) => Promise<OAuthProfile>;
};

export type OAuthProfile = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatarUrl?: string;
};

export type OAuthStatePayload = {
  provider: OAuthProviderId;
  /** PKCE code_verifier stored in the signed state JWT. */
  ver: string;
  /** Redirect target after a successful login (e.g. "/dashboard"). */
  redirect?: string;
  /** When "link", the callback requires an existing session to connect a provider. */
  mode?: "login" | "link";
  /** Nonce mirrored in a cookie for CSRF protection. */
  nonce: string;
};

export const OAUTH_PROVIDERS: Record<OAuthProviderId, OAuthProviderConfig> = {
  google: {
    id: "google",
    name: "Google",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    fetchProfile: async (accessToken) => {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("google_profile_failed");
      const data = (await res.json()) as {
        sub: string;
        email: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      if (!data.sub || !data.email) throw new Error("google_profile_incomplete");
      return {
        providerAccountId: data.sub,
        email: data.email.toLowerCase(),
        emailVerified: data.email_verified !== false,
        name: data.name,
        avatarUrl: data.picture,
      };
    },
  },
  github: {
    id: "github",
    name: "GitHub",
    clientIdEnv: "GITHUB_CLIENT_ID",
    clientSecretEnv: "GITHUB_CLIENT_SECRET",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    fetchProfile: async (accessToken) => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "promptforge",
      };
      const userRes = await fetch("https://api.github.com/user", {
        headers,
        cache: "no-store",
      });
      if (!userRes.ok) throw new Error("github_profile_failed");
      const user = (await userRes.json()) as {
        id: number;
        login: string;
        name?: string | null;
        avatar_url?: string;
        email?: string | null;
      };
      let email = user.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers,
          cache: "no-store",
        });
        if (emailsRes.ok) {
          const emails = (await emailsRes.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
          email = primary?.email;
        }
      }
      if (!user.id || !email) throw new Error("github_profile_incomplete");
      return {
        providerAccountId: String(user.id),
        email: email.toLowerCase(),
        emailVerified: true,
        name: user.name ?? user.login,
        avatarUrl: user.avatar_url,
      };
    },
  },
};

export function getProvider(id: string): OAuthProviderConfig | null {
  return OAUTH_PROVIDERS[id as OAuthProviderId] ?? null;
}

export function isProviderEnabled(id: OAuthProviderId): boolean {
  const p = OAUTH_PROVIDERS[id];
  return Boolean(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]);
}

export function enabledProviders(): OAuthProviderConfig[] {
  return Object.values(OAUTH_PROVIDERS).filter((p) => isProviderEnabled(p.id));
}

export function providerClientId(id: OAuthProviderId): string {
  const p = OAUTH_PROVIDERS[id];
  return process.env[p.clientIdEnv] || "";
}

export function providerClientSecret(id: OAuthProviderId): string {
  const p = OAUTH_PROVIDERS[id];
  return process.env[p.clientSecretEnv] || "";
}

/** Base public URL of the app, used to build callback URLs. */
export function appBaseUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function callbackUrl(provider: OAuthProviderId): string {
  return `${appBaseUrl()}/api/auth/oauth/${provider}/callback`;
}

/* ------------------------------ PKCE + state ------------------------------ */

function base64UrlEncode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function generateCodeVerifier(): Promise<{ verifier: string; challenge: string }> {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64UrlEncode(random.buffer);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(digest);
  return { verifier, challenge };
}

export async function signState(payload: OAuthStatePayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(SECRET);
}

export async function verifyState(token: string): Promise<OAuthStatePayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as OAuthStatePayload;
  } catch {
    return null;
  }
}

export function buildAuthorizeUrl(
  provider: OAuthProviderConfig,
  challenge: string,
  state: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: providerClientId(provider.id),
    redirect_uri: callbackUrl(provider.id),
    scope: provider.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${provider.authorizeUrl}?${params.toString()}`;
}

/* ------------------------------ Token exchange ----------------------------- */

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeCodeForToken(
  provider: OAuthProviderConfig,
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl(provider.id),
    client_id: providerClientId(provider.id),
    client_secret: providerClientSecret(provider.id),
    code_verifier: verifier,
  });
  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "token_exchange_failed");
  }
  return data;
}

export async function fetchProfile(provider: OAuthProviderConfig, accessToken: string): Promise<OAuthProfile> {
  return provider.fetchProfile(accessToken);
}

/* --------------------------------- Helpers -------------------------------- */

export function randomNonce(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

export { base64UrlDecode };
