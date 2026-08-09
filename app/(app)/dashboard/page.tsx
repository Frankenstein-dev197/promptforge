import Link from "next/link";
import type { ElementType } from "react";
import {
  FileText,
  FolderTree,
  Play,
  Star,
  Zap,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getDashboardStats, getRecentActivity, getRunsChart } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlanConfig } from "@/lib/plans";
import { relativeTime, formatNumber } from "@/lib/utils";
import { RunsChart } from "@/components/runs-chart";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const stats = await getDashboardStats(session.id);
  const { recentRuns, recentPrompts } = await getRecentActivity(session.id);
  const chartData = await getRunsChart(session.id);
  const plan = getPlanConfig(session.plan);

  const statCards: Array<{
    label: string;
    value: string | number;
    icon: ElementType;
    href: string;
    sub?: string;
    limit?: number;
    limitLabel?: string;
  }> = [
    {
      label: "Prompts",
      value: stats.promptCount,
      icon: FileText,
      limit: plan.limits.maxPrompts,
      href: "/prompts",
    },
    {
      label: "Collections",
      value: stats.collectionCount,
      icon: FolderTree,
      limit: plan.limits.maxCollections,
      href: "/collections",
    },
    {
      label: "Total runs",
      value: stats.runCount,
      icon: Play,
      sub: `${stats.runsThisMonth} this month`,
      limit: plan.limits.maxRunsPerMonth,
      limitLabel: "monthly",
      href: "/playground/history",
    },
    {
      label: "Tokens used",
      value: formatNumber(stats.tokensUsed),
      icon: Zap,
      href: "/playground/history",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening in your prompt workspace.
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/prompts/new"><Plus className="h-4 w-4" /> New prompt</Link>
        </Button>
      </div>

      {/* Upgrade banner for free users */}
      {session.plan === "FREE" && (
        <Card className="border-primary/30 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
          <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Unlock the AI optimizer & more</p>
                <p className="text-xs text-muted-foreground">Upgrade to Pro for unlimited collections and 5,000 runs/month.</p>
              </div>
            </div>
            <Button variant="gradient" size="sm" asChild>
              <Link href="/settings?tab=billing">Upgrade <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {s.sub ?? (s.limit ? (
                  <span>
                    {s.limitLabel === "monthly" ? `${stats.runsThisMonth}/${s.limit} monthly` : `Limit: ${s.limit}`}
                  </span>
                ) : null)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Run activity</CardTitle>
              <CardDescription>Last 14 days</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <RunsChart data={chartData} />
          </CardContent>
        </Card>

        {/* Starred / quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/prompts/new" className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Create a prompt</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/playground" className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Open playground</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/collections" className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <FolderTree className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">New collection</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/prompts?filter=starred" className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Starred prompts ({stats.starredCount})</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent prompts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/prompts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPrompts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No prompts yet"
                description="Create your first prompt to get started."
                action={<Button variant="gradient" size="sm" asChild><Link href="/prompts/new"><Plus className="h-3.5 w-3.5" /> New prompt</Link></Button>}
              />
            ) : (
              <div className="space-y-1">
                {recentPrompts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/prompts/${p.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                  >
                    <span className="truncate font-medium">{p.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">{relativeTime(p.updatedAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent runs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/playground/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <EmptyState
                icon={Play}
                title="No runs yet"
                description="Run a prompt in the playground to see history."
                action={<Button variant="outline" size="sm" asChild><Link href="/playground">Open playground</Link></Button>}
              />
            ) : (
              <div className="space-y-1">
                {recentRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${r.status === "SUCCESS" ? "bg-emerald-500" : "bg-destructive"}`} />
                      <span className="truncate">{r.prompt.title}</span>
                    </div>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">{relativeTime(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
