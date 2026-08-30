"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { createHash, randomBytes } from "crypto";
import {
  loginSchema,
  registerSchema,
  onboardingSchema,
  profileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";

export type ActionState = { error?: string; success?: string } | undefined;

/**
 * Disconnect a linked OAuth account from the current user.
 * Guarded so a user can never lock themselves out: at least one other sign-in
 * method (a password or another provider) must remain.
 */
export async function disconnectProviderAction(provider: string): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const account = await prisma.account.findFirst({
    where: { userId: session.id, provider },
  });
  if (!account) return { error: "This provider is not connected." };

  const otherAccounts = await prisma.account.count({
    where: { userId: session.id, NOT: { id: account.id } },
  });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  const hasPassword = Boolean(user?.passwordHash);

  if (!hasPassword && otherAccounts === 0) {
    return {
      error: "You must keep at least one sign-in method. Set a password before removing this connection.",
    };
  }

  await prisma.account.delete({ where: { id: account.id } });
  await audit(session.id, "disconnect_provider", "account", account.id, { provider });
  return { success: `${provider} disconnected.` };
}

async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>
) {
  await prisma.auditLog
    .create({
      data: {
        userId,
        action,
        entity,
        entityId,
        meta: meta ? JSON.stringify(meta) : "{}",
      },
    })
    .catch(() => {});
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), name, passwordHash },
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "welcome",
      title: "Welcome to PromptForge",
      message: "Your workspace is ready. Complete onboarding to start building prompts.",
    },
  });
  await audit(user.id, "register", "user", user.id);
  await createSession(user);
  redirect("/onboarding");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;
  const requestedRedirect = formData.get("redirect");
  const safeRedirect =
    typeof requestedRedirect === "string" &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : undefined;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password." };
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }
  await audit(user.id, "login", "user", user.id);
  await createSession(user);
  redirect(safeRedirect || (user.onboardingDone ? "/dashboard" : "/onboarding"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function onboardingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const raw = {
    jobRole: (formData.get("jobRole") as string)?.trim() || "",
    useCase: (formData.get("useCase") as string)?.trim() || "",
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const user = await prisma.user.update({
    where: { id: session.id },
    data: { jobRole: parsed.data.jobRole, useCase: parsed.data.useCase, onboardingDone: true },
  });
  await audit(session.id, "onboard", "user", session.id);
  // Re-issue session so the JWT reflects onboardingDone: true
  await createSession(user);
  redirect("/dashboard");
}

export async function skipOnboardingAction() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.update({
    where: { id: session.id },
    data: { onboardingDone: true },
  });
  await createSession(user);
  redirect("/dashboard");
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    jobRole: formData.get("jobRole"),
    avatarUrl: formData.get("avatarUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      jobRole: parsed.data.jobRole ?? null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });
  await audit(session.id, "update_profile", "user", session.id);
  return { success: "Profile updated successfully." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "User not found." };
  // Users who signed up via OAuth and never set a password can create one here.
  if (user.passwordHash) {
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { error: "Current password is incorrect." };
  }
  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.id }, data: { passwordHash: newHash } });
  await audit(session.id, user.passwordHash ? "change_password" : "set_password", "user", session.id);
  return { success: "Password saved successfully." };
}

export async function updatePlanAction(plan: "FREE" | "PRO" | "TEAM"): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  await prisma.user.update({ where: { id: session.id }, data: { plan } });
  await prisma.notification.create({
    data: {
      userId: session.id,
      type: "plan",
      title: "Plan updated",
      message: `Your plan is now ${plan}.`,
    },
  });
  await audit(session.id, "change_plan", "user", session.id, { plan });
  return { success: `You are now on the ${plan} plan.` };
}

export async function deleteAccountAction(): Promise<ActionState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  await prisma.user.delete({ where: { id: session.id } });
  await destroySession();
  redirect("/login");
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}


export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return the same message to avoid account enumeration
  if (user) {
    const raw = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(raw);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    await audit(user.id, "password_reset_request", "user", user.id);
    if (process.env.NODE_ENV !== "production") {
      const base = process.env.APP_URL || "http://localhost:3000";
      console.log(`[Password reset] ${base}/reset-password?token=${raw}`);
    }
  }
  return { success: "If an account exists, a reset link has been sent." };
}


export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };


  const tokenHash = hashResetToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!record) return { error: "This reset link is invalid or has expired." };


  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  await audit(record.userId,"password_reset", "user", record.userId);
  return { success: "Password updated.You can sign in now." };
}