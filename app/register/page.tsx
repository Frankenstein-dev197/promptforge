import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your PromptForge account.",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(session.onboardingDone ? "/dashboard" : "/onboarding");
  return <RegisterForm />;
}
