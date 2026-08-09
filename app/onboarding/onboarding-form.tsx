"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { onboardingAction, skipOnboardingAction } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const ROLES = ["Software Engineer", "ML/AI Engineer", "Product Manager", "Designer", "Founder", "Researcher", "Student", "Other"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
      Complete setup
    </Button>
  );
}

export default function OnboardingForm() {
  const [state, formAction] = useFormState(onboardingAction, undefined);
  const router = useRouter();
  const [role, setRole] = React.useState("");

  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  async function handleSkip() {
    await skipOnboardingAction();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 px-6 py-4">
        <Link href="/"><Logo /></Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Rocket className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4 text-2xl">Welcome to PromptForge</CardTitle>
            <CardDescription>
              Let's personalize your workspace. This takes 30 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              {state?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                <Label>What's your role?</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        role === r
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <Input name="jobRole" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Or type your role" required />
                {role === "" && <p className="text-xs text-muted-foreground">Pick one above or type your own.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">What will you use PromptForge for?</Label>
                <Textarea
                  id="useCase"
                  name="useCase"
                  required
                  rows={3}
                  placeholder="e.g. Building AI features for our SaaS, experimenting with prompt patterns..."
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={handleSkip}>
                  Skip for now
                </Button>
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
