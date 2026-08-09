# PromptForge

> Forge prompts that ship results.

PromptForge is a professional SaaS workspace for managing, versioning, testing, and optimizing AI prompts. It turns scattered prompt notes into engineered, trackable artifacts — with a built-in playground, version history, run analytics, and an AI prompt optimizer.

---

## ✨ Features

- **Prompt library** — Full CRUD with starring, tagging, and instant search
- **Collections** — Group prompts by project or team with colored collections
- **Version history** — Every content change is saved as a version; restore any previous version
- **Playground** — Run prompts with `{{variables}}`, view completions, tokens, and latency in real time
- **AI prompt optimizer** — One-click prompt rewriting using best practices (Pro+ plans)
- **Run analytics** — Track every execution, monitor token usage, and spot regressions
- **Notifications** — In-app notifications with unread counters and management
- **Authentication** — Email/password (bcrypt) **plus Google & GitHub OAuth**, JWT sessions in httpOnly cookies, protected routes, linkable multi-provider accounts
- **Onboarding** — Quick role + use-case setup after registration
- **Profile & settings** — Profile editing, password changes, notification preferences, plan management
- **Subscriptions** — Free, Pro, and Team plans with enforced limits
- **Admin panel** — Platform stats, user management, role/plan control, audit logs
- **Responsive** — Works on phone, tablet, laptop, and desktop
- **Dark / light theme** — Toggle in the header
- **SEO** — Metadata, Open Graph, semantic structure on public pages

---

## 🛠 Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Framework   | Next.js 15 (App Router)                      |
| Language    | TypeScript                                   |
| Styling     | Tailwind CSS 3                               |
| Components  | shadcn/ui (Radix UI primitives)              |
| Icons       | Lucide React                                 |
| Charts      | Recharts                                     |
| Database    | SQLite via Prisma ORM                        |
| Auth        | bcryptjs + jose (JWT) + OAuth (Google, GitHub)            |
| Validation  | Zod                                          |
| Forms       | React Hook Form + Server Actions             |
| Toasts      | Sonner                                       |
| Testing     | Vitest + Testing Library                     |

---

## 🚀 Getting started

### Prerequisites

- Node.js 18+ (tested on Node 22)
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Generate Prisma client and create the database
npx prisma generate
npx prisma db push

# 4. Seed the database with demo data
npm run db:seed

# 5. Start the dev server
npm run dev
```

Visit **http://localhost:3000**.

### Demo accounts

After seeding, these accounts are available:

| Role  | Email                    | Password    |
| ----- | ------------------------ | ----------- |
| Admin | admin@promptforge.dev    | Admin1234   |
| Pro   | demo@promptforge.dev     | Demo1234    |
| Free  | free@promptforge.dev     | Free1234    |

---

## ⚙️ Configuration

### Environment variables

| Variable               | Description                                              | Default                          |
| ---------------------- | -------------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`         | Prisma database URL (SQLite file path)                   | `file:./dev.db`                  |
| `APP_URL`              | Public app URL (used to build OAuth callback URLs)       | `http://localhost:3000`          |
| `AUTH_SECRET`          | Secret used to sign JWT session + OAuth state tokens     | dev default (change in prod)     |
| `SESSION_COOKIE_NAME`  | Name of the session cookie                               | `pf_session`                     |
| `OPENAI_API_KEY`       | Optional. Enables real OpenAI completions & optimizer    | empty (uses local engine)        |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID (server-side only)                | empty (Google hidden)            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (server-side only)            | empty (Google hidden)            |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID (server-side only)                | empty (GitHub hidden)            |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (server-side only)            | empty (GitHub hidden)            |

#### OAuth providers (optional but recommended)

PromptForge supports **Google** and **GitHub** sign-in out of the box. Providers with missing credentials are simply hidden from the UI, so email/password auth always works.

1. **Google** — Create OAuth credentials at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   Add the authorized redirect URI: `<APP_URL>/api/auth/oauth/google/callback`.
   Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
2. **GitHub** — Register an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers).
   Set the Authorization callback URL to `<APP_URL>/api/auth/oauth/github/callback`.
   Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

Adding another provider later requires only a new entry in `OAUTH_PROVIDERS` (`lib/oauth.ts`) and the corresponding login/callback routes are already generic.

### AI completions

PromptForge ships with a **built-in deterministic completion engine** so the playground, run history, and AI optimizer work out of the box without any external API key. When `OPENAI_API_KEY` is set, the app uses the real OpenAI Chat Completions API instead.

---

## 📜 Available scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the dev server                         |
| `npm run build`   | Production build                             |
| `npm run start`   | Start the production server                  |
| `npm run lint`    | Run ESLint                                   |
| `npm run typecheck` | TypeScript type checking                    |
| `npm test`        | Run unit tests (Vitest)                      |
| `npm run db:push` | Push schema to database                      |
| `npm run db:seed` | Seed demo data                               |
| `npm run db:studio` | Open Prisma Studio                         |

---

## 🧪 Testing

```bash
npm test
```

