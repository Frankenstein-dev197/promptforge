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
- **Authentication** — bcrypt password hashing, JWT sessions in httpOnly cookies, protected routes
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
| Auth        | bcryptjs + jose (JWT)                        |
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
| `APP_URL`              | Public app URL                                           | `http://localhost:3000`          |
| `AUTH_SECRET`          | Secret used to sign JWT session tokens                   | dev default (change in prod)     |
| `SESSION_COOKIE_NAME`  | Name of the session cookie                               | `pf_session`                     |
| `OPENAI_API_KEY`       | Optional. Enables real OpenAI completions & optimizer    | empty (uses local engine)        |

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

- Passwords hashed with bcrypt (10 rounds)
- JWT sessions signed with `AUTH_SECRET`, stored in httpOnly cookies
- Per-user data isolation on every query
- Admin routes protected by role check
- Zod validation on all inputs
- No secrets exposed to the frontend
- `.env` excluded from Git via `.gitignore`

---

## 📄 License

This project is provided as-is for demonstration purposes.

---

Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
