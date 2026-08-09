import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanConfig } from "@/lib/plans";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileSettingsForm } from "./profile-form";
import { SecuritySettingsForm } from "./security-form";
import { BillingSettings } from "./billing-settings";
import { NotificationPreferencesForm } from "./notification-prefs";
import { LoginMethods } from "./login-methods";

export const metadata: Metadata = { title: "Settings" };

type SearchParams = Promise<{ tab?: string }>;

const ALL_PROVIDERS = ["google", "github"];

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) return null;
  const { tab } = await searchParams;
  const plan = getPlanConfig(session.plan);

  const user = await getCurrentUser();
  const linked = await prisma.account.findMany({
    where: { userId: session.id },
    select: { provider: true },
  });
  const linkedProviders = new Set(linked.map((a) => a.provider));
  const accounts = ALL_PROVIDERS.map((provider) => ({
    provider,
    connected: linkedProviders.has(provider),
  }));

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

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sign-in methods</CardTitle>
              <CardDescription>
                Manage how you sign in. Connect a social provider or set a password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <LoginMethods
                  email={session.email}
                  hasPassword={Boolean(user?.passwordHash)}
                  accounts={accounts}
                />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {user?.passwordHash ? "Change password" : "Set a password"}
              </CardTitle>
              <CardDescription>
                {user?.passwordHash
                  ? "Use a strong, unique password."
                  : "Set a password so you can also sign in with your email."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm hasPassword={Boolean(user?.passwordHash)} />
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
