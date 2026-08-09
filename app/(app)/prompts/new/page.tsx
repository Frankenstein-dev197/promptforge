import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromptForm } from "@/components/prompt-form";
import { PROMPT_TEMPLATES } from "@/lib/plans";
import { PromptTemplatePicker } from "./template-picker";

export const metadata: Metadata = { title: "New prompt" };

export default async function NewPromptPage() {
  const session = await getSession();
  if (!session) return null;
  const collections = await prisma.collection.findMany({
    where: { userId: session.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/prompts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New prompt</h1>
          <p className="text-sm text-muted-foreground">Create a new prompt or start from a template.</p>
        </div>
      </div>

      <PromptTemplatePicker templates={PROMPT_TEMPLATES} />

      <Card>
        <CardHeader>
          <CardTitle>Prompt details</CardTitle>
          <CardDescription>Fill in the details below to create your prompt.</CardDescription>
        </CardHeader>
        <CardContent>
          <PromptForm collections={collections.map((c) => ({ id: c.id, name: c.name, color: c.color }))} />
        </CardContent>
      </Card>
    </div>
  );
}
