---
title: "Public Docs Retirement Plan Split Recommendation"
summary: "Recommended child ExecPlan split for retiring the public docs surface."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Creating child ExecPlans under the public docs retirement Program."
  - "Deciding whether docs removal should be one slice or several."
---

# Public Docs Retirement Plan Split Recommendation

## Recommended Split

1. Public docs runtime retirement and setup-truth preservation.
2. Source-truth sync and closeout if the first slice leaves active Program, release, or generated-output references intentionally deferred.

## First Slice

The first child ExecPlan should be `Retire Public Docs Runtime And Preserve Setup Truth`.

It should:

- Move essential setup truth to durable non-public docs.
- Delete `apps/web/src/content/docs/`.
- Delete `apps/web/src/app/(marketing)/docs/`.
- Remove docs imports, route config, loaders, navigation builders, metadata helpers, disabled-state UI, theme preference code, and docs CSS.
- Delete or rewrite docs-specific tests and shared public-content tests.
- Keep `apps/web/src/content/blog/` intact.
- Make `/docs` behavior explicit through absence, 404, or redirect tests.
- Update active Program, ExecPlan, release, reliability, and markdown tooling docs that would otherwise point at deleted public MDX.

It should not:

- Touch blog MDX except for required shared metadata/import updates.
- Add a replacement public docs route.
- Implement Telegram widget UI.
- Implement Starter preview work.
- Rewrite checkout, entitlement, or generated-template behavior.

## Possible Second Slice

Use a second child ExecPlan only if cleanup must be split for risk or review size. The second slice would handle stale docs references outside the app runtime, Program closeout, and broader validation after the hard cut lands.

## Why This Split

The core implementation crosses app routing, content loading, metadata, tests, docs tooling, and setup truth. That is enough for one focused but complete child ExecPlan. A second slice should exist only if the first PR needs to stay narrower.

## Child ExecPlan Requirements

Every child ExecPlan should include:

- `program_id: "public-docs-retirement"` in frontmatter.
- `planning_brief` pointing at the exact versioned planning brief used.
- A risk classification.
- A setup-truth preservation checklist.
- Focused blog/docs route validation.
- Repo static validation and `git diff --check`.
