import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  generateCodeVerifier,
  getProvider,
  isProviderEnabled,
  randomNonce,
  signState,
  type OAuthProviderId,
} from "@/lib/oauth";

/**
 * GET /api/auth/oauth/:provider/login
 * Starts an OAuth flow. Generates a PKCE pair + signed state JWT, stores the
 * verifier inside the state (and a nonce cookie for CSRF), then redirects to
 * the provider's authorize URL.
 *
 * Query params:
 *  - redirect: post-login destination (defaults to /dashboard or /onboarding)
 *  - mode: "link" to connect a provider to the signed-in user (from Settings)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = getProvider(providerParam);
  if (!provider) return NextResponse.json({ error: "unknown_provider" }, { status: 400 });
  if (!isProviderEnabled(provider.id)) {
    return NextResponse.json({ error: "provider_not_configured" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const redirect = searchParams.get("redirect") || undefined;
  const mode = searchParams.get("mode") === "link" ? "link" : "login";

  // Only allow safe internal redirect targets.
  const safeRedirect =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : undefined;

  const { verifier, challenge } = await generateCodeVerifier();
  const nonce = randomNonce();

  const state = await signState({
    provider: provider.id as OAuthProviderId,
    ver: verifier,
    redirect: safeRedirect,
    mode,
    nonce,
  });

  const authorizeUrl = buildAuthorizeUrl(provider, challenge, state);

  const res = NextResponse.redirect(authorizeUrl);
  // Belt-and-suspenders CSRF nonce cookie; the signed state JWT is the primary guard.
  res.cookies.set("pf_oauth_nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
