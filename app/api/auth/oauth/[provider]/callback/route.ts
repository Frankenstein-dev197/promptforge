import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/auth";
import {
  exchangeCodeForToken,
  fetchProfile,
  getProvider,
  isProviderEnabled,
  verifyState,
  type OAuthProfile,
} from "@/lib/oauth";
import { avatarUrl } from "@/lib/utils";

/**
 * GET /api/auth/oauth/:provider/callback
 * Handles the OAuth redirect back from the provider. Validates state, exchanges
 * the code for tokens, fetches the profile, then either:
 *  - links the provider to the signed-in user (mode === "link"), or
 *  - signs in an existing user (via account or matching email), or
 *  - creates a brand-new OAuth user.
 *
 * A user is never duplicated: if an account with the same email already exists,
 * the OAuth account is attached to that existing user.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = getProvider(providerParam);
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const errorRedirect = (message: string, target = "/login") =>
    NextResponse.redirect(new URL(`${target}?oauth_error=${encodeURIComponent(message)}`, appUrl));

  if (!provider) return errorRedirect("unknown_provider");
  if (!isProviderEnabled(provider.id)) return errorRedirect("provider_not_configured");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const providerError = searchParams.get("error");

  if (providerError) return errorRedirect(providerError);
  if (!code || !stateParam) return errorRedirect("missing_code_or_state");

  const state = await verifyState(stateParam);
  const cookieNonce = (await cookies()).get("pf_oauth_nonce")?.value;
  if (!state || state.provider !== provider.id || (cookieNonce && state.nonce !== cookieNonce)) {
    return errorRedirect("invalid_state");
  }

  let profile: OAuthProfile;
  try {
    const tokens = await exchangeCodeForToken(provider, code, state.ver);
    profile = await fetchProfile(provider, tokens.access_token);
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed";
    return errorRedirect(message);
  }

  // Clear the nonce cookie now that the flow is validated.
  (await cookies()).delete("pf_oauth_nonce");

  // ---- Link mode: connect provider to the already-signed-in user ----
  if (state.mode === "link") {
    const session = await getSession();
    if (!session) return errorRedirect("not_authenticated", "/settings?tab=security");

    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: provider.id, providerAccountId: profile.providerAccountId } },
    });
    if (existingAccount && existingAccount.userId !== session.id) {
      return errorRedirect("provider_already_linked_other", "/settings?tab=security");
    }
    if (existingAccount) {
      // Already connected to this user — nothing to do.
      return NextResponse.redirect(new URL("/settings?tab=security&oauth_success=already_connected", appUrl));
    }
    await prisma.account.create({
      data: { userId: session.id, provider: provider.id, providerAccountId: profile.providerAccountId },
    });
    await prisma.auditLog.create({
      data: { userId: session.id, action: "connect_provider", entity: "account", meta: JSON.stringify({ provider: provider.id }) },
    });
    return NextResponse.redirect(new URL("/settings?tab=security&oauth_success=connected", appUrl));
  }

  // ---- Login / signup mode ----
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: provider.id, providerAccountId: profile.providerAccountId } },
    include: { user: true },
  });

  let userId: string;
  if (existingAccount) {
    // Returning user via this provider.
    userId = existingAccount.userId;
  } else {
    // Link by email to avoid duplicate users.
    const existingUser = await prisma.user.findUnique({ where: { email: profile.email } });
    if (existingUser) {
      await prisma.account.create({
        data: { userId: existingUser.id, provider: provider.id, providerAccountId: profile.providerAccountId },
      });
      userId = existingUser.id;
    } else {
      // Brand-new OAuth user. No password — they sign in via this provider.
      const newUser = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl ?? avatarUrl(profile.email),
          passwordHash: null,
        },
      });
      await prisma.account.create({
        data: { userId: newUser.id, provider: provider.id, providerAccountId: profile.providerAccountId },
      });
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          type: "welcome",
          title: "Welcome to PromptForge",
          message: "Your workspace is ready. Complete onboarding to start building prompts.",
        },
      });
      await prisma.auditLog.create({
        data: { userId: newUser.id, action: "register_oauth", entity: "user", entityId: newUser.id, meta: JSON.stringify({ provider: provider.id }) },
      });
      userId = newUser.id;
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorRedirect("user_not_found");

  await prisma.auditLog.create({
    data: { userId: user.id, action: "login_oauth", entity: "user", entityId: user.id, meta: JSON.stringify({ provider: provider.id }) },
  });

  await createSession(user);

  const dest = state.redirect && state.redirect.startsWith("/") && !state.redirect.startsWith("//")
    ? state.redirect
    : user.onboardingDone
      ? "/dashboard"
      : "/onboarding";
  return NextResponse.redirect(new URL(dest, appUrl));
}
