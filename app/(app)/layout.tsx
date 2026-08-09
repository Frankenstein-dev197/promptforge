import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    // Session is invalid (e.g. DB reset) — clear the stale cookie and redirect to login
    await destroySession();
    redirect("/login");
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.id, read: false },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav user={session} unreadCount={unreadCount} />
      </aside>
      <div className="flex flex-1 flex-col lg:pl-64">
        <AppHeader user={session} unreadCount={unreadCount} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
