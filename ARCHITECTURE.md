# Project Architecture

## Core Technology
*   **Frontend**: Next.js 14+ with App Router
*   **Database**: PostgreSQL (via Supabase)
*   **Backend Services**: Supabase (Auth, Storage, Edge Functions, RLS)

## Request Flow
```text
Browser Client -> Next.js Edge Cache -> Next.js Server Components -> Supabase Client -> PostgreSQL Database
```

## Supabase Client Architecture
We employ two types of Supabase clients:
1.  **Browser Client** (`src/utils/supabase/client.ts`): Used in standard client-side components for public or authenticated user actions (e.g. adding items to a cart client-side).
2.  **Server Client** (`src/utils/supabase/server.ts`): Used in Server Components and Server Actions. This is the primary driver for fetching data securely and passing it down to the UI.

## Database Strategy
The database acts as the single source of truth and primary validation layer for state integrity (e.g. preventing negative inventory via constraints).
*   **Row Level Security (RLS)** is enabled on all core tables.
*   The `profiles` table is automatically linked to `auth.users`.
*   Data access layers are modularized around features (Future phases will introduce `src/features/*`).

## Payment and Courier Abstraction
Payment and Courier integrations will be decoupled from core UI logic. All interactions with external services (JazzCash, Easypaisa, TCS) will be executed on the Next.js Server or via Supabase Edge Functions to protect API keys.
