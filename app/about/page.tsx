import type { Metadata } from "next";
import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "PromptForge is built by engineers who treat prompts like real software.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">About</Badge>
          <h1 className="text-4xl font-bold tracking-tight">We prompt better, together</h1>
          <p className="mt-4 text-muted-foreground">
            PromptForge was born from a simple frustration: prompts are scattered across chat windows,
            docs, and Slack messages. We believe prompts deserve the same engineering rigor as code.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3">
          {[
            { title: "Our mission", desc: "Professionalize prompt engineering with the tools developers already know and love." },
            { title: "Our values", desc: "Simplicity, security, and developer experience above all else. No bloat, no fluff." },
            { title: "Our stack", desc: "Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Prisma. Modern and maintainable." },
          ].map((c) => (
            <Card key={c.title}>
              <CardContent className="p-6">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
