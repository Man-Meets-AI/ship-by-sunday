---
title: 'Cross Repo Review Feature Folder Surface'
summary: 'Review of the feature-folder reduction direction against the current repo constraints.'
docType: 'review'
status: 'active'
read_when:
  - 'Checking whether this initiative should delete every feature folder at once.'
  - 'Reviewing risk boundaries before implementation.'
---

# Cross Repo Review Feature Folder Surface

The current repo already moved many route wrappers into private App Router folders. The remaining `features` tree is not one kind of code. Some folders are route-local UI, some are shared helpers, some are server adapters, and some are durable product domains.

The safe pattern is to remove one ownership mistake at a time. Generic hooks should not live under `features/shared`. App Router sitemap support should not live under `features/public-metadata`. Those moves are low risk and can be proved with focused tests.

The unsafe pattern is to rename or delete all feature folders in one PR. That would mix route behavior, Convex-safe imports, checkout, billing, observability, and course state. The initiative can still remove feature-folder surface aggressively, but it needs bounded child slices with import scans and focused validation.
