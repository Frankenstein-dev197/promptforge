import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your PromptForge account.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.onboardingDone ? "/dashboard" : "/onboarding");
  return <LoginForm />;
}
