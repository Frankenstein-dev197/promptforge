"use client";

import Link from "next/link";
import { Star, Clock, GitBranch, Play, MoreVertical, Copy, Trash2, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toggleStarAction, duplicatePromptAction, deletePromptAction } from "@/lib/actions/prompts";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  id: string;
  title: string;
  description?: string | null;
  model: string;
  tags: string[];
  isStarred: boolean;
  collectionName?: string;
  collectionColor?: string;
  runCount: number;
  versionCount: number;
  updatedAt: string;
};

const colorMap: Record<string, string> = {
  zinc: "bg-zinc-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  fuchsia: "bg-fuchsia-500",
};

export function PromptCard(props: Props) {
  const router = useRouter();
  const [starred, setStarred] = useState(props.isStarred);
  const [pending, startTransition] = useTransition();

  function onToggleStar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStarred(!starred);
    startTransition(async () => {
      await toggleStarAction(props.id);
    });
  }

  function onDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await duplicatePromptAction(props.id);
      if (res?.success) {
        toast.success("Prompt duplicated");
        router.push(`/prompts/${res.success}`);
      } else if (res?.error) {
        toast.error(res.error);
      }
    });
  }

  function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${props.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deletePromptAction(props.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Prompt deleted");
        router.refresh();
      }
    });
  }

  return (
    <Card className="group relative transition-colors hover:border-primary/40">
      <Link href={`/prompts/${props.id}`} className="absolute inset-0 z-0" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <button
              onClick={onToggleStar}
              className="relative z-10 mt-0.5 text-muted-foreground transition-colors hover:text-amber-400"
              aria-label="Toggle star"
            >
              <Star className={`h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
            <CardTitle className="text-base leading-snug">{props.title}</CardTitle>
          </div>
          <div className="relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={pending}>
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/prompts/${props.id}`}><Pencil className="h-4 w-4" /> Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/playground?prompt=${props.id}`}><Play className="h-4 w-4" /> Run</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {props.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{props.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {props.collectionName && (
            <Badge variant="secondary" className="gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${colorMap[props.collectionColor ?? "zinc"] ?? "bg-zinc-500"}`} />
              {props.collectionName}
            </Badge>
          )}
          <Badge variant="outline" className="font-mono text-[10px]">{props.model}</Badge>
          {props.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {props.runCount}</span>
            <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> v{props.versionCount}</span>
          </div>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {relativeTime(props.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
