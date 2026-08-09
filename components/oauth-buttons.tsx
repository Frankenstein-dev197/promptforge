"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { OAuthProviderIcon } from "@/components/oauth-icons";
import { enabledProviders } from "@/lib/oauth";
import { cn } from "@/lib/utils";

/**
 * Renders the enabled OAuth provider buttons. The list is derived from
 * `enabledProviders()` so only configured providers appear. Each button kicks
 * off the server-side OAuth flow via GET /api/auth/oauth/:provider/login.
 *
 * Props:
 *  - mode: "login" (default) or "link" (connect from Settings)
 *  - redirect: post-login destination
 *  - label: optional per-button label override
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
  const providers = enabledProviders();
  const [loading, setLoading] = React.useState<string | null>(null);

  function startFlow(providerId: string) {
    setLoading(providerId);
    const params = new URLSearchParams();
    if (redirect) params.set("redirect", redirect);
    if (mode === "link") params.set("mode", "link");
    window.location.href = `/api/auth/oauth/${providerId}/login?${params.toString()}`;
  }

  if (providers.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {providers.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          className={cn(fullWidth && "w-full", "bg-background")}
          disabled={loading !== null}
          onClick={() => startFlow(p.id)}
        >
          {loading === p.id ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <OAuthProviderIcon provider={p.id} />
          )}
          {mode === "link" ? `Connect ${p.name}` : `Continue with ${p.name}`}
        </Button>
      ))}
    </div>
  );
}
