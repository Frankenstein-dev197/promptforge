"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Template = {
  title: string;
  description: string;
  content: string;
  model: string;
  tags: string[];
};

export function PromptTemplatePicker({ templates }: { templates: Template[] }) {
  const [selected, setSelected] = React.useState<Template | null>(null);

  React.useEffect(() => {
    if (!selected) return;
    // Pre-fill the form fields via custom event
    const event = new CustomEvent("template-select", { detail: selected });
    window.dispatchEvent(event);
  }, [selected]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Start from a template</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => setSelected(t)}
              className="rounded-lg border border-border/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="text-sm font-medium">{t.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
