"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Role, Plan } from "@prisma/client";

export type ActionState = { error?: string; success?: string } | undefined;

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function adminUpdateUserRoleAction(userId: string, role: Role): Promise<ActionState> {
  try {
    await requireAdminSession();
  } catch {
    return { error: "Forbidden." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: "Role updated." };
}

export async function adminUpdateUserPlanAction(userId: string, plan: Plan): Promise<ActionState> {
  try {
    await requireAdminSession();
  } catch {
    return { error: "Forbidden." };
  }
  await prisma.user.update({ where: { id: userId }, data: { plan } });
  revalidatePath("/admin/users");
  return { success: "Plan updated." };
}

export async function adminDeleteUserAction(userId: string): Promise<ActionState> {
  const session = await requireAdminSession().catch(() => null);
  if (!session) return { error: "Forbidden." };
  if (userId === session.id) return { error: "You cannot delete your own admin account." };
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: "User deleted." };
}

export async function adminToggleUserActiveAction(userId: string): Promise<ActionState> {
  try {
    await requireAdminSession();
  } catch {
    return { error: "Forbidden." };
  }
  // We don't have a "banned" field; we delete sessions to force logout
  await prisma.session.deleteMany({ where: { userId } });
  revalidatePath("/admin/users");
  return { success: "User sessions revoked." };
}
