import type { Metadata } from "next";
import { PublicLayout } from "@/components/public-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about PromptForge.",
};

const FAQS = [
  { q: "What is PromptForge?", a: "PromptForge is a professional workspace for managing, versioning, testing, and optimizing AI prompts. It turns scattered prompt notes into engineered, trackable artifacts." },
  { q: "Do I need an OpenAI API key?", a: "No. PromptForge includes a built-in deterministic completion engine so the playground and run history work out of the box. Add an OPENAI_API_KEY to use real model completions via the OpenAI API." },
  { q: "Which models are supported?", a: "The model selector includes presets for OpenAI (GPT-4o, GPT-4o mini, GPT-3.5), Anthropic (Claude 3.5 Sonnet, Opus, Haiku), Google (Gemini), Meta (Llama), and Mistral models." },
  { q: "How does versioning work?", a: "Every time you change a prompt's content, a new version is automatically saved. You can view the full version history and restore any previous version." },
  { q: "What is the AI optimizer?", a: "The AI optimizer rewrites your prompt using prompt engineering best practices — adding clear roles, context, constraints, and output formats — while preserving all your {{variables}}." },
  { q: "Is my data secure?", a: "Passwords are hashed with bcrypt. Sessions use JWT tokens stored in httpOnly cookies. Each user's data is isolated, and admin routes are protected. No secrets are exposed to the frontend." },
  { q: "Can I use PromptForge with my team?", a: "Yes. The Team plan supports 5 seats and shared workspaces. Role-based access control keeps things organized." },
  { q: "Can I cancel anytime?", a: "Yes. You can change or downgrade your plan at any time from your account settings." },
  { q: "Do you offer a free plan?", a: "Yes. The Free plan includes 25 prompts, 3 collections, 50 runs per month, and version history — no credit card required." },
  { q: "How do I get support?", a: "Use the contact page to reach us. Team plan subscribers get priority support." },
];

export default function FAQPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-muted-foreground">Everything you need to know about PromptForge.</p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  );
}
