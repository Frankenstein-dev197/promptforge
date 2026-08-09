import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your PromptForge password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
