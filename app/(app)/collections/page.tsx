import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { CollectionDialog } from "@/components/collection-dialog";
import { COLLECTION_COLORS } from "@/lib/plans";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Collections" };

const colorMap: Record<string, string> = {
  zinc: "from-zinc-500 to-zinc-600",
  indigo: "from-indigo-500 to-indigo-600",
  violet: "from-violet-500 to-violet-600",
  rose: "from-rose-500 to-rose-600",
  amber: "from-amber-500 to-amber-600",
  emerald: "from-emerald-500 to-emerald-600",
  sky: "from-sky-500 to-sky-600",
  fuchsia: "from-fuchsia-500 to-fuchsia-600",
};

export default async function CollectionsPage() {
  const session = await getSession();
  if (!session) return null;
  const collections = await prisma.collection.findMany({
    where: { userId: session.id },
    include: { _count: { select: { prompts: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground">Organize prompts into themed groups.</p>
        </div>
        <CollectionDialog mode="create" />
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No collections yet"
          description="Create a collection to group related prompts together."
          action={<CollectionDialog mode="create" triggerLabel="New collection" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Card key={c.id} className="group relative transition-colors hover:border-primary/40">
              <Link href={`/prompts?collection=${c.id}`} className="absolute inset-0 z-0" />
              <CardContent className="p-5">
                <div className={`mb-3 h-10 w-10 rounded-lg bg-gradient-to-br ${colorMap[c.color] ?? colorMap.zinc}`} />
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <div className="relative z-10">
                    <CollectionDialog
                      mode="edit"
                      collection={{ id: c.id, name: c.name, description: c.description, color: c.color }}
                    />
                  </div>
                </div>
                {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="secondary">{c._count.prompts} prompts</Badge>
                  <span>{relativeTime(c.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
