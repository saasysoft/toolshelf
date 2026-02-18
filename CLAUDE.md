# ToolShelf.dev

Curated developer tools directory with AI-enriched quality scores.

## Tech Stack
- Next.js 16 (App Router, React Server Components)
- Tailwind CSS v4
- Supabase (PostgreSQL, full-text search, RLS)
- TypeScript

## Project Structure
- `src/app/` — Pages (homepage, tool detail, category, search)
- `src/components/` — Reusable UI (ToolCard, badges, SearchBar, FilterSidebar)
- `src/lib/` — Supabase client, queries, utilities
- `src/types/` — TypeScript types matching Supabase schema
- `data/` — Seed JSON files (tools, categories, collections)
- `scripts/` — Enrichment and seeding scripts
- `supabase/migrations/` — SQL schema

## Key Commands
- `pnpm dev` — Start dev server
- `pnpm enrich` — Enrich seed data via GitHub/npm/PyPI APIs
- `pnpm seed` — Upload enriched data to Supabase

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_KEY` — Service key (for seeding scripts only)
