"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, RotateCcw, Check } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { applyOptimizedAction } from "@/lib/actions/runs";
import { useTransition } from "react";

type Version = { id: string; version: number; content: string; note?: string | null; createdAt: string };

export function VersionHistory({ versions, promptId }: { versions: Version[]; promptId: string }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const current = versions.find((v) => v.id === selected);

  function onRestore() {
    if (!current) return;
    if (!confirm(`Restore to version ${current.version}? This creates a new version with the old content.`)) return;
    startTransition(async () => {
      const res = await applyOptimizedAction(promptId, current.content);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Restored to version ${current.version}`);
        router.refresh();
        setSelected(null);
      }
    });
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No versions yet. Edit the prompt content to create versions.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardContent className="p-3">
          <div className="space-y-1">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selected === v.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5" />
                  v{v.version}
                </span>
                <span className="text-xs text-muted-foreground">{relativeTime(v.createdAt)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          {current ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">v{current.version}</Badge>
                  {current.note && <span className="text-xs text-muted-foreground">{current.note}</span>}
                </div>
                <Button size="sm" variant="outline" onClick={onRestore} disabled={pending}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              </div>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-xs">
                {current.content}
              </pre>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Select a version to view its content.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
