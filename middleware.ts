import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/features", "/pricing", "/faq", "/contact", "/about", "/privacy", "/terms", "/auth/callback"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value, options }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const publicRoute = PUBLIC_ROUTES.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/api/auth") || request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|map)$/);
  if (!user && !publicRoute) {
    const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("redirect", request.nextUrl.pathname); return NextResponse.redirect(url);
  }
  if (user && ["/login", "/register"].includes(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
