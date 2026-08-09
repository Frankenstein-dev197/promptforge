"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { disconnectProviderAction } from "@/lib/actions/auth";
import { OAuthButtons } from "@/components/oauth-buttons";
import { OAuthProviderIcon } from "@/components/oauth-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type LinkedAccount = {
  provider: string;
  connected: boolean;
};

export type LoginMethodsProps = {
  email: string;
  hasPassword: boolean;
  accounts: LinkedAccount[];
};

/**
 * "Sign-in methods" card for the settings page. Shows whether email/password
 * and each OAuth provider are connected, lets the user connect new providers,
 * and safely disconnect secondary ones (never allowing lock-out).
 */
export function LoginMethods({ email, hasPassword, accounts }: LoginMethodsProps) {
  const searchParams = useSearchParams();
  const oauthSuccess = searchParams.get("oauth_success");
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (oauthSuccess === "connected") toast.success("Provider connected.");
    if (oauthSuccess === "already_connected") toast.info("That provider was already connected.");
  }, [oauthSuccess]);

  async function handleDisconnect(provider: string) {
    setBusy(provider);
    const res = await disconnectProviderAction(provider);
    if (res?.error) toast.error(res.error);
    if (res?.success) toast.success(res.success);
    setBusy(null);
    // Reload to refresh the connected list from the server.
    if (res?.success) window.location.reload();
  }

  const connectedProviders = accounts.filter((a) => a.connected).map((a) => a.provider);
  const unconnected = accounts.filter((a) => !a.connected);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {/* Email / password */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{email}</div>
              <div className="text-xs text-muted-foreground">
                {hasPassword ? "Password sign-in enabled" : "No password set"}
              </div>
            </div>
          </div>
          <Badge variant={hasPassword ? "default" : "secondary"} className="gap-1">
            {hasPassword ? <Check className="h-3 w-3" /> : null}
            {hasPassword ? "Connected" : "Not set"}
          </Badge>
        </div>

        {/* OAuth providers */}
        {accounts.map((acc) => (
          <div
            key={acc.provider}
            className="flex items-center justify-between rounded-lg border border-border/60 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <OAuthProviderIcon provider={acc.provider} />
              </div>
              <div>
                <div className="text-sm font-medium capitalize">{acc.provider}</div>
                <div className="text-xs text-muted-foreground">
                  {acc.connected ? "Connected" : "Not connected"}
                </div>
              </div>
            </div>
            {acc.connected ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy === acc.provider}
                onClick={() => handleDisconnect(acc.provider)}
                className="text-muted-foreground hover:text-destructive"
              >
                {busy === acc.provider ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
        ))}
      </div>

      {unconnected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Connect another sign-in method</p>
          <OAuthButtons mode="link" />
        </div>
      )}

      {connectedProviders.length === 0 && !hasPassword && (
        <p className="text-xs text-muted-foreground">
          Keep at least one sign-in method active to avoid being locked out.
        </p>
      )}
    </div>
  );
}
