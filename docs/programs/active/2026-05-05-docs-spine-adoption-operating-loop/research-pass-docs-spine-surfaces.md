---
title: Docs Spine Surfaces Research Pass
summary: Research inventory for turning Ship by Sunday and Worker docs-spine practice into a repeatable mature-repo workflow.
docType: program_research
status: active
read_when:
  - Checking which surfaces docs-spine adoption must inspect or install.
  - Updating the docs-spine adoption workflow bundle.
---

# Docs Spine Surfaces Research Pass

## Question

Which checked-in surfaces make the Ship by Sunday and Worker docs spine reliable enough for repeatable agent work, and which of those surfaces should become part of a mature-repo adoption workflow?

## Findings

The docs spine is larger than a set of Markdown landing pages. In Ship by Sunday and Worker, the spine starts at root instructions and `docs/index.md`, then routes agents into cross-cutting doctrine, Program packets, ExecPlans, prompt assets, markdown metadata linting, proof commands, and quality-debt tracking.

The first-hop docs are stable and repo-wide. The recurring files are `docs/index.md`, `docs/ARCHITECTURE.md`, `docs/RELIABILITY.md`, `docs/SECURITY.md`, `docs/FRONTEND.md`, `docs/DESIGN.md`, `docs/PRODUCT_SENSE.md`, `docs/QUALITY_SCORE.md`, and `docs/PLANS.md`. They are useful because they keep root `AGENTS.md` small and route specialized rules into the nearest owning surface.

The planning layer is two-tiered. Programs live under `docs/programs/` and preserve initiative-level truth across several child ExecPlans. ExecPlans live under `docs/exec-plans/` and preserve execution-level truth for one bounded slice. Both systems have contracts, active and completed indexes, and lint commands.

Worker also carries subtree instruction files for the planning lanes: `docs/exec-plans/AGENTS.md`, `docs/programs/AGENTS.md`, and `docs/prompts/AGENTS.md`. Ship by Sunday does not currently mirror all of those, but mature-repo adoption should scan for and install lane-local instruction files when they are useful. Otherwise the workflow can create top-level contracts while leaving agents without nearest-scope rules for maintaining those contracts.

The Program packet model is part of the product, not optional ceremony. A durable Program packet includes research passes, normalized passes, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, immutable `planning-brief-<N>.md` files, `current-planning-brief.txt`, and `program.md`.

Prompt assets are part of the spine because they turn the operating model into repeatable loops. The reusable prompt families include Program funnel prompts, Program loop prompts, and ExecPlan writer, grill, execute, and validate prompts.

Proof is also part of the spine. Ship by Sunday uses `markdown:lint`, `plans:lint`, `programs:lint`, `public-readiness:lint`, release proof commands, and repo-level gates. Worker uses a similar model with docs validation, markdown lint, plan lint, Program lint, and `proof:ci`. Mature repos need the workflow to discover their native proof command map rather than assuming Ship by Sunday commands.

The validation spine includes more than command names. Worker's docs-spine plan added a structural docs validator, markdown-family resolver updates, root entrypoint checks, required section checks for first-class docs, route checks for `docs/PLANS.md`, and stale-path searches for retired planning locations. Mature-repo adoption needs equivalent checks adapted to the target repo rather than only generating Markdown files.

`QUALITY_SCORE.md` should not be copied as a fake score. Worker has a populated score table because it has a scoring pass. Ship by Sunday currently has a lighter landing contract. Mature repos should first receive a quality-score landing surface and a later quality-score audit loop should populate scored tables only after actual scanner evidence exists.

Worker and Ship by Sunday differ on some first-class lanes. Worker has `docs/specs/` and `docs/references/`; Ship by Sunday has `docs/product-specs/`, `docs/generated/`, and source/generated mirror rules. The adoption workflow should model these as adaptable lane families: specs or product specs, references, generated output, design docs, internal docs, root `DESIGN.md`, and docs-local `DESIGN.md`. It should preserve existing names when a mature repo already has a clear convention.

Generated-repo operating pack validation surfaced another required checklist: every generated or installed skill trigger must resolve to a shipped local skill or to an explicit external manifest entry. Mature-repo adoption should scan `.agents/skills/`, `.codex/skills/`, and equivalent repo-local skill folders before writing prompts or onboarding text that reference skills.

Arena CRM is a representative mature repo. It is a Bun and Turbo monorepo. Its canonical instruction file is `.codex/AGENTS.md`; root `AGENTS.md` is a shim. Its repo-wide completion gate is `bun run gate`. It already has many docs and handoff files, so adoption should route and normalize existing truth rather than replacing it with generated-starter assumptions.

## Recommended Direction

Create a new `docs-spine-adoption` local-runner workflow after the existing `mature-repo-adoption` audit. The current mature-repo workflow writes `.sbs` audit and draft artifacts only. The new workflow should apply an approved docs-spine operating pack to the customer repo on a local branch.

The workflow should use deterministic scanners first, then bounded Codex synthesis. Scanners produce normalized JSON facts. Codex generates evidence-backed drafts from those facts. The workflow controller validates schemas, target paths, evidence refs, frontmatter, and proof commands before applying files.

Version 1 should stay Bun and TypeScript inside `packages/local-runner` because existing workflow approval, runner API, Convex, and tests are TypeScript-owned. Every scanner phase should write JSON artifacts with stable schemas so a Go binary can replace any hot path later if performance proves Bun insufficient.

## Watchpoints

Do not let subagents mutate the repo directly. Parallel agents may research, draft, or review. The deterministic workflow owns phase order, allowed file writes, schema validation, patch application, proof status, and sync metadata.

Do not assume Bun, Next.js, Convex, Stripe, Clerk, Vercel, Linear, or Ship by Sunday package scripts for mature repos. Detect them and state missing facts as blocked proof.

Do not invent a quality score. Install the score contract first and fill scored tables only after a real quality-score audit.
