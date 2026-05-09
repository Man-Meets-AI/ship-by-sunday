---
title: "Programs"
summary: "Landing lane for durable multi-slice initiative docs that sit above individual ExecPlans."
docType: "readme"
status: "active"
read_when:
  - "You need the first-hop docs surface for a multi-ExecPlan initiative."
  - "You are deciding whether work belongs in a Program doc or an ExecPlan."
---

# Programs

`docs/programs/` is the landing lane for durable initiatives that coordinate several ExecPlans. This file is intentionally a route map; the canonical Program contract lives in [PROGRAMS.md](PROGRAMS.md).

## Current State

Active:

- `docs/programs/active/2026-05-09-worker-install-compatibility-matrix/`: Worker Foundations install compatibility across practical repo shapes, package managers, dry-run safety, fresh-clone proof, and kickoff smoke.
- `docs/programs/active/2026-05-06-telegram-support-bot/`: first-party landing-page support chat, Convex support thread state, dedicated Telegram operator bot, and structured support actions.
- `docs/programs/active/2026-05-05-admin-user-impersonation/`: Clerk actor-token admin impersonation, Convex actor visibility, audit logging, support UI, and release proof.
- `docs/programs/active/2026-05-05-worker-generate-tutorials-ia/`: Generate Codebase, Tutorials, and Worker IA migration with capability-based access, canonical routes, navigation, copy, and runtime compatibility.

Recently completed:

- `docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/`: completed docs-spine adoption reset that added deterministic evals, source-truth scanner repair, contract-grade rendering, apply proof hardening, weak-output replacement, and live Arena CRM acceptance with quality score 100.
- `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/`: historical v1 deterministic local-runner docs-spine adoption Program. Its Arena CRM output is now treated as insufficient and superseded by `docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/`.
- `docs/programs/completed/2026-05-02-one-click-paid-access/`: completed one-click paid access Program that grants paid checkout access by purchase email, progressively offers Express Checkout over hosted Checkout fallback, and uses Clerk email OTP to prove the checkout email after guest payment.
- `docs/programs/completed/2026-05-02-customer-agentic-operating-system/`: completed customer agentic operating system Program that made generated repos, existing-codebase doctor passes, local runner workflows, broken-app rescue, mature-repo adoption, managed GitHub consent, and future update-channel contracts part of one durable operating layer.
- `docs/programs/completed/2026-05-04-codebase-language-migration/`: completed direct Codebase language migration across public language, Program packets, package surfaces, generated output, and validation metadata.
- `docs/programs/completed/2026-05-03-ui-design-system-alignment/`: completed app UI design-system alignment around screenshot-grounded color, typography, spacing, control, and visual proof rules.
- `docs/programs/completed/2026-05-02-posthog-observability-migration/`: completed PostHog observability migration Program that moved generic analytics, errors, source maps, masked replay defaults, and draft-only Linear triage to PostHog-owned paths while narrowing Convex to provider-specific/runtime-intake duties.
- `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`: completed generated customer-repo autonomy Program that made downloaded repos executable by fresh coding agents without chat history.
- `docs/programs/completed/2026-04-26-app-structure-refactor/`: completed refactor Program that reduced and disciplined the Ship by Sunday app structure across App Router routes, Convex, Stripe, shared UI, platform boundaries, and durable product domains.

Active Program folders belong under `docs/programs/active/<YYYY-MM-DD-program-id>/`. Completed Program packets live under `docs/programs/completed/`.

Use a Program only when an initiative spans several ExecPlans and needs durable initiative-level truth. Use an ExecPlan for one bounded implementation, validation, and review slice.

## Canonical Files

- Contract: [PROGRAMS.md](PROGRAMS.md)
- Active inventory: [active/index.md](active/index.md)
- Completed inventory: [completed/index.md](completed/index.md)
- Prompt assets: [docs/prompts/README.md](../prompts/README.md)
- ExecPlan inventory: [docs/exec-plans/index.md](../exec-plans/index.md)

## Program Loop

When a Program is active, the loop is:

1. Read `program.md`.
2. Resolve `current-planning-brief.txt` to the current versioned planning brief.
3. Write, grill, execute, and validate one child ExecPlan.
4. Sync durable docs that changed.
5. Write the next versioned planning brief and update the Program.
6. Repeat until `PROGRAMS.md` allows the Program to move to `completed/`.

Program-linked child ExecPlans must record the exact immutable planning brief path in their frontmatter. Do not point child ExecPlans at `current-planning-brief.txt`.

## Prompt Inventory

Program prompt assets live under `docs/prompts/` and are indexed in [docs/prompts/README.md](../prompts/README.md). The Program prompt inventory is:

- `docs/prompts/program-orchestrator.md`
- `docs/prompts/program-initialize.md`
- `docs/prompts/program-funnel.md`
- `docs/prompts/program-research-passes.md`
- `docs/prompts/program-normalize-pass.md`
- `docs/prompts/program-converged-decision-packet.md`
- `docs/prompts/program-dependency-graph.md`
- `docs/prompts/program-plan-split-recommendation.md`
- `docs/prompts/program-cross-repo-review.md`
- `docs/prompts/program-planning-brief.md`
- `docs/prompts/program-doc-synthesis.md`
- `docs/prompts/program-loop.md`
- `docs/prompts/program-docs-sync.md`
- `docs/prompts/program-planning-refresh.md`
- `docs/prompts/program-completion-review.md`

## Validation

Use these proof surfaces for Program docs:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs docs/prompts
```
