# PromptForge — Agent Memory

## Auth architecture
- Custom auth: `bcryptjs` (passwords) + `jose` JWT sessions stored in httpOnly cookie `pf_session`,
  validated against a `Session` table in Prisma (SQLite). See `lib/auth.ts`, `middleware.ts`.
- OAuth (Google + GitHub) added via a **custom PKCE flow** that reuses the existing
  `createSession`/`destroySession` infra — NOT next-auth. Core in `lib/oauth.ts`.
  - Login route: `app/api/auth/oauth/[provider]/login/route.ts` (mints PKCE + signed state JWT, nonce cookie).
  - Callback route: `app/api/auth/oauth/[provider]/callback/route.ts` (validates state, exchanges code,
    fetches profile, links/creates user, issues session).
- `Account` model (`prisma/schema.prisma`) links providers to users; `User.passwordHash` is now optional
  so OAuth-only users work. Account linking is by email — no duplicate users.
- Providers registry: `OAUTH_PROVIDERS` in `lib/oauth.ts`. Add a provider = add one entry; routes are generic.
- Disconnect safety (`disconnectProviderAction` in `lib/actions/auth.ts`): blocked if it would leave zero
  sign-in methods (no password + no other provider).
- `enabledProviders()` hides providers without env credentials from the UI automatically.

## Env vars (see .env.example)
- `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` — server-side only.
- `APP_URL` used to build OAuth callback URLs.

## UI
- `components/oauth-buttons.tsx` + `components/oauth-icons.tsx` — shared OAuth buttons (login + link modes).
- `app/(app)/settings/login-methods.tsx` — sign-in methods card in Settings → Security.

## Testing
- `npm test` (vitest) — `lib/__tests__/oauth.test.ts` covers providers, PKCE, state JWT, token exchange, profiles.
- `next lint` hangs in this env (ESLint 9 flat config); rely on `tsc --noEmit` + `next build` instead.
- jose `Uint8Array` realm issue in jsdom: OAuth tests use `// @vitest-environment node`.

## Scripts
- `npm run dev` (port 3000), `npm run build`, `npx tsc --noEmit`, `npm run db:seed`, `npx prisma db push`.
