import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    await prisma.user.upsert({ where: { email: user.email.toLowerCase() }, update: { name: user.user_metadata?.full_name ?? user.user_metadata?.name, avatarUrl: user.user_metadata?.avatar_url }, create: { email: user.email.toLowerCase(), name: user.user_metadata?.full_name ?? user.user_metadata?.name, avatarUrl: user.user_metadata?.avatar_url, passwordHash: null } });
  }
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(new URL(destination, url.origin));
}
