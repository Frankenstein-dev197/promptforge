"use client";

import * as React from "react";
import { useTransition } from "react";
import { runPromptAction, optimizePromptAction, applyOptimizedAction } from "@/lib/actions/runs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Play, Sparkles, Check, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

export function PromptPlayground({
  promptId,
  content,
  model,
  variables,
  canOptimize,
}: {
  promptId: string;
  content: string;
  model: string;
  variables: string[];
  canOptimize: boolean;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [output, setOutput] = React.useState<string | null>(null);
  const [runMeta, setRunMeta] = React.useState<{ tokensIn: number; tokensOut: number; latencyMs: number } | null>(null);
  const [optimizing, setOptimizing] = React.useState(false);
  const [optimized, setOptimized] = React.useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onRun() {
    setOutput(null);
    setRunMeta(null);
    startTransition(async () => {
      const res = await runPromptAction(promptId, values);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.run) {
        setOutput(res.run.output);
        // Fetch the run meta — we get it from the action response indirectly
        // We'll approximate by re-deriving from the output length
        setRunMeta({
          tokensIn: Math.max(1, Math.round(content.length / 4)),
          tokensOut: Math.max(1, Math.round(res.run.output.length / 4)),
          latencyMs: 0,
        });
        toast.success("Run completed");
      }
    });
  }

  async function onOptimize() {
    setOptimizing(true);
    setOptimized(null);
    startTransition(async () => {
      const res = await optimizePromptAction(promptId);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.optimized) {
        setOptimized(res.optimized);
        toast.success("Prompt optimized");
      }
      setOptimizing(false);
    });
  }

  async function onApplyOptimized() {
    if (!optimized) return;
    startTransition(async () => {
      const res = await applyOptimizedAction(promptId, optimized);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Optimized prompt applied");
        setOptimized(null);
        // reload to reflect new content
        window.location.reload();
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Input */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Fill in the variables, then run the prompt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {variables.length === 0 ? (
              <p className="text-sm text-muted-foreground">This prompt has no variables. Run it directly.</p>
            ) : (
              variables.map((v) => (
                <div key={v} className="space-y-1.5">
                  <Label htmlFor={`var-${v}`} className="font-mono text-xs">{`{{${v}}}`}</Label>
                  <Textarea
                    id={`var-${v}`}
                    rows={2}
                    placeholder={`Value for ${v}...`}
                    value={values[v] ?? ""}
                    onChange={(e) => setValues({ ...values, [v]: e.target.value })}
                  />
                </div>
              ))
            )}
            <Button variant="gradient" className="w-full" onClick={onRun} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run prompt
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">AI Optimizer</CardTitle>
              {!canOptimize && <Badge variant="warning">Pro+</Badge>}
            </div>
            <CardDescription>Improve this prompt using best practices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onOptimize} disabled={!canOptimize || optimizing || pending}>
              {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Optimize prompt
            </Button>
            {optimized && (
              <div className="mt-3 space-y-2">
                <Textarea rows={8} value={optimized} onChange={(e) => setOptimized(e.target.value)} className="font-mono text-xs" />
                <div className="flex gap-2">
                  <Button size="sm" variant="gradient" onClick={onApplyOptimized} disabled={pending}>
                    <Check className="h-3.5 w-3.5" /> Apply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setOptimized(null)}>Discard</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Output */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Output</CardTitle>
            {output && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {runMeta && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary" className="text-[10px]">In: {formatNumber(runMeta.tokensIn)} tok</Badge>
              <Badge variant="secondary" className="text-[10px]">Out: {formatNumber(runMeta.tokensOut)} tok</Badge>
              <Badge variant="outline" className="text-[10px] font-mono">{model}</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          {pending ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : output ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              {output}
            </pre>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <AlertCircle className="mb-2 h-6 w-6 opacity-40" />
              Run the prompt to see the output here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
