import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

import { getAuthSecret } from "@/lib/secret";


const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "pf_session";
const SECRET = new TextEncoder().encode(getAuthSecret());
const SESSION_DAYS = 30;

export type SessionUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "plan" | "onboardingDone" | "avatarUrl"
>;

export const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function signToken(payload: SessionUser) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(SECRET);
}

async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: User) {
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
    onboardingDone: user.onboardingDone,
    avatarUrl: user.avatarUrl,
  });
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId: user.id, token, expiresAt },
  });
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  c.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  // Validate the session still exists in DB and user still valid
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    plan: session.user.plan,
    onboardingDone: session.user.onboardingDone,
    avatarUrl: session.user.avatarUrl,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const s = await getSession();
  if (!s) return null;
  return prisma.user.findUnique({ where: { id: s.id } });
}

export async function requireAuth(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) {
    throw new Error("UNAUTHENTICATED");
  }
  return s;
}

export async function requireAdmin(): Promise<SessionUser> {
  const s = await requireAuth();
  if (s.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return s;
}

export async function refreshSessionUser() {
  // Re-issue cookie after profile updates (kept simple: client refetches)
  return null;
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}
