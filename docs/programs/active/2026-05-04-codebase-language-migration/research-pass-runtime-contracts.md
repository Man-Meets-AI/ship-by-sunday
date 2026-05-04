---
title: Runtime Contract Research Pass
summary: Runtime and web-app scan for codebase contracts touched by the direct language rename.
docType: program_research
status: active
read_when:
  - Planning route, Convex, auth, checkout, or web UI cleanup after the codebase rename.
---

# Runtime Contract Research Pass

This pass records runtime surfaces where `codebase` is more than copy. App and package owners should handle source edits in these paths.

## Affected Surface Groups

Routes, auth, checkout, and access:

- `apps/web/config/product.ts`
- `apps/web/proxy.ts`
- `apps/web/platform/auth/auth-route-utils.ts`
- `apps/web/platform/access/product-access.ts`
- `apps/web/app/(workspace)/codebase/page.tsx`
- `apps/web/app/(workspace)/review/page.tsx`
- `apps/web/app/access-required/page.tsx`
- `apps/web/app/checkout/**`
- `apps/web/app/robots.ts`

Existing route redirects:

- `apps/web/app/(workspace)/_lib/legacy-codebase-route-redirects.ts`
- redirect pages for `start`, `product`, `design`, `marketing`, and `build-plan`

Convex schema and functions:

- `apps/web/convex/schema.ts`
- `apps/web/convex/codebase.ts`
- `apps/web/convex/codebase/**`
- generated `apps/web/convex/_generated/api.d.ts`
- dependent bonus-course functions in `apps/web/convex/course/bonusMission.ts` and `apps/web/convex/course/bonusRoute.ts`

Workspace runtime:

- `apps/web/lib/codebase-flow/**`
- `apps/web/app/(workspace)/_components/codebase-flow/**`
- `apps/web/app/(workspace)/_hooks/codebase-flow/**`
- app shell navigation and command-menu files that build stage links

Homepage demo persistence:

- `apps/web/app/_components/home-page/sections/codebase-demo/**`
- `apps/web/lib/codebase-flow/use-codebase-local-draft-seeder.ts`

Review and download:

- `apps/web/app/api/download/repo/**`
- `apps/web/lib/codebase-flow/review-download-handoff.ts`
- `apps/web/app/(workspace)/review/_components/**`

Tests and proof scripts:

- `apps/web/tests/**codebase**`
- route/auth/checkout tests
- `apps/web/tests/e2e/global-setup.ts`
- `apps/web/scripts/verify-hosted-stripe-checkout.mjs`
- `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`

## Runtime Rename Notes

`/codebase` is public and protected. It appears in route config, redirects, auth fallback behavior, checkout success flow, docs, and proof scripts.

`codebaseWorkflowStates` is persisted Convex data. App/Convex owners should validate hosted data behavior before changing any persisted schema shape. Convex local mode is not allowed.

`api.codebase.*` is a generated Convex API namespace. Renaming the source module changes generated API call sites and helper names.

Stage payloads include serialized names: `"codebase"`, `codebaseReadiness.codebase`, `firstIncompleteStageId`, `kind: "codebase_stage"`, and `codebaseStageId`.

The homepage demo localStorage key is `sbs:home-codebase-draft:v1`.

Codex generation template IDs such as `codebase_intake_*` may be persisted in `codexRuns.templateId`.

## Runtime Ordering

First, make docs and Program packets state the direct rename correctly.

Second, have app/package owners finish any source paths that still fail scans or tests after the direct rename.

Third, validate runtime behavior through the focused route, checkout, Convex, and review/download tests owned by the app worker.

## Focused Validation

Use focused app tests before broad gates:

```bash
cd apps/web
bunx vitest --config vitest.config.ts run --project unit tests/unit/sign-in-route-utils.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/legacy-codebase-route-redirects.test.ts tests/unit/post-review-destination.test.ts tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/home-page-codebase-draft-storage.test.ts tests/unit/codebase-section-draft-assistant.test.tsx
bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/codebase-page.test.tsx tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/codebase-local-draft-seeder.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
bunx vitest --config vitest.config.ts run --project integration tests/integration/codebase-download-routes.test.ts tests/integration/codex-route-handlers.test.ts
```

If Convex module names change, run hosted codegen and validate generated function namespaces. Do not use Convex local mode.
