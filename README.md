# Core OSS

A minimalist, extensible open-source CRM built with Next.js, Supabase, and Tailwind CSS. Designed to be extended with Claude Code.

## Features

- **5 Core Entities**: Organizations, Contacts, Projects, Offers, Services
- **Offer Builder**: Create proposals with service line items, discounts, and terms
- **Public Offer View**: Shareable offer pages with email-gated acceptance
- **Dashboard**: KPI cards and offer history chart
- **Unified Form System**: Consistent create/edit forms powered by React Hook Form + Zod
- **Data Table**: Sorting, filtering, search, and pagination
- **Command Palette**: Quick navigation with Cmd+K
- **Settings**: Corporate entities, payment terms, delivery conditions, offer link presets
- **Dark/Light Theme**: System-aware with manual override

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + Shadcn UI (Radix primitives)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR (client), unstable_cache (server)
- **Language**: TypeScript

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> core-oss
cd core-oss
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `migrations/001_initial_schema.sql`
3. Run `migrations/002_seed_data.sql` for default settings and sample services
4. Go to **Authentication > Settings** and enable email/password sign-ups
5. Create your first user in **Authentication > Users**

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials from **Project Settings > API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in.

## Project Structure

```
src/
├── app/
│   ├── api/                    # REST endpoints
│   ├── auth/                   # Login, reset password
│   ├── dashboard/              # Protected CRM pages
│   │   ├── organizations/      # CRUD pages
│   │   ├── contacts/
│   │   ├── projects/
│   │   ├── offers/
│   │   ├── services/
│   │   └── settings/           # System & offer settings
│   └── offers/view/[id]/       # Public offer page
├── components/
│   ├── ui/                     # Shadcn primitives + composites
│   ├── forms/unified/          # Unified form system
│   ├── features/               # Entity pages, settings, analytics
│   ├── entities/               # Entity-specific components
│   ├── layouts/                # Sidebar, page headers
│   └── providers/              # Theme, SWR, command palette
├── hooks/                      # SWR hooks for entities
└── lib/
    ├── actions/                # Server actions
    ├── api/                    # API service classes
    ├── forms/                  # Form configs
    ├── validation/             # Zod schemas
    └── utils/                  # Utilities
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `organizations` | Client companies |
| `contacts` | People at organizations |
| `projects` | Active engagements |
| `services` | Service catalog |
| `offers` | Proposals |
| `offer_services` | Line items linking offers to services |
| `offer_selected_links` | Per-offer resource links |
| `corporate_entities` | Your invoicing entities |
| `settings_payment_terms` | Payment term presets |
| `settings_delivery_conditions` | Delivery condition presets |
| `settings_offer_links` | Offer link presets |

## Extending

See [CLAUDE.md](./CLAUDE.md) for a detailed guide on adding new entities, form fields, settings pages, and more.

## License

[MIT](./LICENSE)
