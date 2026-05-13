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

This research pass is a historical snapshot of the repository facts behind the Worker IA migration before the public product split and protected route-group rename. Current live paid-app files are under `apps/web/app/(protected)/`; any `apps/web/app/(workspace)/` paths below describe the pre-rename repository state only.

## Current Surface Families

At the time of this research, the generated-codebase lane was the product area that would become `Generate Codebase` and `Tutorials`. Its main routes were `apps/web/app/(workspace)/codebase/page.tsx`, `apps/web/app/(workspace)/review/page.tsx`, `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and `apps/web/app/(workspace)/execute/page.tsx`. The route config source was `apps/web/config/product.ts`, where `routeConfig.codebase` was `/codebase` and `routeConfig.review` was `/review`.

At the time of this research, the existing-repo lane was the product area that would become `Worker`. Its main routes were under `apps/web/app/(workspace)/workspace/`: `choose`, `setup`, `doctor-pass`, `findings`, `loops`, `runs`, and `privacy`. The route config keys were `workspaceChoice`, `workspaceSetup`, `workspaceDoctorPass`, `workspaceFindings`, `workspaceLoops`, `workspaceRuns`, and `workspacePrivacy` in `apps/web/config/product.ts`.

There is no current `/tutorials` namespace. Tutorial/watch behavior is split between codebase-stage videos in `apps/web/lib/codebase-flow/codebase-stage-videos.ts` and post-review lessons under `/lesson/[lessonKey]`.

## Access And Data Model

Current access is not capability-based. The persisted access model uses one scalar lane, `fulfillmentTrack`, with values `generated_codebase`, `existing_codebase_doctor`, or `unspecified`. The checkout input and normalization live in `apps/web/platform/billing/checkout/checkout-intent.ts`. The Convex access grant model lives in `apps/web/convex/access/model.ts`.

At the time of this research, this scalar blocked traversal. Generated-codebase routes redirected existing-repo customers away, and worker routes redirected generated-codebase customers away. The hard route guards were in `apps/web/app/(workspace)/codebase/page.tsx`, `apps/web/app/(workspace)/review/page.tsx`, and the route files under `apps/web/app/(workspace)/workspace/`.

Convex guards are also mutually exclusive today. `requireGeneratedCodebaseProductAccess` and `requireExistingCodebaseProductAccess` in `apps/web/convex/access/model.ts` check the same scalar `fulfillmentTrack`. Generated-codebase data and worker data can coexist physically because they use separate tables, but the entitlement layer currently prevents one user from using both.

## Naming Blast Radius

The current `workspace` noun is overloaded. It appears as product copy, route namespace, App Router route group name, component/type prefix, Convex table and event names, local runner API paths, tests, docs, and generic monorepo workspace language. The migration must not blindly rename package-manager workspace references, Next route group names where they are purely structural, or Codex sandbox terms. Ship by Sunday-owned Worker concepts should be renamed to Worker.

The current `codebase` noun is also overloaded. It means the generation route and the generated customer artifact. The new product IA separates those concepts: `/generate-codebase` is the tool surface; the generated artifact can still be a Codebase unless a later product decision changes the delivered artifact name.

## Navigation Seams

At the time of this research, Command-K was implemented in `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx` and `app-shell-command-menu-items.tsx`. It grouped commands as Codebase stages, Lessons, Workspace, Theme, and Account. The narrow helper `workspaceMenuLinks` in `app-shell-user-menu-helpers.ts` returned links to `/codebase`, `/review`, and `/settings`.

At the time of this research, the shared shell was in `apps/web/app/(workspace)/_components/app-shell.tsx` and sibling files. Worker pages passed local nav only, while generated-codebase pages passed combined primary nav. A future top-level switcher should be separate from the surface-specific local nav.

## Research Conclusions

The implementation must start by widening access capabilities. Adding `/workers`, `/tutorials`, and `/generate-codebase` links before the access change would produce redirect loops.

The canonical route families should hard-switch to `/generate-codebase`, `/tutorials`, and `/workers`. Old product route families are migration targets, not supported aliases. The earlier additive compatibility recommendation was superseded by the product owner's hard-switch decision.

The naming decision from the product owner is direct: call it Worker everywhere, not Workspace and not Worker Space. Because runtime contracts exist, "everywhere" means the Program must include runtime identifier migration, API path migration, Convex event migration where feasible, local-runner migration, tests, and docs. It does not mean unsafe blind search-replace.
