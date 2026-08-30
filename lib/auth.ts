import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabase } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "plan" | "onboardingDone" | "avatarUrl">;
export const SALT_ROUNDS = 10;
export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

async function syncUser(email: string, metadata?: Record<string, unknown>) {
  const normalized = email.toLowerCase();
  return prisma.user.upsert({
    where: { email: normalized },
    update: { name: (metadata?.full_name ?? metadata?.name) as string | undefined, avatarUrl: metadata?.avatar_url as string | undefined },
    create: { email: normalized, name: (metadata?.full_name ?? metadata?.name) as string | undefined, avatarUrl: metadata?.avatar_url as string | undefined, passwordHash: null },
  });
}

export async function createSession(user: User) { return user; }
export async function destroySession() { const supabase = await createSupabase(); await supabase.auth.signOut(); (await cookies()).delete("pf_session"); }

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const profile = await syncUser(user.email, user.user_metadata);
  return { id: profile.id, email: profile.email, name: profile.name, role: profile.role, plan: profile.plan, onboardingDone: profile.onboardingDone, avatarUrl: profile.avatarUrl };
}
export async function getCurrentUser() { const session = await getSession(); return session ? prisma.user.findUnique({ where: { id: session.id } }) : null; }
export async function requireAuth() { const session = await getSession(); if (!session) throw new Error("UNAUTHENTICATED"); return session; }
export async function requireAdmin() { const session = await requireAuth(); if (session.role !== "ADMIN") throw new Error("FORBIDDEN"); return session; }
export async function refreshSessionUser() { return null; }
export function getSessionCookieName() { return "sb-access-token"; }
