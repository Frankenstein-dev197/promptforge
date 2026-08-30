import type { Metadata } from "next";
import ResetPasswordForm from "./reset-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new PromptForge password.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}