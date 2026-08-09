import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://promptforge.dev"),
  title: {
    default: "PromptForge — Forge prompts that ship results",
    template: "%s · PromptForge",
  },
  description:
    "The professional workspace to manage, version, test, and optimize AI prompts. Build, ship, and scale your prompt engineering workflow.",
  keywords: ["prompt engineering", "AI prompts", "LLM", "prompt management", "prompt testing"],
  authors: [{ name: "PromptForge" }],
  openGraph: {
    title: "PromptForge — Forge prompts that ship results",
    description:
      "The professional workspace to manage, version, test, and optimize AI prompts.",
    type: "website",
    siteName: "PromptForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptForge — Forge prompts that ship results",
    description:
      "The professional workspace to manage, version, test, and optimize AI prompts.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
