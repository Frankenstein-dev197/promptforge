import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { RunHistoryList } from "@/components/run-history-list";
import { EmptyState } from "@/components/empty-state";
import { History, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Run history" };

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) return null;
  const runs = await prisma.run.findMany({
    where: { userId: session.id },
    include: { prompt: { select: { title: true, id: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Run history</h1>
        <p className="text-sm text-muted-foreground">All prompt executions across your workspace.</p>
      </div>
      {runs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No runs yet"
          description="Run a prompt in the playground to see execution history here."
          action={<Button variant="gradient" asChild><Link href="/playground"><Play className="h-4 w-4" /> Open playground</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {runs.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/prompts/${r.promptId}`} className="font-medium hover:underline">
                    {r.prompt.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-2">
                  <RunHistoryList runs={[{
                    id: r.id, status: r.status, model: r.model, tokensIn: r.tokensIn, tokensOut: r.tokensOut,
                    latencyMs: r.latencyMs, output: r.output, error: r.error, input: r.input, createdAt: r.createdAt.toISOString(),
                  }]} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
