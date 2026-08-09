import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything PromptForge offers for professional prompt engineering.",
};

const FEATURES = [
  { icon: "🌱", title: "Prompt library", desc: "Create, edit, and organize prompts with full CRUD. Star favorites, tag, and search instantly." },
  { icon: "🗂️", title: "Collections", desc: "Group prompts by project, team, or use case with colored collections." },
  { icon: "🔀", title: "Version history", desc: "Every content change is saved as a version. Compare, restore, and never lose work." },
  { icon: "▶️", title: "Playground", desc: "Run prompts with variables, view completions, tokens, and latency in real time." },
  { icon: "✨", title: "AI optimizer", desc: "One-click prompt rewriting using best practices, preserving your variables." },
  { icon: "📊", title: "Run analytics", desc: "Track every execution, monitor token usage, and spot regressions early." },
  { icon: "🔔", title: "Notifications", desc: "Stay informed about plan changes, runs, and account activity." },
  { icon: "👥", title: "Roles & permissions", desc: "User and admin roles with strict per-user data isolation." },
  { icon: "🔐", title: "Secure auth", desc: "bcrypt password hashing, JWT sessions, and protected routes." },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h1 className="text-4xl font-bold tracking-tight">A complete prompt engineering toolkit</h1>
          <p className="mt-4 text-muted-foreground">
            Every feature you need to treat prompts like real engineering artifacts.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Button variant="gradient" size="lg" asChild>
            <Link href="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
