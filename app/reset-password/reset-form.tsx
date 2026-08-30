"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, KeyRound } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
      Update password
    </Button>
  );
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPasswordAction, undefined);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <AuthShell
      title="Choose a new password"
      description="This link expires after 30 minutes and can be used only once."
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            sign in
          </Link>
        </>
      }
    >
      {state?.success ? (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {state.success}{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </AlertDescription>
        </Alert>
      ) : !token ? (
        <Alert variant="destructive">
          <AlertDescription>
            Missing reset token. Request a new link from the{" "}
            <Link href="/forgot-password" className="underline">
              forgot password
            </Link>{" "}
            page.
</AlertDescription>
        </Alert>
      ) : (
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          <SubmitButton />
        </form>
      )}
    </AuthShell>
  );
}