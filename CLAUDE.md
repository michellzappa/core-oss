# CLAUDE.md — Extension Guide for Core OSS

This file helps Claude Code (and developers) understand the architecture and extend the CRM.

## Architecture Overview

### How a request flows

1. **Page** (server component in `src/app/dashboard/[entity]/`) fetches data via Supabase server client
2. **Data Table** or **Form** renders the data client-side
3. **Server Actions** (`src/lib/actions/`) handle create/update/delete mutations
4. **API Routes** (`src/app/api/`) provide REST endpoints for SWR client-side fetching
5. **Validation** is enforced by Zod schemas (`src/lib/validation/schemas.ts`)

### Key patterns

- **Unified Form System**: All entity forms use `formConfigs` in `src/lib/forms/form-configs.ts`. Each config maps to a Zod schema, field definitions, and CRUD server actions.
- **Generic API Service**: `src/lib/api-service.ts` provides a base `ApiService<T>` class with `getAll()`, `getById()`, `create()`, `update()`, `delete()` methods.
- **Data Table**: `src/components/ui/composite/data-table.tsx` handles sorting, filtering, search, pagination, and bulk delete. Entity-specific column configs live in `src/components/features/entities/entity-index-client.tsx`.
- **Command Palette**: `src/components/providers/command-palette-provider.tsx` registers navigation shortcuts. Entity data for search is fetched via `src/lib/actions/navigation.ts`.
- **Filter System**: Table filters are defined in `src/components/ui/composite/table-filters.tsx` with entity-specific filter configs (`getOrganizationFilters`, `getOfferFilters`, etc.).

## How to Add a New Entity

Example: adding a **Tasks** entity.

### Step 1: Database migration

Create `migrations/003_tasks.sql`:

```sql
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  title text not null,
  notes text,
  status text default 'pending' not null,
  due_date date,
  completed_at timestamptz,
  project_id uuid references projects(id),
  organization_id uuid references organizations(id)
);

alter table tasks enable row level security;
create policy "Allow authenticated full access" on tasks
  for all using (auth.role() = 'authenticated');
```

### Step 2: Add TypeScript types

In `src/lib/database.types.ts`, add the table type to the `Tables` interface:

```typescript
tasks: {
  Row: { id: string; created_at: string; title: string; notes: string | null; status: string; due_date: string | null; completed_at: string | null; project_id: string | null; organization_id: string | null; };
  Insert: { title: string; notes?: string; status?: string; due_date?: string; project_id?: string; organization_id?: string; };
  Update: Partial<...Insert>;
};
```

### Step 3: Zod validation schema

In `src/lib/validation/schemas.ts`:

```typescript
export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  due_date: optionalDateSchema,
  project_id: optionalUuidSchema,
  organization_id: optionalUuidSchema,
});
export const taskUpdateSchema = taskCreateSchema.partial();
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
```

### Step 4: API service

Create `src/lib/api/tasks.ts`:

```typescript
import { ApiService } from "@/lib/api-service";
export interface Task { id: string; title: string; /* ... */ }
export class TaskApiService extends ApiService<Task> {
  constructor() { super("tasks"); }
}
```

### Step 5: Server actions

Create `src/lib/actions/tasks.ts` following the pattern in `src/lib/actions/contacts.ts`:
- `createTask(formData)` — validate with `taskCreateSchema`, insert, revalidate path
- `updateTask(id, formData)` — validate with `taskUpdateSchema`, update, revalidate
- `deleteTask(id)` — delete, revalidate

### Step 6: API route

Create `src/app/api/tasks/route.ts` with GET (list) and POST (create) handlers.
Create `src/app/api/tasks/[id]/route.ts` with GET, PUT, DELETE handlers.

### Step 7: Form config

In `src/lib/forms/form-configs.ts`, add:

```typescript
task: {
  schema: taskCreateSchema,
  fields: taskFormFields,
  entityName: "task",
  apiEndpoint: "/api/tasks",
  backLink: "/dashboard/tasks",
  createAction: createTask,
  updateAction: updateTask,
  deleteAction: deleteTask,
},
```

Define `taskFormFields` with the field array.

### Step 8: Pages

- `src/app/dashboard/tasks/page.tsx` — list page (follow `projects/page.tsx` pattern)
- `src/app/dashboard/tasks/new/page.tsx` — create page
- `src/app/dashboard/tasks/[id]/page.tsx` — detail/edit page

Add column definitions in `src/components/features/entities/entity-index-client.tsx`.

### Step 9: Navigation

Add to `src/lib/navigation-config.ts`:

```typescript
{ name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
```

Add to command palette search in `src/lib/actions/navigation.ts`.

## Extension Ideas

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Tasks / Kanban | Easy | Add tasks table + kanban view component |
| Milestones | Easy | Add milestones table linked to projects |
| Interactions / Touchpoints | Easy | Add interactions table with contact junction |
| Leads / Pipeline | Medium | Add leads table with pipeline stages, kanban board |
| Licenses | Medium | Auto-generate from accepted offers |
| Multi-tenancy (RLS) | Medium | Add `owner_id` column + RLS policies per user |
| Email Integration | Medium | Add email service (Postmark, Resend) for offer delivery |
| Image Upload | Easy | Add Cloudinary or Supabase Storage upload route |
| Multi-currency | Easy | Add currencies table with exchange rates |
| AI Assistant | Medium | Add LLM integration for entity search and insights |
| Webhook / Zapier | Medium | Add webhook delivery on entity mutations |
| Calendar Integration | Large | Google Calendar OAuth for meeting scheduling |
| CMS / Website | Large | Second data-space for content management |

## How to Add a Settings Page

1. Add config entry in `src/components/features/settings/settings.config.ts`
2. Create a list component in `src/components/features/settings/` (follow `payment-terms-list.tsx`)
3. Create API route in `src/app/api/settings/[your-setting]/route.ts`
4. Add the tab to `src/components/features/settings/settings-tabs-client.tsx`
5. Wire it in the settings page router

## How to Add a Custom Form Field

1. Create a component in `src/components/forms/custom-fields/`
2. Register it in `src/lib/forms/form-configs.ts` using `customRenderer` with `React.lazy()`
3. The unified form system will automatically render it when the field type is `"custom"`

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/api-service.ts` | Generic CRUD base class |
| `src/lib/validation/schemas.ts` | All Zod schemas |
| `src/lib/forms/form-configs.ts` | Form configurations per entity |
| `src/lib/navigation-config.ts` | Sidebar navigation items |
| `src/lib/server-data.ts` | Server-side data fetching with caching |
| `src/components/ui/composite/data-table.tsx` | Generic data table |
| `src/components/features/entities/entity-index-client.tsx` | Entity column definitions |
| `src/components/forms/unified/unified-form-client.tsx` | Form renderer |
| `src/components/providers/command-palette-provider.tsx` | Cmd+K search |

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm lint         # ESLint
```
