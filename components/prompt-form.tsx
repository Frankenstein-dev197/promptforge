"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createPromptAction, updatePromptAction, type ActionState } from "@/lib/actions/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS } from "@/lib/plans";
import { parseVariables } from "@/lib/utils";
import { Loader2, Save, X, Plus, Variable } from "lucide-react";
import { toast } from "sonner";

type Collection = { id: string; name: string; color: string };

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {isEdit ? "Save changes" : "Create prompt"}
    </Button>
  );
}

export function PromptForm({
  promptId,
  initial,
  collections,
}: {
  promptId?: string;
  initial?: {
    title: string;
    description?: string | null;
    content: string;
    model: string;
    collectionId?: string | null;
    tags: string[];
  };
  collections: Collection[];
}) {
  const isEdit = !!promptId;
  const router = useRouter();
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [tags, setTags] = React.useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [collectionId, setCollectionId] = React.useState(initial?.collectionId ?? "none");
  const [model, setModel] = React.useState(initial?.model ?? "gpt-4o");

  const action = isEdit
    ? (_prev: ActionState, formData: FormData) => updatePromptAction(promptId!, formData)
    : createPromptAction;
  const [state, formAction] = useFormState(action, undefined);

  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success && !isEdit) {
      toast.success("Prompt created");
      router.push(`/prompts/${state.success}`);
    } else if (state?.success && isEdit) {
      toast.success("Prompt updated");
    }
  }, [state, isEdit, router]);

  const variables = React.useMemo(() => parseVariables(content), [content]);

  React.useEffect(() => {
    function onTemplate(e: Event) {
      const t = (e as CustomEvent).detail as {
        title: string; description: string; content: string; model: string; tags: string[];
      };
      setContent(t.content);
      setTags(t.tags);
      setModel(t.model);
      // Set title and description via DOM (controlled inputs are title/description via defaultValue)
      const titleEl = document.getElementById("title") as HTMLInputElement | null;
      const descEl = document.getElementById("description") as HTMLInputElement | null;
      if (titleEl) titleEl.value = t.title;
      if (descEl) descEl.value = t.description;
    }
    window.addEventListener("template-select", onTemplate);
    return () => window.removeEventListener("template-select", onTemplate);
  }, []);

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} placeholder="e.g. Product description generator" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Input id="description" name="description" defaultValue={initial?.description ?? ""} placeholder="What does this prompt do?" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Model</Label>
          <input type="hidden" name="model" value={model} />
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} <span className="text-xs text-muted-foreground">· {m.provider}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Collection</Label>
          <input type="hidden" name="collectionId" value={collectionId === "none" ? "" : collectionId} />
          <Select value={collectionId} onValueChange={setCollectionId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No collection</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Prompt content</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your prompt here. Use {{variable}} syntax for dynamic inputs..."
          className="font-mono text-sm"
        />
        {variables.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Variable className="h-3 w-3" /> Variables:</span>
            {variables.map((v) => (
              <Badge key={v} variant="default" className="font-mono text-[10px]">{`{{${v}}}`}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              #{t}
              <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
