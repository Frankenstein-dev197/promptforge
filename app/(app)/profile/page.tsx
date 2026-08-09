import type { Metadata } from "next";
import Link from "next/link";
import { getSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlanConfig } from "@/lib/plans";
import { avatarUrl, initials, formatDate } from "@/lib/utils";
import { FileText, Play, FolderTree, Settings, Shield } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const [promptCount, collectionCount, runCount] = await Promise.all([
    prisma.prompt.count({ where: { userId: session.id } }),
    prisma.collection.count({ where: { userId: session.id } }),
    prisma.run.count({ where: { userId: session.id } }),
  ]);

  const plan = getPlanConfig(session.plan);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your public profile and account information.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl ?? avatarUrl(user.email)} alt={user.name ?? "User"} />
              <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.role === "ADMIN" && (
                  <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.jobRole && <p className="mt-1 text-sm text-muted-foreground">{user.jobRole}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary">{plan.name} plan</Badge>
                <span className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings"><Settings className="h-4 w-4" /> Edit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Prompts", value: promptCount, icon: FileText },
          { label: "Collections", value: collectionCount, icon: FolderTree },
          { label: "Total runs", value: runCount, icon: Play },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user.useCase && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{user.useCase}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
