const INSECURE_DEFAULTS = new Set([
  "dev-insecure-secret-change-me",
  "dev-only-change-me-to-a-long-random-string",
]);


export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";


  if (isProd) {
    if (!secret || INSECURE_DEFAULTS.has(secret) || secret.length < 32) {
      throw new Error(
        "AUTH_SECRET must be set to a strong random value (32+ chars) in production."
      );
    }
    return secret;
  }


  return secret && secret.length > 0 ? secret : "dev-insecure-secret-change-me";
}