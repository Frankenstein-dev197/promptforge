"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Create account
    </Button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, undefined);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("oauth_error");

  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (oauthError) toast.error(`Sign-up failed: ${oauthError}`);
  }, [state, oauthError]);

  return (
    <AuthShell
      title="Create your account"
      description="Start managing your prompts professionally."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {oauthError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Sign-up failed: {oauthError}</AlertDescription>
        </Alert>
      )}
      <OAuthButtons />
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
          or sign up with email
        </span>
      </div>
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Jane Doe" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required placeholder="Min. 8 characters" autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">At least 8 characters, one uppercase letter, one number.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        </div>
        <SubmitButton />
        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
