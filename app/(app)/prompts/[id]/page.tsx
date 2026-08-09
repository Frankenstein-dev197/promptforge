import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, GitBranch, Clock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptForm } from "@/components/prompt-form";
import { PromptPlayground } from "@/components/prompt-playground";
import { VersionHistory } from "@/components/version-history";
import { RunHistoryList } from "@/components/run-history-list";
import { formatDateTime, relativeTime } from "@/lib/utils";

export const metadata = { title: "Prompt" };

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: session.id },
    include: {
      collection: true,
      versions: { orderBy: { version: "desc" } },
      runs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!prompt) notFound();

  const collections = await prisma.collection.findMany({
    where: { userId: session.id },
    orderBy: { name: "asc" },
  });

  const tags = JSON.parse(prompt.tags) as string[];
  const variables = JSON.parse(prompt.variables) as string[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/prompts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{prompt.title}</h1>
            {prompt.isStarred && <Badge variant="warning">★ Starred</Badge>}
          </div>
          {prompt.description && (
            <p className="mt-1 text-sm text-muted-foreground">{prompt.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono text-[10px]">{prompt.model}</Badge>
            {prompt.collection && <Badge variant="secondary">{prompt.collection.name}</Badge>}
            {tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {relativeTime(prompt.updatedAt)}</span>
          </div>
        </div>
        <Button variant="gradient" asChild>
          <Link href={`/playground?prompt=${prompt.id}`}><Play className="h-4 w-4" /> Run</Link>
        </Button>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="run">Playground</TabsTrigger>
          <TabsTrigger value="versions">Versions ({prompt.versions.length})</TabsTrigger>
          <TabsTrigger value="history">Runs ({prompt.runs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit prompt</CardTitle>
              <CardDescription>Changes to the content create a new version automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <PromptForm
                promptId={prompt.id}
                initial={{
                  title: prompt.title,
                  description: prompt.description,
                  content: prompt.content,
                  model: prompt.model,
                  collectionId: prompt.collectionId,
                  tags,
                }}
                collections={collections.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="run">
          <PromptPlayground
            promptId={prompt.id}
            content={prompt.content}
            model={prompt.model}
            variables={variables}
            canOptimize={session.plan !== "FREE"}
          />
        </TabsContent>

        <TabsContent value="versions">
          <VersionHistory versions={prompt.versions.map((v) => ({
            id: v.id, version: v.version, content: v.content, note: v.note, createdAt: v.createdAt.toISOString(),
          }))} promptId={prompt.id} />
        </TabsContent>

        <TabsContent value="history">
          <RunHistoryList runs={prompt.runs.map((r) => ({
            id: r.id, status: r.status, model: r.model, tokensIn: r.tokensIn, tokensOut: r.tokensOut,
            latencyMs: r.latencyMs, output: r.output, error: r.error, input: r.input, createdAt: r.createdAt.toISOString(),
          }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
