"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { promptSchema, collectionSchema } from "@/lib/validations";
import { parseVariables } from "@/lib/utils";
import { getPlanConfig } from "@/lib/plans";
import type { Plan } from "@prisma/client";

export type ActionState = { error?: string; success?: string } | undefined;

async function checkLimit(userId: string, plan: Plan, type: "prompts" | "collections") {
  const config = getPlanConfig(plan);
  if (type === "prompts") {
    const count = await prisma.prompt.count({ where: { userId } });
    if (count >= config.limits.maxPrompts) {
      throw new Error(`You've reached the ${config.name} plan limit of ${config.limits.maxPrompts} prompts.`);
    }
  } else {
    const count = await prisma.collection.count({ where: { userId } });
    if (count >= config.limits.maxCollections) {
      throw new Error(`You've reached the ${config.name} plan limit of ${config.limits.maxCollections} collections.`);
    }
  }
}

// ---------- Collections ----------
export async function createCollectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color") || "zinc",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await checkLimit(session.id, session.plan, "collections");
    await prisma.collection.create({
      data: {
        userId: session.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        color: parsed.data.color,
      },
    });
    revalidatePath("/collections");
    revalidatePath("/dashboard");
    return { success: "Collection created." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create collection." };
  }
}

export async function updateCollectionAction(id: string, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    color: formData.get("color") || "zinc",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const existing = await prisma.collection.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Collection not found." };
  await prisma.collection.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      color: parsed.data.color,
    },
  });
  revalidatePath("/collections");
  return { success: "Collection updated." };
}

export async function deleteCollectionAction(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const existing = await prisma.collection.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Collection not found." };
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  return { success: "Collection deleted." };
}

// ---------- Prompts ----------
export async function createPromptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const parsed = promptSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    model: formData.get("model"),
    collectionId: formData.get("collectionId") || null,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await checkLimit(session.id, session.plan, "prompts");
    const variables = parseVariables(parsed.data.content);
    const prompt = await prisma.prompt.create({
      data: {
        userId: session.id,
        collectionId: parsed.data.collectionId || null,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        content: parsed.data.content,
        model: parsed.data.model,
        variables: JSON.stringify(variables),
        tags: JSON.stringify(parsed.data.tags),
      },
    });
    // First version
    await prisma.promptVersion.create({
      data: { promptId: prompt.id, content: parsed.data.content, version: 1, note: "Initial version" },
    });
    revalidatePath("/prompts");
    revalidatePath(`/prompts/${prompt.id}`);
    revalidatePath("/dashboard");
    return { success: prompt.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create prompt." };
  }
}

export async function updatePromptAction(id: string, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const parsed = promptSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    model: formData.get("model"),
    collectionId: formData.get("collectionId") || null,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const existing = await prisma.prompt.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Prompt not found." };
  const variables = parseVariables(parsed.data.content);
  const contentChanged = existing.content !== parsed.data.content;
  const updated = await prisma.prompt.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content,
      model: parsed.data.model,
      collectionId: parsed.data.collectionId || null,
      variables: JSON.stringify(variables),
      tags: JSON.stringify(parsed.data.tags),
    },
  });
  if (contentChanged) {
    const lastVersion = await prisma.promptVersion.findFirst({
      where: { promptId: id },
      orderBy: { version: "desc" },
    });
    await prisma.promptVersion.create({
      data: {
        promptId: id,
        content: parsed.data.content,
        version: (lastVersion?.version ?? 0) + 1,
        note: "Updated content",
      },
    });
  }
  revalidatePath("/prompts");
  revalidatePath(`/prompts/${id}`);
  revalidatePath("/dashboard");
  return { success: "Prompt updated." };
}

export async function deletePromptAction(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const existing = await prisma.prompt.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Prompt not found." };
  await prisma.prompt.delete({ where: { id } });
  revalidatePath("/prompts");
  revalidatePath("/dashboard");
  return { success: "Prompt deleted." };
}

export async function toggleStarAction(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const existing = await prisma.prompt.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Prompt not found." };
  await prisma.prompt.update({ where: { id }, data: { isStarred: !existing.isStarred } });
  revalidatePath("/prompts");
  revalidatePath(`/prompts/${id}`);
  return { success: "Updated." };
}

export async function duplicatePromptAction(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };
  const existing = await prisma.prompt.findFirst({ where: { id, userId: session.id } });
  if (!existing) return { error: "Prompt not found." };
  try {
    await checkLimit(session.id, session.plan, "prompts");
    const dup = await prisma.prompt.create({
      data: {
        userId: session.id,
        collectionId: existing.collectionId,
        title: `${existing.title} (copy)`,
        description: existing.description,
        content: existing.content,
        model: existing.model,
        variables: existing.variables,
        tags: existing.tags,
      },
    });
    await prisma.promptVersion.create({
      data: { promptId: dup.id, content: existing.content, version: 1, note: "Duplicated" },
    });
    revalidatePath("/prompts");
    return { success: dup.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to duplicate." };
  }
}
