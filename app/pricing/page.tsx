import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for PromptForge. Start free, upgrade when ready.",
};

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Choose your plan</h1>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.id} className={`relative ${p.highlight ? "border-primary/50 shadow-lg shadow-primary/10" : ""}`}>
              {p.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <CardContent className="p-6">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{p.priceLabel}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <Button className="mt-6 w-full" variant={p.highlight ? "gradient" : "outline"} asChild>
                  <Link href="/register">{p.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include version history, secure auth, and per-user data isolation.
        </p>
      </section>
    </PublicLayout>
  );
}
