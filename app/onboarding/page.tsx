import type { Metadata } from "next";
import OnboardingForm from "./onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
