export const OAUTH_PROVIDER_OPTIONS = [
  { id: "google", name: "Google" },
  { id: "github", name: "GitHub" },
] as const;

export type PublicOAuthProviderId = (typeof OAUTH_PROVIDER_OPTIONS)[number]["id"];
