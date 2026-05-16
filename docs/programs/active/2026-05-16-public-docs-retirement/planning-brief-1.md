---
title: "Public Docs Runtime Retirement Planning Brief 1"
program_id: "public-docs-retirement"
brief_version: 1
status: "current"
summary: "Remove the public /docs route and docs MDX corpus while preserving setup truth in non-public durable docs and keeping blog MDX live."
read_when:
  - "Writing the first child ExecPlan for public docs removal."
  - "Checking the exact scope for deleting docs MDX."
  - "Validating that blog and setup truth survive the docs hard cut."
---

# Public Docs Runtime Retirement Planning Brief 1

Date: 2026-05-16.

This brief drives the first child ExecPlan for retiring the public docs route and MDX corpus.

## Outcome

After the slice, public `/docs` is intentionally gone or intentionally handled as a removed route, `apps/web/src/content/docs/` no longer exists, `apps/web/src/app/(marketing)/docs/` no longer exists, docs-specific loaders/nav/tests/config/tooling references are removed, blog MDX still renders, and setup truth lives in non-public durable docs.

## Scope

Move essential setup truth from public docs MDX into durable non-public docs. Required topics are environment variables, local setup, local QA, Clerk/Convex auth, Stripe checkout/webhook, Vercel deploy, route/provider map, Worker Seal Team 6 Cal.com setup, and Telegram support bot setup.

Delete the public docs content and runtime:

- `apps/web/src/content/docs/`
- `apps/web/src/app/(marketing)/docs/`
- docs-specific loaders, navigation, metadata, theme, disabled-state, and CSS code
- docs-specific tests

Update shared code and docs:

- public content inventory
- public metadata route index
- route/product config and starter selectors
- course lesson docs links
- markdown metadata docs family
- active Program/ExecPlan/release/reliability references that point at public docs as current truth

Keep blog MDX and blog route code intact unless a shared import or metadata type has to change.

## Boundaries

Do not add a replacement public docs route.

Do not preserve the docs corpus under another public MDX path.

Do not touch Telegram widget UI, Starter preview work, checkout model changes, generated repo redesign, or visual redesign.

Do not delete internal repo docs, generated customer docs, Program packets, ExecPlans, or blog posts.

Do not remove setup truth that a customer, operator, or future agent needs to configure external providers.

## Acceptance

No source imports `@/content/docs`, `apps/web/src/content/docs`, docs route helpers, docs navigation components, or docs metadata helpers.

No public sitemap, robots, route config, header/nav, course resource, or structured-data test implies `/docs` is a surviving product route.

`apps/web/src/content/blog` remains in place and focused blog tests pass.

Setup truth exists in durable non-public docs for env, local setup/QA, Clerk/Convex, Stripe, Vercel, Cal.com, Telegram, and route/provider contracts.

Focused tests and repo static gates pass or blocked failures are recorded with exact reasons.

## Validation

Run focused validation first:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs docs/RELIABILITY.md docs/design-docs/scripts.md docs/internal
bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/blog-formatters.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-posts.test.ts
bun run --cwd apps/web format:check
bun lint
bun typecheck
git diff --check
```

Adjust the focused test list in the child ExecPlan if file names change during implementation.

## Source Packet

- `docs/programs/active/2026-05-16-public-docs-retirement/research-pass-public-docs-surface.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/normalized-pass-public-docs-retirement.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/converged-decision-packet.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/dependency-graph.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/plan-split-recommendation.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/cross-repo-review.md`

The child ExecPlan should record:

- `program_id: "public-docs-retirement"`
- `planning_brief: docs/programs/active/2026-05-16-public-docs-retirement/planning-brief-1.md`
