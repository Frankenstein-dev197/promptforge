"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { complete, optimizePrompt } from "@/lib/ai";
import { getPlanConfig } from "@/lib/plans";
import { renderTemplate } from "@/lib/utils";

export type ActionState = { error?: string; success?: string } | undefined;

export async function runPromptAction(
  promptId: string,
  variables: Record<string, string>
): Promise<ActionState & { run?: { id: string; output: string } }> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const prompt = await prisma.prompt.findFirst({ where: { id: promptId, userId: session.id } });
  if (!prompt) return { error: "Prompt not found." };

  // Check monthly run limit
  const config = getPlanConfig(session.plan);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const runCount = await prisma.run.count({
    where: { userId: session.id, createdAt: { gte: startOfMonth } },
  });
  if (runCount >= config.limits.maxRunsPerMonth) {
    return { error: `You've reached your monthly run limit (${config.limits.maxRunsPerMonth}) on the ${config.name} plan.` };
  }

  try {
    const result = await complete(prompt.content, variables, prompt.model);
    const run = await prisma.run.create({
      data: {
        promptId,
        userId: session.id,
        input: renderTemplate(prompt.content, variables),
        output: result.output,
        model: prompt.model,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        latencyMs: result.latencyMs,
        status: "SUCCESS",
      },
    });
    revalidatePath(`/prompts/${promptId}`);
    revalidatePath("/dashboard");
    return { success: "Run completed.", run: { id: run.id, output: result.output } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Run failed.";
    await prisma.run.create({
      data: {
        promptId,
        userId: session.id,
        input: renderTemplate(prompt.content, variables),
        model: prompt.model,
        status: "FAILED",
        error: msg,
      },
    });
    return { error: msg };
  }
}

export async function optimizePromptAction(
  promptId: string
): Promise<ActionState & { optimized?: string }> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const config = getPlanConfig(session.plan);
  if (!config.limits.aiOptimize) {
    return { error: `AI optimization is available on the Pro and Team plans. Your current plan is ${config.name}.` };
  }
  const prompt = await prisma.prompt.findFirst({ where: { id: promptId, userId: session.id } });
  if (!prompt) return { error: "Prompt not found." };
  try {
    const optimized = await optimizePrompt(prompt.content);
    return { success: "Prompt optimized.", optimized };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Optimization failed." };
  }
}

export async function applyOptimizedAction(
  promptId: string,
  newContent: string
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const prompt = await prisma.prompt.findFirst({ where: { id: promptId, userId: session.id } });
  if (!prompt) return { error: "Prompt not found." };
  const contentChanged = prompt.content !== newContent;
  await prisma.prompt.update({ where: { id: promptId }, data: { content: newContent } });
  if (contentChanged) {
    const lastVersion = await prisma.promptVersion.findFirst({
      where: { promptId },
      orderBy: { version: "desc" },
    });
    await prisma.promptVersion.create({
      data: {
        promptId,
        content: newContent,
        version: (lastVersion?.version ?? 0) + 1,
        note: "AI optimized",
      },
    });
  }
  revalidatePath(`/prompts/${promptId}`);
  return { success: "Optimized prompt applied." };
}

// ---------- Notifications ----------
export async function markNotificationReadAction(id: string, formData?: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({ where: { id, userId: session.id }, data: { read: true } });
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction(formData?: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({ where: { userId: session.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function deleteNotificationAction(id: string, formData?: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.deleteMany({ where: { id, userId: session.id } });
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
