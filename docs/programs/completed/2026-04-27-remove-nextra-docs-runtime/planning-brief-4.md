---
title: Remove Nextra Docs Runtime Planning Brief 4
program_id: remove-nextra-docs-runtime
brief_version: 4
status: superseded
summary: Carry forward the completed docs and blog rendering replacements and steer the package/config/starter cleanup slice.
read_when:
  - Grilling or executing the Nextra config, package, and starter cleanup slice.
  - Checking whether runtime imports are gone before dependency removal.
  - Validating that cleanup does not change public docs or blog URLs.
---

# Remove Nextra Docs Runtime Planning Brief 4

## What Landed

The third child ExecPlan completed at `docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md`.

That slice added `apps/web/app/blog/_server/blog-content.ts` as the direct blog MDX loader, moved `apps/web/app/blog/_server/blog-posts.ts` to inventory-backed summaries and article records, replaced `apps/web/app/blog/_lib/blog-toc.ts` Nextra `Heading` usage with `PublicContentHeading`, and added focused blog loading tests.

It also applied a syntax-only MDX correction in `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` so direct MDX rendering does not produce invalid nested paragraph HTML inside `BlogSplitSection` children. Article copy did not change.

## Updated Initiative Facts

Runtime app imports from Nextra are now gone except for cleanup surfaces. The remaining matches are expected until the next slice:

- `apps/web/next.config.ts` imports and applies `nextra`.
- `apps/web/package.json` declares `nextra` and `nextra-theme-docs`.
- `bun.lock` still contains the corresponding dependency graph.

Docs and blog rendering now use app-owned direct MDX loaders and the shared inventory. Package cleanup is unblocked, but it must still verify starter assumptions before removing files or dependency hooks.

## Remaining Risks

The cleanup slice must not remove dependencies until the import scan proves no runtime imports remain outside `apps/web/next.config.ts`, package metadata, and lockfile entries.

Removing the Nextra wrapper from `apps/web/next.config.ts` may expose whether the app needs an explicit Next MDX plugin such as `@next/mdx` or whether the current toolchain still compiles direct `.mdx` imports without it. The slice should choose the smallest durable config that keeps docs and blog MDX compiling.

Starter repository generation references docs content layout and may mention `apps/web/mdx-components.tsx` or local Next docs assumptions. The cleanup slice should update starter assumptions only where source-generation contracts require it, without changing compiler schema or facts.

## Next Child ExecPlan

The next active child ExecPlan is `docs/exec-plans/active/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md`.

Before implementation, grill that plan against this planning brief and the completed docs/blog rendering state. The grill should verify import scans, package/config order, lockfile validation, and starter-snapshot boundaries.

## Next Slice Validation

The package/config cleanup slice should prove that Nextra imports are gone from runtime code before dependency removal and gone from package/config files after dependency removal. It should include docs and blog focused tests, metadata/sitemap tests, lint, typecheck, and package/lockfile validation.

It must also run the required planning validation after any plan edits:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md
