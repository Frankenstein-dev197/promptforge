import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex min-h-screen flex-col px-6 py-8">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden border-l border-border/60 bg-card lg:block">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center p-12">
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight">
            "PromptForge turned our chaotic prompt mess into a versioned, tested, and optimized library. It's like Git for prompts."
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500" />
            <div>
              <div className="text-sm font-medium">Maya Chen</div>
              <div className="text-xs text-muted-foreground">ML Engineer, Lumen AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
