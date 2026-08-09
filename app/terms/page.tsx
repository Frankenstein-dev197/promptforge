import type { Metadata } from "next";
import { PublicLayout } from "@/components/public-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PromptForge terms of service.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of terms</h2>
              <p className="mt-2">By creating an account or using PromptForge, you agree to these terms.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">2. Use of the service</h2>
              <p className="mt-2">You agree to use PromptForge lawfully and not to abuse, reverse-engineer, or attempt to access other users' data. Per-user data isolation is enforced.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">3. Accounts</h2>
              <p className="mt-2">You are responsible for safeguarding your password and for any activity under your account.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">4. Plans & billing</h2>
              <p className="mt-2">Free, Pro, and Team plans have different limits. You can change or cancel your plan at any time. Paid plans require external payment provider configuration.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">5. AI output</h2>
              <p className="mt-2">AI-generated completions may be inaccurate. You are responsible for reviewing outputs before using them in production.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">6. Termination</h2>
              <p className="mt-2">We may suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
              <p className="mt-2">For legal questions, contact hello@promptforge.dev.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
