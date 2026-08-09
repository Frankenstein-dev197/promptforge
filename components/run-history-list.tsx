import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

type Run = {
  id: string;
  status: "SUCCESS" | "FAILED";
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  output?: string | null;
  error?: string | null;
  input: string;
  createdAt: string;
};

export function RunHistoryList({ runs }: { runs: Run[] }) {
  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No runs yet. Use the playground tab to run this prompt.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {runs.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {r.status === "SUCCESS" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <Badge variant="outline" className="font-mono text-[10px]">{r.model}</Badge>
                {r.status === "SUCCESS" && (
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(r.tokensIn)} in · {formatNumber(r.tokensOut)} out · {r.latencyMs}ms
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {formatDateTime(r.createdAt)}
              </span>
            </div>
            {r.status === "SUCCESS" && r.output && (
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                {r.output}
              </pre>
            )}
            {r.status === "FAILED" && r.error && (
              <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {r.error}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
