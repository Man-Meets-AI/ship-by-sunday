# Normalized Track 2

## Facts

The runtime findings are recurring incident classes, not speculative polish. They involve telemetry recursion, client auth timing, dynamic import runtime crashes, public metadata dependency graphs, and implicit docs route behavior.

## Recommendation

Write one runtime-footgun ExecPlan that removes these known classes without widening into product-route cleanup.

## Risks

The main risk is mixing runtime hardening with route-contract decisions. Runtime stability should improve current behavior without deciding the product model.

## Code Seams

Key seams include `apps/web/features/observability/lib/client-error-report.ts`, `apps/web/features/course/lesson/components/bonus-lesson-view-tracker.tsx`, `apps/web/app/api/codex/*/route.ts`, `apps/web/app/sitemap.ts`, and `apps/web/app/docs/[[...mdxPath]]/page.tsx`.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md`.
