# Plan Split Recommendation

## Recommended Child ExecPlans

### 1. Make App Structure Boundaries Explicit

This is the first child plan. It should make the existing structure safer before
any physical moves: import visibility, server-only guards, shared assert utility
extraction, and baseline inventories. It should not move routes, rename feature
folders, touch Convex schema, or touch billing behavior.

### 2. Extract The Workspace Shell From Course

Move the shared `AppShell` surface out of `features/course/shared` into a neutral
workspace shell home. Keep compatibility exports during migration. Split shell
responsibilities enough that course lesson state is not required for generic
workspace layout.

### 3. Make Route Ownership Visible

Move route-owned wrappers, guards, and small route-specific helpers into private
folders under the relevant App Router segment. Start with review route control,
checkout success wrappers, identity wrappers, access-required wrappers, and API
request-contract visibility.

### 4. Clean Shared UI And Hooks

Keep active shadcn-style primitives in `components/ui`, move marketing-only
effects into marketing, remove or localize unused shared hooks, and prune unused
registry components only after import scans and build proof.

### 5. Split Course Domain From Workbench And Convex-Safe Logic

Reduce `features/course` to its real course and lesson domain. Split backend-safe
lesson registry logic away from UI/workbench completion copy and dynamic
renderer concerns. Keep Convex imports on backend-safe modules.

### 6. Make Billing And Stripe Boundaries Auditable

Deduplicate checkout session interpretation, clarify app route versus
`platform/billing` versus Convex billing responsibilities, and keep the Convex
webhook contract as the only Stripe webhook endpoint. Treat this as
release-sensitive.

### 7. Final Features Reduction And Docs Sync

Remove compatibility exports, delete or rename empty feature folders, update
architecture docs, and make sure `features/` now contains only durable product
domains.

## Why This Split

The split follows the actual dependency graph. Early folder moves would touch
high-fan-in imports and increase risk without improving behavior. The first
slice makes the current structure observable and safer, then each later slice
moves one real boundary.

## Recommended First Active Plan

Create `docs/exec-plans/active/2026-04-26-make-app-structure-boundaries-explicit.md`
from `planning-brief-1.md`.
