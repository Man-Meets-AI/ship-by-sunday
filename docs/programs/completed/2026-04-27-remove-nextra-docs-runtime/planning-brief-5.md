---
title: Remove Nextra Docs Runtime Planning Brief 5
program_id: remove-nextra-docs-runtime
brief_version: 5
status: current
summary: Carry forward completed package cleanup and steer the final public-surface release-hardening proof.
read_when:
  - Grilling or executing the final public docs/blog release-hardening slice.
  - Checking the final dependency state after Nextra package removal.
  - Validating public docs, blog, metadata, sitemap, and browser behavior.
---

# Remove Nextra Docs Runtime Planning Brief 5

## What Landed

The fourth child ExecPlan completed at `docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md`.

That slice removed the Nextra config wrapper from `apps/web/next.config.ts`, removed `nextra` and `nextra-theme-docs` from `apps/web/package.json` and `bun.lock`, added official direct MDX dependencies, and updated starter generation guidance to the hoisted `node_modules/next/dist/docs/` path.

`bun typecheck` passed after package cleanup and no longer emitted the previous Nextra shallow-clone warning.

## Updated Initiative Facts

All planned implementation slices before final hardening are complete:

- inventory and route model
- docs rendering replacement
- blog rendering replacement
- package/config/starter cleanup

The remaining work is final release-sensitive proof across docs, blog, metadata, sitemap, browser behavior, package state, and planning docs. This final slice should not introduce new rendering architecture unless validation finds a concrete regression.

## Remaining Risks

Direct MDX now compiles through `@next/mdx` and `remark-frontmatter`. Final proof should exercise both docs and blog routes in browser after a fresh dev server start.

The app package no longer depends on Nextra. Final proof should include clean import/package scans and `bun install --frozen-lockfile`.

The local browser environment still logs Clerk development-key/infinite-refresh warnings unrelated to public docs/blog rendering. Final proof should distinguish those local auth-environment warnings from docs/blog rendering regressions.

## Next Child ExecPlan

The next active child ExecPlan is `docs/exec-plans/active/2026-04-27-harden-public-docs-blog-release-proof.md`.

Before implementation, grill that plan against this planning brief and the completed package cleanup state. The grill should verify that it is proof-focused, not another migration slice, and that any fixes are limited to defects found during validation.

## Next Slice Validation

The final hardening slice should run focused docs and blog tests, metadata/sitemap tests, clean import and package scans, frozen install validation, browser smoke for `/docs`, `/docs/local-setup`, `/blog`, and `/blog/the-operating-system-beats-the-prompt`, `bun lint`, `bun typecheck`, planning validators, markdown lint, and `git diff --check`.
