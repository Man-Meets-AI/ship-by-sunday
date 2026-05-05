---
title: "Current IA And Access Research"
summary: "Research pass mapping the current generated-codebase, tutorial, and existing-repo worker surfaces before the Worker IA migration."
docType: "research_pass"
status: "active"
read_when:
  - "Planning the Worker, Tutorials, and Generate Codebase route migration."
  - "Checking why the current single fulfillment track blocks cross-surface navigation."
---

# Current IA And Access Research

This research pass records the current repository facts behind the Worker IA migration. It is a read-only synthesis of local repository inspection and three 5.5 high explorer passes.

## Current Surface Families

The current generated-codebase lane is the product area that will become `Generate Codebase` and `Tutorials`. Its main routes are `apps/web/app/(workspace)/codebase/page.tsx`, `apps/web/app/(workspace)/review/page.tsx`, `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and `apps/web/app/(workspace)/execute/page.tsx`. The route config source is `apps/web/config/product.ts`, where `routeConfig.codebase` is `/codebase` and `routeConfig.review` is `/review`.

The current existing-repo lane is the product area that will become `Worker`. Its main routes are under `apps/web/app/(workspace)/workspace/`: `choose`, `setup`, `doctor-pass`, `findings`, `loops`, `runs`, and `privacy`. The current route config keys are `workspaceChoice`, `workspaceSetup`, `workspaceDoctorPass`, `workspaceFindings`, `workspaceLoops`, `workspaceRuns`, and `workspacePrivacy` in `apps/web/config/product.ts`.

There is no current `/tutorials` namespace. Tutorial/watch behavior is split between codebase-stage videos in `apps/web/lib/codebase-flow/codebase-stage-videos.ts` and post-review lessons under `/lesson/[lessonKey]`.

## Access And Data Model

Current access is not capability-based. The persisted access model uses one scalar lane, `fulfillmentTrack`, with values `generated_codebase`, `existing_codebase_doctor`, or `unspecified`. The checkout input and normalization live in `apps/web/platform/billing/checkout/checkout-intent.ts`. The Convex access grant model lives in `apps/web/convex/access/model.ts`.

This scalar blocks traversal. Generated-codebase routes redirect existing-repo customers away, and current worker routes redirect generated-codebase customers away. The hard route guards are in `apps/web/app/(workspace)/codebase/page.tsx`, `apps/web/app/(workspace)/review/page.tsx`, and the route files under `apps/web/app/(workspace)/workspace/`.

Convex guards are also mutually exclusive today. `requireGeneratedCodebaseProductAccess` and `requireExistingCodebaseProductAccess` in `apps/web/convex/access/model.ts` check the same scalar `fulfillmentTrack`. Generated-codebase data and worker data can coexist physically because they use separate tables, but the entitlement layer currently prevents one user from using both.

## Naming Blast Radius

The current `workspace` noun is overloaded. It appears as product copy, route namespace, App Router route group name, component/type prefix, Convex table and event names, local runner API paths, tests, docs, and generic monorepo workspace language. The migration must not blindly rename package-manager workspace references, Next route group names where they are purely structural, or Codex sandbox terms. Ship by Sunday-owned Worker concepts should be renamed to Worker.

The current `codebase` noun is also overloaded. It means the generation route and the generated customer artifact. The new product IA separates those concepts: `/generate-codebase` is the tool surface; the generated artifact can still be a Codebase unless a later product decision changes the delivered artifact name.

## Navigation Seams

Command-K is implemented in `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx` and `app-shell-command-menu-items.tsx`. It currently groups commands as Codebase stages, Lessons, Workspace, Theme, and Account. The narrow helper `workspaceMenuLinks` in `app-shell-user-menu-helpers.ts` currently returns links to `/codebase`, `/review`, and `/settings`.

The shared shell is in `apps/web/app/(workspace)/_components/app-shell.tsx` and sibling files. Current Worker pages pass local nav only, while generated-codebase pages pass combined primary nav. A future top-level switcher should be separate from the surface-specific local nav.

## Research Conclusions

The implementation must start by widening access capabilities. Adding `/workers`, `/tutorials`, and `/generate-codebase` links before the access change would produce redirect loops.

The canonical route families should hard-switch to `/generate-codebase`, `/tutorials`, and `/workers`. Old product route families are migration targets, not supported aliases. The earlier additive compatibility recommendation was superseded by the product owner's hard-switch decision.

The naming decision from the product owner is direct: call it Worker everywhere, not Workspace and not Worker Space. Because runtime contracts exist, "everywhere" means the Program must include runtime identifier migration, API path migration, Convex event migration where feasible, local-runner migration, tests, and docs. It does not mean unsafe blind search-replace.
