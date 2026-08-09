import Link from "next/link";
import {
  ArrowRight,
  Check,
  GitBranch,
  Layers,
  Sparkles,
  Zap,
  Shield,
  History,
  Terminal,
  Star,
  FolderTree,
  Play,
} from "lucide-react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Version control for prompts",
    description:
      "Every edit is tracked. Compare versions, roll back instantly, and never lose a great prompt again.",
  },
  {
    icon: Play,
    title: "Built-in playground",
    description:
      "Run prompts with variables, see real completions, and measure tokens and latency in real time.",
  },
  {
    icon: Sparkles,
    title: "AI prompt optimizer",
    description:
      "Let the optimizer rewrite your prompt using prompt engineering best practices — preserving your variables.",
  },
  {
    icon: FolderTree,
    title: "Collections & tags",
    description:
      "Organize prompts into collections, tag them, star your favorites, and find anything in seconds.",
  },
  {
    icon: History,
    title: "Run history & analytics",
    description:
      "Track every execution, monitor token usage, and spot regressions before they reach production.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description:
      "Hashed passwords, server-side sessions, per-user data isolation, and admin-controlled access.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up in seconds and complete a 30-second onboarding.",
  },
  {
    step: "02",
    title: "Build your prompt library",
    description: "Start from templates or from scratch. Organize with collections.",
  },
  {
    step: "03",
    title: "Test & optimize",
    description: "Run prompts in the playground, optimize with AI, version everything.",
  },
  {
    step: "04",
    title: "Ship with confidence",
    description: "Track usage, monitor runs, and roll back to any version instantly.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "PromptForge cut our prompt iteration cycle from days to minutes. The version history alone is worth it.",
    name: "Maya Chen",
    role: "ML Engineer, Lumen AI",
  },
  {
    quote:
      "Finally, a place to manage prompts like real engineering artifacts instead of scattered notes.",
    name: "Diego Rivera",
    role: "Founder, Quillbase",
  },
  {
    quote:
      "The AI optimizer turned a mediocre prompt into a production-ready one in a single click.",
    name: "Aisha Khan",
    role: "Product Lead, Northstar",
  },
];

const FAQ = [
  {
    q: "Do I need an OpenAI API key?",
    a: "No. PromptForge ships with a built-in deterministic completion engine so the playground and run history work out of the box. Add an OPENAI_API_KEY to use real model completions.",
  },
  {
    q: "Can I use this with my team?",
    a: "Yes. The Team plan supports shared workspaces and 5 seats. Role-based access keeps everything organized.",
  },
  {
    q: "Where is my data stored?",
    a: "Your prompts, runs, and account data are stored in a relational database with per-user isolation. Passwords are hashed with bcrypt and never stored in plaintext.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-indigo-600/20 blur-3xl" />
        <div className="container relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Prompt engineering, professionalized
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Forge prompts that <span className="gradient-text">ship results</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              The professional workspace to manage, version, test, and optimize your AI prompts.
              Stop pasting prompts into chat windows. Start engineering them.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg" asChild>
                <Link href="/register">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">See features</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Free plan includes 25 prompts
            </p>
          </div>

          {/* Product preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-xl border border-border/60 bg-card/50 p-2 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-xs text-muted-foreground">promptforge.app/dashboard</span>
              </div>
              <div className="grid grid-cols-12 gap-0 overflow-hidden rounded-lg">
                <div className="col-span-3 hidden border-r border-border/60 bg-sidebar/50 p-3 sm:block">
                  <div className="space-y-2">
                    {["Dashboard", "Prompts", "Collections", "Playground", "Settings"].map((n, i) => (
                      <div
                        key={n}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                          i === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <div className="h-3 w-3 rounded bg-current opacity-60" />
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 p-4 sm:col-span-9">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-muted/60" />
                    <div className="h-6 w-20 rounded bg-primary/30" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg border border-border/60 p-3">
                        <div className="h-3 w-12 rounded bg-muted/60" />
                        <div className="mt-2 h-6 w-16 rounded bg-foreground/20" />
                        <div className="mt-1 h-3 w-10 rounded bg-muted/40" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 rounded-lg border border-border/60 p-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="h-3 flex-1 rounded bg-muted/40" style={{ maxWidth: `${100 - i * 12}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / stats */}
      <section className="border-y border-border/60 bg-card/20">
        <div className="container py-10">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "12k+", label: "Prompts managed" },
              { value: "98%", label: "Faster iteration" },
              { value: "4.9/5", label: "User rating" },
              { value: "50+", label: "Model presets" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to engineer prompts
          </h2>
          <p className="mt-4 text-muted-foreground">
            From first draft to production deployment — one workspace for your entire prompt lifecycle.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group relative overflow-hidden transition-colors hover:border-primary/40">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-card/20">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From zero to shipping in 4 steps</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-bold text-primary/20">{s.step}</div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-6 hidden h-5 w-5 text-border md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Loved by builders</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What our users say</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-4">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border/60 bg-card/20">
        <div className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.id}
                className={`relative ${p.highlight ? "border-primary/50 shadow-lg shadow-primary/10" : ""}`}
              >
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
                  <Button
                    className="mt-6 w-full"
                    variant={p.highlight ? "gradient" : "outline"}
                    asChild
                  >
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
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <Card key={item.q}>
                <CardContent className="p-5">
                  <h3 className="font-medium">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/faq">View all FAQs <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-violet-600/10 via-card to-indigo-600/10 p-10 text-center sm:p-16">
          <div className="absolute inset-0 dot-bg opacity-30" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to forge better prompts?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of engineers who treat prompts like real software. Start free, no credit card.
            </p>
            <Button variant="gradient" size="lg" className="mt-8" asChild>
              <Link href="/register">
                Get started for free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
