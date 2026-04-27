---
title: 'Planning Brief 15 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 15
status: 'current'
summary: 'Fifteenth child slice should remove the execute-ship feature folder by moving bonus route UI, shared bonus presentation contracts, and route server helpers to explicit owners.'
read_when:
  - 'Writing or executing the execute-ship feature-folder removal ExecPlan.'
  - 'Checking the post-review bonus lesson ownership slice.'
---

# Planning Brief 15 Feature Folder Surface

The fifteenth slice should delete `apps/web/features/execute-ship` without changing the post-review bonus lesson behavior. The current folder is not one coherent durable feature owner anymore. Its route UI belongs to the protected workspace route group, its shared bonus lesson presentation contracts are consumed by workspace navigation and review, and its server helpers belong beside the App Router route or route handler that calls them.

Move bonus lesson and Lesson Map route UI into `apps/web/app/(workspace)/_components/execute-ship`. Move shared bonus lesson presentation helpers and types into `apps/web/lib/execute-ship`. Move the server-only bonus lesson view mutation helper into `apps/web/app/api/course/bonus-lesson-viewed/_server/bonus-lesson-view-tracking.ts` and the protected bonus-route access loader into `apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts`. Add `import "server-only"` to the route access loader after the move. Delete stale execute-ship track files if scans confirm they have no live consumers. Do not change route URLs, post-review unlock behavior, bonus mission state, bonus viewed tracking semantics, AppShell behavior, checkout, billing, Stripe, pricing, promo codes, Convex schema, generated Convex files, or environment behavior.

Focused proof should include the bonus mission page, bonus lesson page, mission and lesson route tests, the bonus lesson viewed route test, the bonus lesson view tracker integration-ui test, and the blueprint review integration-ui surface that renders the shared Lesson Map. After merge, production proof should at least run `default_ship`; billing proof should only run if release scope detects a billing-sensitive change.
