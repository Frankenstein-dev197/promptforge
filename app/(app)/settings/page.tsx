import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getPlanConfig } from "@/lib/plans";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileSettingsForm } from "./profile-form";
import { SecuritySettingsForm } from "./security-form";
import { BillingSettings } from "./billing-settings";
import { NotificationPreferencesForm } from "./notification-prefs";

export const metadata: Metadata = { title: "Settings" };

type SearchParams = Promise<{ tab?: string }>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) return null;
  const { tab } = await searchParams;
  const plan = getPlanConfig(session.plan);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, security, and billing.</p>
      </div>

      <Tabs defaultValue={tab ?? "profile"}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile information</CardTitle>
              <CardDescription>Update your name, role, and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                initial={{
                  name: session.name ?? "",
                  jobRole: null,
                  avatarUrl: session.avatarUrl ?? "",
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
              <CardDescription>Use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <BillingSettings currentPlan={session.plan} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
