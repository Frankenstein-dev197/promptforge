import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Play, Activity, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  const [userCount, promptCount, runCount, collectionCount] = await Promise.all([
    prisma.user.count(),
    prisma.prompt.count(),
    prisma.run.count(),
    prisma.collection.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true },
  });

  const planDistribution = await prisma.user.groupBy({
    by: ["plan"],
    _count: true,
  });

  const stats = [
    { label: "Total users", value: userCount, icon: Users, href: "/admin/users" },
    { label: "Total prompts", value: promptCount, icon: FileText },
    { label: "Total runs", value: runCount, icon: Play },
    { label: "Collections", value: collectionCount, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform-wide statistics and management.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-bold">{formatNumber(s.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan distribution</CardTitle>
            <CardDescription>Users by subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {planDistribution.map((p) => (
              <div key={p.plan} className="flex items-center justify-between">
                <Badge variant="secondary">{p.plan}</Badge>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${userCount ? (p._count / userCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{p._count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate font-medium">{u.name ?? u.email}</span>
                  {u.role === "ADMIN" && <Badge variant="default" className="text-[10px]">Admin</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/admin/users">Manage users</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/logs">Audit logs</Link></Button>
      </div>
    </div>
  );
}
