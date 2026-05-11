---
title: Shipping Evidence Hardening Cross-Repo Review
summary: Cross-surface review of the internal repo, release workflows, provider proof, and generated customer repo contracts.
docType: review
status: active
read_when:
  - Checking which repo surfaces the Program touches.
  - Avoiding accidental scope expansion while hardening evidence.
---

# Shipping Evidence Hardening Cross-Repo Review

The internal app surface is `apps/web`. Its tests and proof paths are already broad, but CI does not run every local gate the app exposes. Billing and Convex changes should continue to follow `apps/web/AGENTS.md`, Convex AI guidelines, and `docs/release-workflow.md`.

The release surface is `.github/workflows/` plus `scripts/release/`. It should remain the only durable release proof machinery. New proof formats should not be invented in skill folders or PR comments.

The provider surface includes GitHub Actions, Vercel, Convex, Stripe, Clerk, PostHog, and Telegram where relevant. The Program should document any new external setup in active docs when a slice creates new provider requirements.

The generated customer repo surface is `packages/codebase-compiler`. It should not leak internal release docs into customer snapshots, but it must not ship fake or unrunnable validation commands.

The local runner package is affected because package tests and smoke scripts are outside CI today. Any source-gate slice should include it without overwriting unrelated active work in `packages/local-runner`.
