"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changePasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function SecuritySettingsForm({ hasPassword = true }: { hasPassword?: boolean }) {
  const [state, formAction] = useFormState(changePasswordAction, undefined);
  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}
      {hasPassword && (
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        </div>
      )}
      {!hasPassword && (
        <p className="text-sm text-muted-foreground">
          You signed up with a social provider. Set a password below to also sign in with your email.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="newPassword">{hasPassword ? "New password" : "Password"}</Label>
        <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">At least 8 characters, one uppercase letter, one number.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
      </div>
      <SubmitButton label={hasPassword ? "Update password" : "Set password"} />
    </form>
  );
}

function SubmitButton({ label = "Update password" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {label}
    </Button>
  );
}
