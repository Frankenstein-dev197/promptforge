"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationPreferencesForm() {
  // Persisted client-side; a real implementation would store these in the user table.
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
    runFailed: true,
    runCompleted: false,
    planUpdates: true,
    productUpdates: false,
    weeklyDigest: true,
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("pf-notification-prefs");
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("pf-notification-prefs", JSON.stringify(next));
  }

  function save() {
    toast.success("Notification preferences saved.");
  }

  const items = [
    { key: "runFailed", label: "Run failed", desc: "Notify me when a prompt run fails." },
    { key: "runCompleted", label: "Run completed", desc: "Notify me when a prompt run completes." },
    { key: "planUpdates", label: "Plan updates", desc: "Notify me about plan and billing changes." },
    { key: "productUpdates", label: "Product updates", desc: "Notify me about new features." },
    { key: "weeklyDigest", label: "Weekly digest", desc: "A weekly summary of your activity." },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor={item.key} className="text-sm font-medium">{item.label}</Label>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <Switch id={item.key} checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
        </div>
      ))}
      <Button variant="gradient" onClick={save}>Save preferences</Button>
    </div>
  );
}
