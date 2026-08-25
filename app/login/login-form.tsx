"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
      Sign in
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, undefined);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("oauth_error");
  const redirect = searchParams.get("redirect") || undefined;

  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (oauthError) toast.error(`Sign-in failed: ${oauthError}`);
  }, [state, oauthError]);

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your PromptForge account."
      footer={
        <>
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {oauthError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Sign-in failed: {oauthError}</AlertDescription>
        </Alert>
      )}
      <OAuthButtons redirect={redirect} />
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
          or continue with email
        </span>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <SubmitButton />
      </form>
      <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts:</p>
        <p className="mt-1">admin@promptforge.dev / Admin1234</p>
        <p>demo@promptforge.dev / Demo1234</p>
        <p>free@promptforge.dev / Free1234</p>
      </div>
    </AuthShell>
  );
}
