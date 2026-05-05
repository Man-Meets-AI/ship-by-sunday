---
program_id: worker-generate-tutorials-ia
title: Worker Generate Tutorials IA Migration
status: active
created_at: 2026-05-05
completed_at: null
summary: Hard-switch the protected product IA to Generate Codebase, Tutorials, and Worker across routes, access, navigation, docs, tests, and owned runtime contracts.
post_build_recap: null
read_when:
  - Resuming the Worker, Tutorials, and Generate Codebase IA migration.
  - Removing workspace-named product or runtime surfaces.
  - Creating child ExecPlans for the hard-switch route, access, navigation, copy, or runtime contract slices.
---

# Worker Generate Tutorials IA Migration

This Program is a living initiative document for the hard-switch migration from the current workspace/codebase IA to Generate Codebase, Tutorials, and Worker.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Customers should be able to move between three clear product surfaces: Generate Codebase for creating a new Codebase, Tutorials for watching and learning, and Worker for operating on an existing repo. Today the app stores one `fulfillmentTrack` per customer and uses that scalar to block the opposite surface, so an existing-repo customer cannot naturally open generated-codebase tutorial material and a generated-codebase customer cannot naturally open the existing-repo worker surface. This Program makes a hard cut to the new IA: routes, access model, navigation, docs, tests, and Ship by Sunday-owned runtime contracts must teach Generate Codebase, Tutorials, and Worker, not Workspace.

## Program Inputs

The current repository research is recorded in `research-pass-current-ia-and-access.md`. The normalized naming and access direction is recorded in `normalized-pass-worker-generate-tutorials-naming.md`. The initiative decision is recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The current generated-codebase route family is `/codebase`, `/review`, `/lesson/*`, and `/execute`. The current existing-repo route family is `/workspace/*`. Checkout and Convex access use one scalar `fulfillmentTrack`, with `generated_codebase`, `existing_codebase_doctor`, or `unspecified`. The app route guards, Convex guards, checkout success routing, Command-K, and docs all assume that scalar lane model.

The desired end state is `/generate-codebase`, `/tutorials`, and `/workers`, with `Worker` as the product noun everywhere Ship by Sunday means the existing-repo operation surface. Old workspace-named product routes and Ship by Sunday-owned worker runtime contracts are migration targets, not compatibility surfaces.

## Progress

- [x] 2026-05-05: Completed read-only research with three 5.5 high explorer passes covering naming/routes, navigation/Command-K, and access/data implications.
- [x] 2026-05-05: Recorded the product decision that the existing-repo operation surface is `Worker`, not `Workspace` or `Worker Space`, and that canonical routes are `/workers`, `/tutorials`, and `/generate-codebase`.
- [x] 2026-05-05: Created this active Program packet and the first implementation planning brief.
- [x] 2026-05-05: Reframed the Program from compatibility rollout to hard switch.
- [ ] Create the first child ExecPlan from `planning-brief-1.md`.
- [ ] Hard-switch access, route families, route guards, resume destinations, top-level navigation, and visible app copy.
- [ ] Hard-switch Worker runtime contracts that are Ship by Sunday-owned.
- [ ] Migrate docs, tests, release proof, and generated customer-facing instructions.
- [ ] Run scans proving workspace-named product and owned runtime surfaces are gone or explicitly classified as unrelated external/tooling language.

## Decision Log

Decision: Use `Worker` as the product noun.
Rationale: The product owner explicitly rejected `Workspace` and `Worker Space` and asked to make the naming right everywhere.
Date: 2026-05-05.

Decision: Use `/workers`, `/tutorials`, and `/generate-codebase` as canonical routes.
Rationale: These route families are direct and map to the three customer jobs.
Date: 2026-05-05.

Decision: Start with access capability widening.
Rationale: The current scalar `fulfillmentTrack` creates redirect loops if navigation and routes are added first.
Date: 2026-05-05.

Decision: Do a hard switch instead of a compatibility rollout.
Rationale: The product owner explicitly rejected a gentle compatibility path. Old names should not remain as product-supported aliases; they should be removed or rewritten unless a reference is unrelated external/tooling language.
Date: 2026-05-05.

## Slice Ledger

No child ExecPlan exists yet. The first planned child ExecPlan should be created from `planning-brief-1.md` and should be named `Hard Switch Product IA To Generate Codebase Tutorials And Worker`.

The intended later slices are Worker runtime contract hard switch, docs and generated-output hard switch, and final scan/proof cleanup. These slices should not preserve old workspace or route names as supported aliases.

## Next Slice

The next slice is the product IA cutover. It must split paid access from surface capability, replace the old product route families with `/generate-codebase`, `/tutorials`, and `/workers`, update route guards and resume destinations, and update the shared header and Command-K so the first customer-visible state is coherent.

## Risks and Watchpoints

Do not do a blind rename of `workspace`. The word appears in product language, route groups, API paths, Convex tables, local-runner events, monorepo package manager language, and Codex sandbox terminology. Each use must be classified as Ship by Sunday-owned Worker language or unrelated external/tooling language. Ship by Sunday-owned Worker language must move to Worker.

Do not leave `fulfillmentTrack` as the only authorization boundary. That would make the new navigation lie to customers.

Do not rename the generated Codebase artifact as part of this Program unless the product owner explicitly requests that artifact rename. The route `/generate-codebase` names the tool, not necessarily the delivered artifact.

Do not keep old `/workspace/*`, `/codebase`, `/review`, `/lesson/*`, or `/api/workspace/runner/*` as supported product aliases. If a route or API path must survive briefly during a single deploy for internal sequencing, the owning ExecPlan must call it transitional and remove it inside the same hard-switch milestone.

## Outcomes & Retrospective

This Program is active. The expected outcome is a product where the app, docs, routes, navigation, tests, and owned runtime contracts teach Generate Codebase, Tutorials, and Worker as the current IA, and old workspace/codebase route language is absent except where a scan classifies it as unrelated external/tooling language or immutable historical evidence.

## Validation and Acceptance

Program-level acceptance requires a paid customer with the right capabilities to open `/generate-codebase`, `/tutorials`, and `/workers` without redirect loops. Command-K and the header must expose the three surfaces. Product-facing copy and docs must use Worker where the product means existing-repo operations. Old `/workspace/*`, `/codebase`, `/review`, and `/lesson/*` product routes must not remain documented or supported aliases. Runtime migration must prove Ship by Sunday-owned worker APIs, events, local-runner commands, tests, and proof docs no longer expose workspace naming.

## Artifacts and Notes

The initial research found that the existing generated-codebase and worker data stores can coexist, but entitlement cannot yet represent dual access. That is why the first planning brief starts at access rather than route copy.

## Interfaces and Dependencies

This Program depends on `apps/web/config/product.ts`, the App Router files under `apps/web/app/(workspace)/`, access code under `apps/web/convex/access/`, checkout code under `apps/web/platform/billing/checkout/`, product access code under `apps/web/platform/access/`, Command-K and shell components under `apps/web/app/(workspace)/_components/app-shell/`, worker route models under `apps/web/app/(workspace)/_lib/`, Convex worker code under `apps/web/convex/workspace/`, local runner code under `packages/local-runner/`, route and UI tests under `apps/web/tests/`, and the docs under `apps/web/content/docs/`, `docs/internal/`, and `docs/programs/`.
