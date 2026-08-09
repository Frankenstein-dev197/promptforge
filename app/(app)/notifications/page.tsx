import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { markAllNotificationsReadAction, markNotificationReadAction, deleteNotificationAction } from "@/lib/actions/runs";
import { relativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Notifications" };

const typeColor: Record<string, string> = {
  welcome: "default",
  plan: "secondary",
  system: "warning",
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) return null;
  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.filter((n) => !n.read).length} unread</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. Notifications about your account and runs will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.read ? "border-primary/40 bg-primary/5" : ""}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    <Badge variant={(typeColor[n.type] as any) ?? "secondary"} className="text-[10px]">{n.type}</Badge>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  {!n.read && (
                    <form action={markNotificationReadAction.bind(null, n.id)}>
                      <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Mark read">
                        <CheckCheck className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  )}
                  <form action={deleteNotificationAction.bind(null, n.id)}>
                    <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
