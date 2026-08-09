"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { avatarUrl, initials } from "@/lib/utils";

export function ProfileSettingsForm({ initial }: { initial: { name: string; jobRole: string | null; avatarUrl: string } }) {
  const [state, formAction] = useFormState(updateProfileAction, undefined);
  const [name, setName] = React.useState(initial.name);
  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success(state.success);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={initial.avatarUrl || avatarUrl(name)} alt={name} />
          <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="text-sm text-muted-foreground">
          Your avatar is auto-generated from your name. Set a custom URL below (optional).
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobRole">Role</Label>
        <Input id="jobRole" name="jobRole" defaultValue={initial.jobRole ?? ""} placeholder="e.g. Software Engineer" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL <span className="text-muted-foreground">(optional)</span></Label>
        <Input id="avatarUrl" name="avatarUrl" defaultValue={initial.avatarUrl} placeholder="https://..." type="url" />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
    </Button>
  );
}
