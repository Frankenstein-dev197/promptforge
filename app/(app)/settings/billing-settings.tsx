"use client";

import * as React from "react";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { updatePlanAction } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useTransition } from "react";

export function BillingSettings({ currentPlan }: { currentPlan: Plan }) {
  const [pending, startTransition] = useTransition();

  function onPlanChange(plan: Plan) {
    if (plan === currentPlan) return;
    if (plan !== "FREE") {
      toast.info("Payment integration is not configured. Your plan has been updated for demo purposes.", { duration: 5000 });
    }
    startTransition(async () => {
      const res = await updatePlanAction(plan);
      if (res?.error) toast.error(res.error);
      else if (res?.success) {
        toast.success(res.success);
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            <p className="text-2xl font-bold">{PLANS.find((p) => p.id === currentPlan)?.name}</p>
          </div>
          <Badge variant="default">Active</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available plans</CardTitle>
          <CardDescription>Switch plans anytime. Paid plans require payment provider configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border p-4 ${p.id === currentPlan ? "border-primary" : "border-border/60"}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{p.name}</h4>
                  {p.id === currentPlan && <Badge>Current</Badge>}
                </div>
                <p className="mt-1 text-2xl font-bold">{p.priceLabel}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                <ul className="mt-3 space-y-1.5">
                  {p.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  variant={p.id === currentPlan ? "outline" : p.highlight ? "gradient" : "outline"}
                  disabled={p.id === currentPlan || pending}
                  onClick={() => onPlanChange(p.id)}
                >
                  {p.id === currentPlan ? "Current" : p.price === 0 ? "Switch to Free" : "Switch plan"}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>
              Real payments require configuring a provider (e.g. Stripe). The plan-switch action updates your
              plan in the database for demonstration. To enable real billing, add <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code> to your environment.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
