import Link from "next/link";
import { Star, Plus, Search, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PromptCard } from "@/components/prompt-card";
import { EmptyState } from "@/components/empty-state";
import { PROMPT_TEMPLATES } from "@/lib/plans";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Prompts" };

type SearchParams = Promise<{ q?: string; filter?: string; collection?: string }>;

export default async function PromptsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) return null;
  const sp = await searchParams;
  const q = sp.q?.trim();
  const filter = sp.filter;
  const collectionId = sp.collection;

  const where: Record<string, unknown> = { userId: session.id };
  if (filter === "starred") where.isStarred = true;
  if (collectionId) where.collectionId = collectionId;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { content: { contains: q } },
    ];
  }

  const [prompts, collections] = await Promise.all([
    prisma.prompt.findMany({
      where,
      include: { collection: true, _count: { select: { runs: true, versions: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { userId: session.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prompts</h1>
          <p className="text-sm text-muted-foreground">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/prompts/new"><Plus className="h-4 w-4" /> New prompt</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by title, content, description..."
            className="pl-8"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant={filter === "starred" ? "default" : "outline"} size="sm">
            <Link href="/prompts?filter=starred"><Star className="h-3.5 w-3.5" /> Starred</Link>
          </Button>
          <Button asChild variant={!filter && !collectionId ? "default" : "outline"} size="sm">
            <Link href="/prompts">All</Link>
          </Button>
        </div>
      </div>

      {/* Collection filter chips */}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/prompts?collection=${c.id}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                collectionId === c.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {prompts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={q ? "No prompts found" : "No prompts yet"}
          description={q ? "Try a different search term." : "Create your first prompt to start building your library."}
          action={
            <Button variant="gradient" asChild>
              <Link href="/prompts/new"><Plus className="h-4 w-4" /> New prompt</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              id={p.id}
              title={p.title}
              description={p.description}
              model={p.model}
              tags={JSON.parse(p.tags) as string[]}
              isStarred={p.isStarred}
              collectionName={p.collection?.name}
              collectionColor={p.collection?.color}
              runCount={p._count.runs}
              versionCount={p._count.versions}
              updatedAt={p.updatedAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