Tests cover:
- Utility functions (variable parsing, template rendering, formatting)
- Zod validation schemas (auth, prompts, collections, onboarding)
- AI completion engine and optimizer
- Plan configuration and limits

---

## 🏗 Architecture

```
app/
├── (app)/                 # Protected app routes (authenticated)
│   ├── dashboard/         # Stats, charts, recent activity
│   ├── prompts/           # Prompt library, detail, new
│   ├── collections/       # Collection management
│   ├── playground/        # Run prompts + history
│   ├── notifications/     # In-app notifications
│   ├── settings/          # Profile, security, billing, prefs
│   ├── profile/           # Public profile
│   └── admin/             # Admin panel (users, logs)
├── login/                 # Sign in
├── register/              # Sign up
├── forgot-password/       # Password reset request
├── onboarding/            # Post-signup setup
├── features/              # Public features page
├── pricing/               # Public pricing page
├── faq/                   # Public FAQ
├── about/                 # Public about page
├── contact/               # Public contact form
├── privacy/               # Privacy policy
├── terms/                 # Terms of service
├── layout.tsx             # Root layout (fonts, theme, toaster)
├── page.tsx               # Landing page
├── not-found.tsx          # 404
├── error.tsx              # Error boundary
└── loading.tsx            # Loading state

components/
├── ui/                    # shadcn/ui components
├── sidebar-nav.tsx        # App sidebar
├── app-header.tsx         # App header with search, notifications, menu
├── prompt-card.tsx        # Prompt list card
├── prompt-form.tsx        # Create/edit prompt form
├── prompt-playground.tsx  # Run prompts with variables
├── version-history.tsx    # Version diff and restore
├── runs-chart.tsx         # Dashboard activity chart
└── ...                    # Other shared components

lib/
├── prisma.ts              # Prisma client singleton
├── auth.ts                # Auth: hashing, sessions, JWT
├── ai.ts                  # Completion engine + optimizer
├── plans.ts               # Plan configs, models, templates
├── validations.ts         # Zod schemas
├── queries.ts             # Dashboard data queries
├── utils.ts               # Shared utilities
└── actions/               # Server actions
    ├── auth.ts            # Auth actions
    ├── prompts.ts         # Prompt/collection CRUD
    ├── runs.ts            # Run, optimize, notifications
    └── admin.ts           # Admin actions

prisma/
└── schema.prisma          # Database schema

middleware.ts              # Route protection (JWT verification)
```

### Authentication flow

1. User registers → password hashed with bcrypt → user created → session JWT issued
2. JWT stored in httpOnly cookie, also persisted in `Session` table for revocation
3. Middleware verifies JWT on protected routes and gates onboarding
4. `getSession()` server-side validates both JWT signature and DB session existence
5. Onboarding updates `onboardingDone` and re-issues the session JWT

### OAuth flow

1. User clicks "Continue with Google/GitHub" → `GET /api/auth/oauth/:provider/login`
2. Server generates a PKCE pair + signed state JWT, sets a nonce cookie, redirects to the provider
3. Provider redirects back to `GET /api/auth/oauth/:provider/callback` with `code` + `state`
4. Server verifies the signed state (and nonce cookie), exchanges the code for tokens via PKCE, fetches the provider profile
5. Account linking (no duplicate users):
   - If an `Account` exists for this provider+id → sign that user in
   - Else if a `User` with the same email exists → create an `Account` linked to that user
   - Else → create a new password-less `User` + `Account`
6. Existing session infra (`createSession`) issues the same JWT cookie — identical to email login
7. Redirect to onboarding (if incomplete) or dashboard (otherwise)
8. From Settings → Security, a signed-in user can connect/disconnect providers (`mode=link`); disconnect is blocked if it would leave zero sign-in methods

### Data isolation

Every query is scoped by `userId` from the session. A user can never access another user's prompts, collections, runs, or notifications. Admin routes require `role === "ADMIN"` enforced both in middleware and server actions.

---

## 🚢 Deployment

### Build for production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set environment variables (use a strong `AUTH_SECRET`)
4. For SQLite: use a persistent volume or switch `DATABASE_URL` to PostgreSQL (update `prisma/schema.prisma` provider)
5. Deploy

> **Note:** SQLite is great for development and small deployments. For production with multiple instances, switch to PostgreSQL by changing the Prisma `provider` and `DATABASE_URL`.

---

## 🔐 Security

- Passwords hashed with bcrypt (10 rounds); OAuth-only users have no password
- JWT sessions signed with `AUTH_SECRET`, stored in httpOnly cookies
- OAuth uses PKCE (S256) + signed state JWT + nonce cookie (CSRF protection)
- OAuth client secrets never reach the client (server-side routes only)
- Account linking by email prevents duplicate users; providers are never force-linked to the wrong account
- Disconnecting a provider is blocked if it would leave zero sign-in methods (lock-out prevention)
- Per-user data isolation on every query
- Admin routes protected by role check
- Zod validation on all inputs
- `.env` excluded from Git via `.gitignore`

---

## 📄 License

This project is provided as-is for demonstration purposes.

---

Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
