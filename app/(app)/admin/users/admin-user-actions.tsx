"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, User, Crown, Trash2, LogOut } from "lucide-react";
import { adminUpdateUserRoleAction, adminUpdateUserPlanAction, adminDeleteUserAction, adminToggleUserActiveAction } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminUserActions({
  userId,
  currentRole,
  currentPlan,
  isSelf,
}: {
  userId: string;
  currentRole: "USER" | "ADMIN";
  currentPlan: "FREE" | "PRO" | "TEAM";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function wrap(fn: () => Promise<{ error?: string; success?: string } | undefined>) {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else if (res?.success) {
        toast.success(res.success);
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={pending || isSelf}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Role</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => wrap(() => adminUpdateUserRoleAction(userId, currentRole === "ADMIN" ? "USER" : "ADMIN"))}>
          {currentRole === "ADMIN" ? <><User className="h-4 w-4" /> Demote to user</> : <><Shield className="h-4 w-4" /> Promote to admin</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Plan</DropdownMenuLabel>
        {(["FREE", "PRO", "TEAM"] as const).map((p) => (
          <DropdownMenuItem key={p} disabled={currentPlan === p} onClick={() => wrap(() => adminUpdateUserPlanAction(userId, p))}>
            <Crown className="h-4 w-4" /> Set {p}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => wrap(() => adminToggleUserActiveAction(userId))}>
          <LogOut className="h-4 w-4" /> Revoke sessions
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
          if (confirm("Delete this user permanently?")) wrap(() => adminDeleteUserAction(userId));
        }}>
          <Trash2 className="h-4 w-4" /> Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
