# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `app/` (`page.tsx`, `battle/[id]`, `ranking/[id]`, `admin/*`, auth/login`); layout and globals are in `app/layout.tsx` and `app/globals.css`.
- Reusable UI is in `components/` (`components/ui/*`, Neo cards/buttons, admin forms); utilities and data helpers are in `lib/` (Supabase clients, AI integration, mock data, types).
- Assets in `public/`; extra styles in `styles/globals.css`; schema in `supabase/schema.sql`. Seed mock data via `/api/seed` locally.
- Use `@/...` for imports; keep Supabase access in `lib/supabase/*`.

## Build, Test, and Development Commands
- `pnpm install` to install dependencies (pnpm is the canonical package manager).
- `pnpm dev` to run the local server on port 3000.
- `pnpm lint` to run ESLint with Next rules; fix findings before committing.
- `pnpm build` to create a production build; `pnpm start` serves that build.
- `pnpm pages:build` generates the Cloudflare Pages bundle; `pnpm deploy` runs that build then `wrangler pages deploy`.
- After `pnpm dev`, hit `curl http://localhost:3000/api/seed` to load mock data for admin/battle flows.

## Coding Style & Naming Conventions
- TypeScript with `strict` enabled; prefer server components unless interactivity is needed.
- Use 2-space indentation, trailing semicolons, and double quotes to match existing files.
- Components export PascalCase identifiers; file names stay kebab-case. Keep Tailwind classes ordered by layout → spacing → color → state, using `cn` from `lib/utils` for conditional classes.
- Keep secrets out of client bundles; don’t instantiate Supabase clients outside `lib/supabase/*`.

## Testing Guidelines
- No automated tests exist yet; minimally run `pnpm lint` and manual smoke tests (login/auth flow, admin topic create/edit, battle voting, ranking view, comments drawer).
- When adding coverage, mirror routes/components under `__tests__/` and lean on integration checks (e.g., Playwright) for critical flows.

## Commit & Pull Request Guidelines
- Git history favors concise, present-tense summaries (English or Korean), e.g., `admin 콘텐츠 생성 기능 구현`; include a short scope if helpful (`admin: add topic edit dialog`).
- PRs should state what/why, list commands/manual steps used to verify, attach screenshots/Loom for UI changes, and link related issues/tasks.
- Run `pnpm lint` before opening a PR; flag any new env requirements explicitly.

## Security & Configuration Tips
- Required env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional `SUPABASE_SERVICE_ROLE_KEY` for admin uploads, and `GOOGLE_API_KEY` for topic/image generation. Store them in `.env.local` and never commit.
- Supabase policies in `supabase/schema.sql` are permissive for demo use; tighten before production and avoid invoking `/api/seed` against live data.
