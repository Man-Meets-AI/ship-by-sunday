# GEMINI.md - Foundational Mandates

This document contains foundational mandates for Gemini CLI in this workspace. These instructions take absolute precedence over general workflows and tool defaults.

## Next.js Critical Warning
<!-- BEGIN:nextjs-agent-rules -->
**This is NOT the Next.js you know.** This version has breaking changes. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing or changing Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Canonical Truth & Source Order
Use this exact priority order when sources conflict:
1. `AGENTS.md` and nested `AGENTS.md` files
2. `docs/index.md` and the referenced canonical docs spine
3. current runtime code in `apps/web/` and `packages/blueprint-compiler/`
4. `docs/ship-by-sunday/*` historical source packs for background only

## Repository Layout & Engineering Standards
- **Feature-First:** Organize code by feature, not by file type. Working in `apps/web/features/` is preferred over route-level logic.
- **Separation of Concerns:** Presentation belongs in components; stateful or behavioral logic belongs in hooks, helpers, or controller layers.
- **Component Limits:** Never leave a component above **150 lines** if it can be split cleanly into feature-local pieces.
- **Types & Validation:** Prefer straightforward TypeScript, early returns, shallow control flow, and discriminated unions. Assert at boundaries; fail fast.
- **Smallest Change:** Prefer the smallest viable change. No opportunistic refactors unless required.

## Core Tools & Stack
- **Runtime/PM:** `bun`
- **UI:** `shadcn/ui`
- **Lint/Format:** `oxlint`, `oxfmt`
- **Python:** `uv`, `ruff`, `black`
- **Backend/Auth:** Convex (hosted dev only), Clerk
- **Payments:** Stripe
- **Testing:** Playwright (E2E/Browser), Vitest (Unit/Integration)

## Critical Dev Commands (Root Entrypoint)
- `bun run dev:full` — Start web + hosted Convex dev + Stripe listener.
- `bun run build` / `bun run typecheck` — Build and verify.
- `bun run check` — Full repo check (lint, format, test, build).
- `bun run test:unit` / `test:contracts` / `test:integration` / `test:e2e:sandbox` — Focused and broad test surfaces.

## Subsystem Rules

### Web App (`apps/web`)
- **Blueprint-First:** This product is blueprint-first, not course-first.
- **Funnel:** `Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download`.
- **Unlock Logic:** Ensure `design blueprint`, `marketing blueprint`, `build blueprint`, and `repo zip` unlock exactly as defined in `apps/web/AGENTS.md`.
- **Homepage:** Changes to `/` must follow `starterConfig.homePage` in `apps/web/config/product.ts` and related files. Read `apps/web/content/docs/configure-the-homepage.mdx` first.

### Blueprint Compiler (`packages/blueprint-compiler`)
- **Compiler First:** Treat as a blueprint compiler with repo-generation side effects.
- **Derivation:** Prefer derivation over recollection. Do not re-ask downstream for upstream data.
- **Pricing:** Belongs in `Build Plan`.
- **Customer-Safe:** Repo snapshots must exclude machine-local junk, generated output, and unresolved symlinks.

## Convex & ExecPlans
- **Convex:** Hosted dev workflow only. No local mode. Read `apps/web/convex/_generated/ai/guidelines.md` before editing.
- **ExecPlans:** Mandatory for complex features, migrations, or refactors. Store active plans in `docs/exec-plans/active/`. Follow `docs/exec-plans/PLANS.md` exactly. Treat `docs/codex/` as legacy archive only.
- **Validation:** Validate immediately after each milestone. Stop and repair if validation fails.

## Definition of "Done"
1. Requested behavior is implemented and verified.
2. Relevant checks passed (`lint`, `format:check`, `test`, `build`).
3. Diff is scoped; no unrelated changes.
4. `GEMINI.md`, ExecPlans, or docs are updated as needed.
5. Remaining risks or follow-ups are clearly stated.

## Security & Integrity
- Never commit secrets, API keys, or `.env` files.
- Do not overwrite unrelated user changes or delete unrelated files.
- Propose a draft commit message and wait for approval before committing.
