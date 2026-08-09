import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptPlayground } from "@/components/prompt-playground";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Playground" };

type SearchParams = Promise<{ prompt?: string }>;

export default async function PlaygroundPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) return null;
  const { prompt: promptId } = await searchParams;

  if (!promptId) {
    const prompts = await prisma.prompt.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, description: true, model: true, updatedAt: true },
      take: 50,
    });
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
          <p className="text-sm text-muted-foreground">Select a prompt to run it in the playground.</p>
        </div>
        {prompts.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No prompts to run"
            description="Create a prompt first, then come back to run it."
            action={<Button variant="gradient" asChild><Link href="/prompts/new">Create prompt</Link></Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {prompts.map((p) => (
              <Link
                key={p.id}
                href={`/playground?prompt=${p.id}`}
                className="group rounded-lg border border-border/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{p.title}</h3>
                  <Play className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{p.model}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const prompt = await prisma.prompt.findFirst({ where: { id: promptId, userId: session.id } });
  if (!prompt) notFound();
  const variables = JSON.parse(prompt.variables) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/prompts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
          <p className="text-sm text-muted-foreground">Running: {prompt.title}</p>
        </div>
      </div>
      <PromptPlayground
        promptId={prompt.id}
        content={prompt.content}
        model={prompt.model}
        variables={variables}
        canOptimize={session.plan !== "FREE"}
      />
    </div>
  );
}
