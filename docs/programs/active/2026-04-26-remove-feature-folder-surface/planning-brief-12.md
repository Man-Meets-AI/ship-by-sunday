---
title: 'Planning Brief 12 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 12
status: 'current'
summary: 'Twelfth child slice should remove the codex feature folder by moving Codex connection UI to workspace route-private ownership and Codex API/runtime helpers to explicit route-server and platform homes.'
read_when:
  - 'Writing or executing the Codex feature-folder removal ExecPlan.'
  - 'Checking the Codex connection card and API runtime ownership slice.'
---

# Planning Brief 12 Feature Folder Surface

The twelfth slice should delete `apps/web/features/codex` only if it can do so without changing Codex connection card behavior, Codex account login start/poll/logout/read/rate-limit routes, Codex generation route behavior, app-server JSON-RPC contracts, runtime incident classification, disabled-runtime copy, Clerk session checks, Convex product-access checks, viewer Codex connection persistence, Codex run recording, or production release proof semantics.

Move the Codex connection card components, hook, and card state helpers to a workspace App Router private owner under `apps/web/app/(workspace)`, because the card is rendered only by workspace home and settings surfaces. Move Codex API route helpers that call Clerk and Convex to a private `apps/web/app/api/codex/_server` owner. Move Codex app-server contracts, route-facing service boundary, and spawn-capable runtime client to `apps/web/platform/codex`, preserving server-only boundaries and the single `turbopackIgnore` dynamic import for the spawn-capable runtime module. Update route handlers, tests, coverage config, Next config, and docs references away from `@/features/codex`.

Do not change checkout, Stripe, pricing, promo code, billing proof, entitlement behavior, Convex schema, generated Convex files, AppShell, route URLs, Codex API response shapes, Codex app-server method names, runtime enablement environment variables, product-access rules, or production release proof semantics. The focused proof should cover Codex route helpers, Codex route handlers, Codex app-server runtime error classification, settings/workspace-home render consumers, app lint/typecheck, import scans, and Program/ExecPlan validation. After the PR merges, verify normal production proof for the merged `main` commit.
