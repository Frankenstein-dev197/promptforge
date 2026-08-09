import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Logo />
      <div className="mt-8 text-center">
        <p className="text-6xl font-bold gradient-text">404</p>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="gradient" asChild><Link href="/">Go home</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard">Dashboard</Link></Button>
        </div>
      </div>
    </div>
  );
}
