"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createCollectionAction, updateCollectionAction, deleteCollectionAction } from "@/lib/actions/prompts";
import { COLLECTION_COLORS } from "@/lib/plans";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const colorMap: Record<string, string> = {
  zinc: "bg-zinc-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  fuchsia: "bg-fuchsia-500",
};

export function CollectionDialog({
  mode,
  collection,
  triggerLabel,
}: {
  mode: "create" | "edit";
  collection?: { id: string; name: string; description?: string | null; color: string };
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [color, setColor] = React.useState(collection?.color ?? "zinc");
  const router = useRouter();
  const action = mode === "create" ? createCollectionAction : (_p: any, fd: FormData) => updateCollectionAction(collection!.id, fd);
  const [state, formAction] = useFormState(action, undefined);

  React.useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  async function onDelete() {
    if (!collection) return;
    if (!confirm(`Delete "${collection.name}"? Prompts in it will be kept but uncategorized.`)) return;
    const res = await deleteCollectionAction(collection.id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Collection deleted"); setOpen(false); router.refresh(); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="gradient"><Plus className="h-4 w-4" /> {triggerLabel ?? "New collection"}</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New collection" : "Edit collection"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Create a group for related prompts." : "Update this collection."}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" name="name" required defaultValue={collection?.name} placeholder="e.g. Marketing" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="c-desc" name="description" rows={2} defaultValue={collection?.description ?? ""} placeholder="What's in this collection?" />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <input type="hidden" name="color" value={color} />
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ${colorMap[c]} ${color === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""}`}
                />
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            {mode === "edit" && (
              <Button type="button" variant="destructive" size="sm" className="mr-auto" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <SubmitButton mode={mode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {mode === "create" ? "Create" : "Save"}
    </Button>
  );
}
