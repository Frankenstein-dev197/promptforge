"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { OAuthProviderIcon } from "@/components/oauth-icons";
import { createClient } from "@/lib/supabase/client";
import { OAUTH_PROVIDER_OPTIONS, type PublicOAuthProviderId } from "@/lib/oauth-public";
import { cn } from "@/lib/utils";

/**
 * Renders the configured OAuth entry points. Provider secrets stay server-side;
 * the browser only knows the public provider ids and starts the server route.
 */
export function OAuthButtons({
  mode = "login",
  redirect,
  className,
  fullWidth = true,
}: {
  mode?: "login" | "link";
  redirect?: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = React.useState<PublicOAuthProviderId | null>(null);

  async function startFlow(providerId: PublicOAuthProviderId) {
    setLoading(providerId);
    const supabase = createClient();
    const callback = new URL("/auth/callback", window.location.origin);
    if (redirect) callback.searchParams.set("next", redirect);
    const { error } = await supabase.auth.signInWithOAuth({ provider: providerId, options: { redirectTo: callback.toString() } });
    if (error) setLoading(null);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {OAUTH_PROVIDER_OPTIONS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className={cn(fullWidth && "w-full", "bg-background")}
          disabled={loading !== null}
          onClick={() => startFlow(provider.id)}
        >
          {loading === provider.id ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <OAuthProviderIcon provider={provider.id} />
          )}
          {mode === "link" ? `Connect ${provider.name}` : `Continue with ${provider.name}`}
        </Button>
      ))}
    </div>
  );
}
