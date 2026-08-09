"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Play,
  History,
  Bell,
  Settings,
  User,
  Shield,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { getPlanConfig } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Prompts", href: "/prompts", icon: FileText },
  { title: "Collections", href: "/collections", icon: FolderTree },
  { title: "Playground", href: "/playground", icon: Play },
  { title: "Run history", href: "/playground/history", icon: History },
  { title: "Notifications", href: "/notifications", icon: Bell },
];

const NAV_SECONDARY: NavItem[] = [
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_ADMIN: NavItem[] = [
  { title: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

export function SidebarNav({
  user,
  unreadCount,
  onNavigate,
}: {
  user: SessionUser | null;
  unreadCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const plan = user ? getPlanConfig(user.plan) : null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      if (item.adminOnly && user?.role !== "ADMIN") return null;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.title}</span>
          {item.href === "/notifications" && unreadCount ? (
            <Badge variant="destructive" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
              {unreadCount}
            </Badge>
          ) : null}
        </Link>
      );
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </div>
        {renderItems(NAV_MAIN)}
        <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Account
        </div>
        {renderItems(NAV_SECONDARY)}
        {user?.role === "ADMIN" && (
          <>
            <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Administration
            </div>
            {renderItems(NAV_ADMIN)}
          </>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        {plan && (
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Current plan</span>
              <Badge variant={plan.highlight ? "default" : "secondary"}>{plan.name}</Badge>
            </div>
            {user?.plan === "FREE" && (
              <Button asChild size="sm" variant="gradient" className="mt-2 w-full">
                <Link href="/settings?tab=billing">
                  <Sparkles className="h-3.5 w-3.5" /> Upgrade
                </Link>
              </Button>
            )}
          </div>
        )}
        <Link
          href="/"
          className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <LifeBuoy className="h-3.5 w-3.5" /> Back to homepage
        </Link>
      </div>
    </div>
  );
}
