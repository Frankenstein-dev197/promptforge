import type { Metadata } from "next";
import { PublicLayout } from "@/components/public-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PromptForge privacy policy.",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="container py-20">
        <div className="mx-auto max-w-3xl prose prose-invert">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-lg font-semibold text-foreground">1. Information we collect</h2>
              <p className="mt-2">We collect the information you provide when creating an account: your name, email address, and the prompts, collections, and run data you create. Passwords are hashed with bcrypt and never stored in plaintext.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">2. How we use your data</h2>
              <p className="mt-2">Your data is used solely to provide the PromptForge service — storing and managing your prompts, runs, and account settings. We do not sell your data.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">3. Data storage & security</h2>
              <p className="mt-2">Data is stored in a relational database with per-user isolation. Sessions use signed JWT tokens in httpOnly cookies. All sensitive operations run server-side.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">4. AI completions</h2>
              <p className="mt-2">If you configure an OpenAI API key, prompt content and variables are sent to OpenAI's API for completions. Without a key, a local deterministic engine is used and no data leaves the server.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">5. Your rights</h2>
              <p className="mt-2">You can export, modify, or delete your data at any time from your account settings. Deleting your account permanently removes all associated data.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
              <p className="mt-2">For privacy questions, contact us at hello@promptforge.dev.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
