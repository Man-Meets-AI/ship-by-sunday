---
summary: Add a compiled starter onboarding guide plus a stable repo-local skill layer so a buyer lands with project-specific guidance, customer actions, agent prompts, and a one-command path to install the vetted external skills for Clerk, Convex, and Stripe after download.
read_when: Open this plan when implementing the generated checklist, starter-local skills, and starter-side external skill installer that should ship inside every compiled starter repo beside the existing bootstrap and docs surfaces.
plan_status: done
---

# Add A Starter Project Onboarding Checklist

This document is a living execution plan for adding a compiled onboarding checklist to the starter repo so a buyer and their coding agent can move from a fresh blueprint to real project work without guessing.

This ExecPlan follows `.plans/PLANS.md` and must be maintained in accordance with it.

## Purpose / Big Picture

Today the compiled starter gives buyers a generated `README.md`, `DESIGN.md`, a docs surface, and now an in-progress root bootstrap script, but it still does not tell them in one place what to do after the repo lands on disk. It also does not yet give them a project-local skill layer that explains how Codex should work inside this starter beyond the repo-wide `AGENTS.md` rules. The new feature should add one clear guide that explains the real order of work in a single prescribed sequence: understand the blueprint, boot the repo, install the Codex skills, run core setup, run auth setup, run billing setup, verify the fragile auth and billing seams, and only then start shaping the product. After this change, a novice should be able to open the compiled starter, find one guide immediately, and follow it step by step whether they are working alone or with Codex. The change works when the compiled snapshot contains a visible onboarding guide, links to it from the existing entry points, ships stable repo-local wrapper skills for the starter’s most important workflows, and includes a one-command installer for the vetted external skills you want customers to add after download.

## Progress

- [x] 2026-04-07 16:11 EDT — Read `.plans/PLANS.md`, the current starter bootstrap renderer in `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts`, the current compiled README override in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`, the current docs entry pages in `apps/web/content/docs/index.mdx` and `apps/web/content/docs/local-setup.mdx`, and the repo tracker in `todo.md`.
- [x] 2026-04-07 16:11 EDT — Gathered research from three independent subagent passes covering repo-local onboarding gaps, failure modes, and current official tooling behavior for Bun, shadcn, Clerk, Convex, and Stripe.
- [x] 2026-04-07 16:18 EDT — Grilled the plan against `docs/prompts/execplan-grill.md`, inspected the real snapshot contract files, and resolved the highest-impact ambiguities from the repo without asking the user.
- [x] 2026-04-08 00:00 EDT — Researched the official Codex skills and plugin model, the local Next.js and Convex version-coupled guidance paths, the existing starter product config references to `openai/skills`, and the practical separation between bundled repo-local skills and post-download external-skill installation.
- [x] 2026-04-08 15:22 EDT — Implemented the generated onboarding renderer in `packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts` and wired it into the starter snapshot as `START-HERE.md` plus the generated docs override at `apps/web/content/docs/index.mdx`.
- [x] 2026-04-08 15:22 EDT — Implemented the generated starter-local skill layer in `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts`, including wrapper skills under `.agents/skills`, the external skill manifest, and `scripts/install-codex-skills.sh`.
- [x] 2026-04-08 15:22 EDT — Wired the generated entry points in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts` and `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts` so buyers are pointed to `START-HERE.md` and `bun run codex:skills:install`.
- [x] 2026-04-08 15:22 EDT — Extended `packages/blueprint-compiler/tests/repo-generation.test.ts` and `packages/blueprint-compiler/tests/review-download-zip.test.ts` to cover `START-HERE.md`, the docs index override, the wrapper skills, the external skill manifest, and the generated install script.
- [x] 2026-04-08 15:23 EDT — Ran the required package-level and root-level validation commands and confirmed the generated external skill installer script passes `bash -n`.

## Surprises & Discoveries

The existing starter already has a public docs page named `apps/web/content/docs/index.mdx` whose title is “Start Here,” and that page already describes the fastest path through local setup, auth, payments, QA, and product work. That means the new onboarding feature should not invent a parallel story that disagrees with the docs page. Instead, the implementation should make that high-level journey clearer, more explicit about agent usage, and easier to find from the root of the compiled repo.

The current `apps/web/content/docs/local-setup.mdx` already states that the local setup order is Clerk, then Convex, then Stripe. The subagent review agreed that the guide should preserve that sequence. The pain point is not “how do I open provider dashboards”; it is “how do I keep local env values, hosted Convex development, Clerk, and Stripe aligned so the starter actually works.”

The current bootstrap work in `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts` is useful, but it is not the same thing as the onboarding guide the user asked for. The bootstrap is a command-line helper. The requested guide is a durable artifact in the compiled starter that explains the full journey from blueprint to project work, including which Codex skills to use in each phase. The implementation must keep those two surfaces aligned without forcing the shell script to become a giant wall of prose.

The subagent tooling pass also confirmed that the shadcn preset step is less trivial than it looks. The downloaded starter should prefer `apply --preset` against an existing project, and that step depends on `npx` or equivalent Node tooling in practice. The onboarding guide should therefore explain that the preset step is optional and should not block the rest of the journey.

The snapshot contract in `packages/blueprint-compiler/src/repo-generation/repo-download-source-contract.ts` already includes all of `apps/web/content`, and `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` already merges override files cleanly on top of included directories. That means a generated override for `apps/web/content/docs/index.mdx` is a better fit than introducing a second onboarding page plus navigation work. The docs surface already has the right route and title.

Official Codex documentation draws a clean line between skills as the authoring format and plugins as the installable distribution unit. Repo-local skills belong in `.agents/skills`, while external reusable skills should be installed after download rather than baked into a static starter zip. This matters because “latest skill” and “latest framework guidance” are different problems. The Next.js and Convex guidance the starter needs should stay local and version-coupled to the installed repo, specifically `apps/web/node_modules/next/dist/docs/` and `apps/web/convex/_generated/ai/guidelines.md`, instead of pointing buyers at drifting live docs.

The user supplied stable external install commands for the first customer-facing skill pack. That changes the safest external-skill contract: the starter can ship exact install commands instead of trying to derive repo identifiers from marketplace names. The first external pack should therefore cover the customer-relevant stable installs you explicitly trust:

    npx skills add get-convex/agent-skills --all
    npx skills add clerk/skills
    npx skills add https://github.com/stripe/ai --skill stripe-best-practices

The plan should treat those commands as pinned starter metadata, not as values to rediscover during implementation.

The external repos also exposed real trigger names that are customer-usable today. Clerk’s README documents `$clerk` and `$clerk-nextjs-patterns`, Convex’s README documents skills such as `$convex-quickstart` and `$convex-setup-auth`, and Stripe’s skill tree exposes `stripe-best-practices`. That let the generated onboarding copy use real examples instead of placeholder trigger names for external skills.

## Decision Log

Decision: The onboarding feature will be implemented as compiled starter artifacts, not as hand-maintained docs copied manually into the generated repo.

Rationale: The user explicitly asked for this to become part of the starter repo that the compiler emits. Keeping the guide in `packages/blueprint-compiler` means every compiled starter receives the same onboarding contract and tests can enforce its presence.

Date: 2026-04-07

Decision: The feature will use one content model that renders both a root Markdown guide and a docs-surface MDX page.

Rationale: Buyers discover starter repos in two different ways. Some open the root files in an editor before ever running the app. Others boot the app and rely on `/docs`. Two separately written guides would drift. One content model with two renderers avoids that drift while still matching the formatting needs of root Markdown and docs MDX.

Date: 2026-04-07

Decision: The guide will include explicit “customer action,” “agent prompt,” and “skills to use” blocks for each phase.

Rationale: The user wants the checklist to serve both the customer and the agent. A plain setup doc is insufficient because it does not tell the buyer how to steer Codex or which skills matter in a given phase. The guide needs to be bilingual: human action plus agent delegation.

Date: 2026-04-07

Decision: The guide will be advisory and sequencing-focused, not an account-provisioning wizard.

Rationale: The repo already contains fragile but trustworthy doctor scripts for auth and billing. The subagent review found that trying to provision providers from shell would increase support burden and blur the line between local boot and production setup. The guide should direct users into the right sequence and verification steps instead.

Date: 2026-04-07

Decision: The initial guide will use a static curated skill map taken from the current repo skill inventory rather than deriving skills from blueprint facts.

Rationale: The necessary skill mapping follows repo subsystems rather than customer-entered product facts. For example, auth work uses `clerk`, data work uses `convex`, billing work uses `stripe-best-practices`, UI work uses `frontend-design` and `shadcn`, QA work uses `qa-team` and `testing-practices`, and docs sync uses `docs`. Making that mapping static keeps the guide deterministic and testable.

Date: 2026-04-07

Decision: The exact generated root onboarding file will be `START-HERE.md`, and the docs-surface onboarding experience will be an override of `apps/web/content/docs/index.mdx` rather than a brand-new docs page.

Rationale: The repo already presents `/docs` as “Start Here,” so replacing or extending `apps/web/content/docs/index.mdx` avoids navigation drift and keeps the docs entry path stable. A root file named `START-HERE.md` is more discoverable than a long descriptive filename and mirrors the same intent for buyers opening the repo in an editor before they ever run the app.

Date: 2026-04-07

Decision: The guide will not change `apps/web/content/docs/_meta.ts` in the first implementation pass.

Rationale: Because the docs onboarding content will live at the existing docs index path, no new navigation entry is required. This keeps the change smaller and avoids a second place where naming or ordering could drift.

Date: 2026-04-07

Decision: The onboarding guide will explicitly define three setup lanes inside the content: `core`, `auth`, and `billing`.

Rationale: The implementation still needs internal structure for the core setup work, the auth work, and the billing work. Those distinctions belong in the content model and wrapper skills so the generated guide and scripts stay organized.

Date: 2026-04-07

Decision: Buyers will not be asked to choose a lane. The customer-facing guide will prescribe one default order: bootstrap, install skills, core setup, auth setup, billing setup, verification, then product work.

Rationale: “Pick your lane” adds unnecessary cognitive load at the exact moment the repo should feel most obvious. The guide can still explain that some later steps may be deferred, but the customer should be told the path rather than asked to design it.

Date: 2026-04-08

Decision: The starter will ship repo-local wrapper skills in `.agents/skills` for starter-specific workflows, and those shipped skills are part of this plan’s scope.

Rationale: Official Codex docs support repo-specific skills in `.agents/skills`, and that is the safest way to land project-relevant behavior with the starter itself. These wrapper skills can point Codex to the starter’s local setup docs, local Next.js docs, and local Convex guidelines without depending on an external marketplace being available on day one.

Date: 2026-04-08

Decision: The starter will not auto-bundle “latest” external skills into the compiled snapshot. Instead, it will ship a manifest of exact vetted install commands plus guidance for post-download installation.

Rationale: The starter zip is static, so “latest external skill” must be a post-download install or update action. Official Codex docs recommend repo-local skills for project workflows and plugins for reusable distribution; they do not recommend compiling opaque marketplace state into a repo snapshot. A manifest of exact install commands is safer than trying to resolve marketplace names during compilation and matches the stable commands the user wants to ship.

Date: 2026-04-08

Decision: Next.js and Convex framework guidance will be represented in starter-local wrapper skills that point to the repo’s installed version-coupled docs, not as live external skill installs.

Rationale: The repo already requires agents to read `apps/web/node_modules/next/dist/docs/` for the installed Next.js version and `apps/web/convex/_generated/ai/guidelines.md` for the generated Convex guidance. Those references should stay tied to the actual downloaded repo version so they do not drift away from the code the buyer is editing.

Date: 2026-04-08

Decision: The first implementation pass will automate external-skill installation only for the explicit commands already vetted for Convex, Clerk, and Stripe, and will leave Next.js as a local wrapper-only concern.

Rationale: The repo can now safely generate a script around the exact external skill commands you supplied, but it still should not guess at a generic Next.js marketplace package. Next.js stays a local wrapper because the starter’s real guidance must follow the installed Next.js version in `node_modules`.

Date: 2026-04-08

## Outcomes & Retrospective

The compiled starter now ships a buyer-facing `START-HERE.md`, a matching docs onboarding override at `apps/web/content/docs/index.mdx`, repo-local wrapper skills under `.agents/skills`, a pinned external skill manifest, and a generated `scripts/install-codex-skills.sh` installer exposed through `bun run codex:skills:install`. The buyer-facing path is now explicit: bootstrap, install skills, run `$starter-core-setup`, run `$starter-auth-setup`, run `$starter-billing-setup`, verify the starter, then begin product work.

This result matches the original purpose better than the prior setup story because the compiled starter no longer relies on the buyer piecing together local setup, auth, billing, and Codex usage from scattered docs pages. The remaining gap is strategic rather than functional: if a future follow-up wants broader external skills beyond Convex, Clerk, and Stripe, it should add them only after their exact install commands are vetted.

## Context and Orientation

The relevant generator boundary is `packages/blueprint-compiler`. That package decides which files are injected into the compiled starter. The current root-facing starter artifacts are assembled in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`, which already overrides the generated `README.md` and root `package.json`. The current in-progress bootstrap command is rendered from `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts`. Those two files are the existing root entry points that a buyer will see first, so they must either link to or mention the new onboarding guide.

The starter already has one place that references external skills material: `apps/web/config/product.ts` exposes links to `https://github.com/openai/skills` and the `openai/skills` zip in the Codex lesson configuration. That proves the product already has a concept of skills as part of the teaching story, but it is not yet part of the compiled starter repo contract itself.

The compiled starter also ships the app docs from `apps/web/content/docs`. The two most relevant existing pages are `apps/web/content/docs/index.mdx`, which is already the “Start Here” page, and `apps/web/content/docs/local-setup.mdx`, which already explains the correct provider order and local boot process. The grilled plan resolves that the onboarding guide should reuse `apps/web/content/docs/index.mdx` as the docs-surface entry point rather than add a second onboarding page. The file `apps/web/content/docs/_meta.ts` therefore remains unchanged in the first pass unless implementation reveals a real navigation need.

The tests that protect the starter snapshot contract are already present in `packages/blueprint-compiler/tests/repo-generation.test.ts` and `packages/blueprint-compiler/tests/review-download-zip.test.ts`. Those tests currently check that generated files such as `README.md`, `DESIGN.md`, and the bootstrap script land in the materialized snapshot and zip. The onboarding feature should extend those tests or add a focused new test so the onboarding guide cannot silently disappear in a later change.

In this plan, “core setup” means getting the starter booted locally and understanding the repo without yet relying on auth or billing. “Auth setup” means wiring Clerk and Convex so protected routes and identity-dependent behavior work. “Billing setup” means wiring Stripe so checkout and paid-access handoff work. A “skill” means one of the named Codex instruction bundles already available in this repository, such as `shadcn`, `frontend-design`, `clerk`, `convex`, `stripe-best-practices`, `qa-team`, `testing-practices`, and `docs`. A “wrapper skill” means a repo-local skill that teaches Codex how to use this starter safely and where to read local version-coupled guidance. An “external skill manifest” means a checked-in data file that lists vetted exact install commands to run later, after the buyer downloads the starter.

The working tree already contains uncommitted bootstrap-related edits in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts`, and the corresponding compiler tests. Any implementation following this plan must preserve those edits and build on them instead of overwriting them.

## Plan of Work

The implementation should start by freezing the content contract of the onboarding guide in code before wiring it into entry points. Create a new generator module inside `packages/blueprint-compiler/src/repo-generation/` whose job is to describe the onboarding phases once and render them into two outputs: a root Markdown file named `START-HERE.md` for someone opening the repo in an editor, and an MDX override for `apps/web/content/docs/index.mdx` for someone using the starter’s `/docs` surface. The content model should encode the phases that came out of planning in one prescribed order: understand the blueprint, boot the repo, install the skills, run core setup, run auth setup, run billing setup, verify the baseline, replace the generated identity where appropriate, remove starter surfaces intentionally, and begin the first real product slice. The implementation may still structure the content internally around core setup, auth setup, and billing setup, but the buyer-facing guide must never present those as optional lanes to choose from.

In the same initiative, add a second generator module for the starter-local skill layer. That module should emit a small set of wrapper skills into `.agents/skills` so Codex lands with starter-specific guidance without needing a marketplace round trip. The initial wrapper set should cover four starter concerns: core repo boot, auth setup, billing setup, and the first real implementation slice. The Next.js and Convex wrappers should explicitly point Codex to `apps/web/node_modules/next/dist/docs/` and `apps/web/convex/_generated/ai/guidelines.md` respectively before editing those subsystems.

The first implementation pass should also emit a machine-readable external-skill manifest and a generated installer script. The manifest should live somewhere starter-local and obvious, such as `.agents/skills/external-skills.json`, and list the exact vetted install commands to run later. The onboarding guide should explain that repo-local wrapper skills ship with the starter, while external skills are an explicit post-download install step. The first stable external pack should include the following commands exactly:

    npx skills add get-convex/agent-skills --all
    npx skills add clerk/skills
    npx skills add https://github.com/stripe/ai --skill stripe-best-practices

The generated installer should run those commands in order and then tell the buyer to restart Codex if the new skills do not appear.

After the renderers exist, wire the root entry points. Update `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts` so the generated `README.md` points at the new root guide near the top and so the generated `package.json` or bootstrap copy can reference both the onboarding guide and the presence of starter-local skills if that improves discoverability. Add a root package script such as `codex:skills:install` that runs the generated installer script. Keep the README concise. It should not duplicate the entire guide. It should tell the buyer where the durable guide lives, that the repo includes local Codex skills under `.agents/skills`, and that they can install the vetted external skills in one command.

Then wire the docs-surface entry points. Override `apps/web/content/docs/index.mdx` using the same onboarding content so `/docs` itself becomes the full onboarding journey. Preserve the useful lower-level links into `local-setup`, `clerk-convex-auth`, `stripe-checkout-webhook`, `local-qa`, and `build-your-product`, but make those subordinate references rather than the primary journey.

Once the content is wired, extend the compiler tests so the root guide, the docs page, the shipped wrapper skills, the external-skill manifest, and the generated install script are part of the starter snapshot contract. The tests should prove that the files are rendered and that the generated README mentions the guide. If the guide uses static skill names, the tests should assert at least one or two representative skills so accidental copy regression is caught. Add at least one test assertion that the emitted `.agents/skills` tree contains the expected wrapper skill names and at least one assertion that the external manifest or generated installer includes the Clerk, Convex, and Stripe install commands exactly.

Finally, validate at the narrowest useful package scope first and then rerun the repository-required gates. This work touches generator code and starter-content output, so the validation should prove both the compiler contract and the root format, lint, and typecheck requirements.

## Milestones

### Milestone 1: Freeze the onboarding artifact contract

At the end of this milestone, there is a clear decision about the exact root file name, the exact docs page path, and the structure of the shared content model. The grilled plan already resolves those decisions as `START-HERE.md` at the repo root and `apps/web/content/docs/index.mdx` in the docs surface. The success criterion is that a new implementer can point to the one generator module that owns the onboarding phases and explain how those phases will appear in both Markdown and MDX. Validate this milestone by reading the generator module and confirming it names the customer-action, agent-prompt, skill blocks, and lane callouts for each phase.

### Milestone 2: Wire the generated root and docs entry points

At the end of this milestone, a compiled starter will contain `START-HERE.md`, the root `README.md` will direct the buyer to it, and `/docs` will render the same onboarding journey through the overridden docs index page. The compiled starter will also contain the initial `.agents/skills` wrapper set, the external-skill manifest, and a one-command installer script exposed through the root package. Success means a novice opening the repo from disk or opening `/docs` sees one obvious order of operations before the lower-level setup pages, Codex can discover starter-specific wrapper skills without any extra installation step, and the buyer can install the vetted external skills with one command. Validate this milestone by materializing a snapshot in tests or local inspection and checking that the expected files and links exist.

### Milestone 3: Lock the snapshot contract and prove the repo still passes validation

At the end of this milestone, the compiler tests prove the onboarding files and wrapper skills ship in the snapshot and zip, and the required package-level and root-level checks pass. Success means the onboarding guide and starter-local skill layer are no longer “just content”; they are tested parts of the starter repo contract.

## Concrete Steps

Start in the repository root and inspect the existing generator and docs entry points again before editing anything:

    cd /Users/parkerrex/Developer/ship-by-sunday
    sed -n '1,240p' packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts
    sed -n '1,260p' packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts
    sed -n '1,240p' apps/web/content/docs/index.mdx
    sed -n '1,260p' apps/web/content/docs/local-setup.mdx

You should see the generated README override, the bootstrap renderer, the current docs “Start Here” page, and the existing provider-order guidance.

Create a new generator module in `packages/blueprint-compiler/src/repo-generation/`. Give it a domain-specific name such as `render-starter-project-onboarding.ts`. That file should export one function that returns the rendered onboarding files and one shared data structure describing the onboarding phases. Each phase should include a short title, a plain-language goal, the customer action, the agent prompt, the skill list, and any internal tags needed to distinguish the core setup work, the auth work, and the billing work. In the rendered buyer-facing text, these should appear as steps in order, not as branches the customer must choose between.

Create a second generator module in `packages/blueprint-compiler/src/repo-generation/` for the wrapper skills, for example `render-starter-skills.ts`. That file should emit `RenderedBlueprintFile[]` entries under `.agents/skills/` for starter-local workflows such as `starter-core-setup`, `starter-auth-setup`, `starter-billing-setup`, and `starter-first-slice`. Keep each wrapper skill small and repo-specific. The Next.js-facing wrapper must point to `apps/web/node_modules/next/dist/docs/` before editing framework code, and the Convex-facing wrapper must point to `apps/web/convex/_generated/ai/guidelines.md` before editing Convex code.

Update `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts` so it includes the new root onboarding file in the returned `RenderedBlueprintFile[]` list and so the generated `README.md` points to it near the top. If the current bootstrap output should mention the guide in its closing “next steps,” update `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts` in the same change so the shell helper and durable guide stay aligned.

Have the skill renderer also emit a starter-local external skill manifest file, using a precise path such as `.agents/skills/external-skills.json`, and a generated installer shell script such as `scripts/install-codex-skills.sh`. That file should explain in comments or adjacent generated docs that repo-local wrapper skills are shipped, while external skills are installed later from explicit pinned commands. The initial manifest entries must be the exact commands below:

    npx skills add get-convex/agent-skills --all
    npx skills add clerk/skills
    npx skills add https://github.com/stripe/ai --skill stripe-best-practices

The generated installer script should read or embed those commands, run them sequentially, and print a final note that the buyer may need to restart Codex.

Update the onboarding content so the top-level buyer instructions are explicit and short. The first commands a buyer sees should be:

    bun run bootstrap
    bun run codex:skills:install

Then the first Codex skill triggers they see should be:

    $starter-core-setup
    $starter-auth-setup
    $starter-billing-setup

Add the docs-surface output using the same renderer by emitting an override for `apps/web/content/docs/index.mdx`. Do not add a new onboarding page in the first pass. The existing docs route and nav label are already “Start Here,” and the guide should take over that surface directly. If implementation discovers a hard MDX limitation that makes reusing `index.mdx` impractical, record that discovery in this plan before falling back to a separate page.

After the renderer and entry points are in place, update the compiler tests:

    cd /Users/parkerrex/Developer/ship-by-sunday
    sed -n '1,220p' packages/blueprint-compiler/tests/repo-generation.test.ts
    sed -n '1,160p' packages/blueprint-compiler/tests/review-download-zip.test.ts

Extend those tests or add a small dedicated test so they assert the new root onboarding file `START-HERE.md`, the overridden docs onboarding file at `apps/web/content/docs/index.mdx`, the presence of wrapper skills under `.agents/skills/`, the generated installer script, and the README reference. Keep the assertions specific enough to catch regression without snapshotting whole files. Also assert a representative skill string such as `shadcn`, a representative lane label such as `billing`, a wrapper skill path such as `.agents/skills/starter-auth-setup/SKILL.md`, and the exact strings `get-convex/agent-skills`, `clerk/skills`, and `stripe-best-practices` so the content contract does not silently flatten back into a generic setup page.

When the code is ready, run the narrow package checks first:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler test

Expected success is that all four commands exit cleanly. The test run should report the compiler suite passing, including the updated snapshot-contract assertions.

Then rerun the required root-level gates for this repository:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

Expected success is that the root formatter, linter, and typecheck complete without new failures. If unrelated working-tree noise causes one of these to fail, document the exact file and failure in this plan before stopping.

## Validation and Acceptance

This feature is complete when a buyer can open the compiled starter repo and immediately find one durable guide that explains the full path from fresh blueprint to working on their product. The guide must live in the root of the compiled starter and also be reachable from the app docs surface. It must describe the onboarding phases in order, including which steps are customer actions, which are agent prompts, and which Codex skills should be used in each phase.

This feature also requires that the compiled starter lands with starter-local wrapper skills under `.agents/skills` so Codex has repo-specific setup guidance on day one. External skills may still require post-download installation, but the starter must explain that distinction clearly.

This feature also requires that the compiled starter exposes a simple one-command path for installing the vetted external skills, and that the onboarding guide teaches buyers how to trigger any skill explicitly in Codex with the `$skill-name` syntax.

Acceptance is behavioral, not structural. A human validator should be able to do all of the following:

Open the generated root `README.md` and see a prominent pointer to the onboarding guide.

Open the onboarding guide and see the phases laid out in one obvious order: understanding the blueprint, booting the repo, installing skills, running core setup, running auth setup, running billing setup, proving the baseline, replacing the generated identity where appropriate, removing starter scaffolding intentionally, and beginning the first real product slice.

Open the generated app docs and find the same journey surfaced directly at `/docs` without having to piece it together from several unrelated setup pages.

Read any one phase and see both the buyer instruction and the agent instruction, plus a curated skill list that matches the current repo skill inventory.

Open `.agents/skills/` in the generated starter and find the expected wrapper skills for core setup, auth setup, billing setup, and the first real slice.

Run the generated external skill install command, see the exact Clerk, Convex, and Stripe commands invoked, and then read the onboarding guide explaining that explicit skill invocation in Codex uses the `$` prefix.

Run the validation commands below and see them all pass:

    cd /Users/parkerrex/Developer/ship-by-sunday
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler test
    bun run format
    bun run lint
    bun run typecheck

If the implementation adds a separate renderer test, that test should also prove that at least one representative skill name such as `shadcn` or `clerk` appears in the rendered content so accidental removal is caught.

## Idempotence and Recovery

This work should be additive. The safest pattern is to add the new renderer module and new onboarding files first, then update the existing README and docs entry points to link to them. Avoid deleting or rewriting the current lower-level setup docs. They remain the detailed references behind the new onboarding page.

If a docs-page path or root file name turns out to be confusing during implementation, the safest recovery is to keep the content model and change only the emitted file paths and link targets. Because this feature lives in the compiler, regenerating the files is naturally idempotent. Re-running the same generator code should recreate the same guide contents.

If tests fail after updating docs entry points, first inspect whether the failure is caused by a missing emitted file or by a stale path in the README or docs navigation. Do not paper over a broken link by removing the assertion. Update the rendered path or link target instead, then rerun the focused compiler test suite.

If the root `bun run format`, `bun run lint`, or `bun run typecheck` commands fail on unrelated dirty-worktree files, record that explicitly in `Progress` and `Surprises & Discoveries`. Do not silently rewrite unrelated user work to make the gates pass.

## Artifacts and Notes

The finished snapshot should contain evidence like the following when inspected in a test or local render:

    README.md
    DESIGN.md
    START-HERE.md
    apps/web/content/docs/index.mdx
    .agents/skills/starter-core-setup/SKILL.md
    .agents/skills/starter-auth-setup/SKILL.md
    .agents/skills/starter-billing-setup/SKILL.md
    .agents/skills/starter-first-slice/SKILL.md
    .agents/skills/external-skills.json
    scripts/install-codex-skills.sh

The grilled plan resolves the root filename and docs path already. The important artifact pattern is that one root onboarding file and one docs-surface onboarding page both exist and both come from the same source model.

The onboarding guide itself should contain short, concrete skill callouts. A representative excerpt should read in this style:

    Customer action: Replace the generated product identity in apps/web/config/product.ts and apps/web/features/marketing/content/home.ts.
    Agent prompt: “Update the generated starter identity to match my product before touching auth or billing.”
    Skills to use: copywriting, frontend-design, docs

It should also contain an explicit skill-trigger tip in this style:

    In Codex, trigger a skill by typing `$` followed by the skill name.
    Examples:
    $starter-auth-setup
    $clerk
    $stripe-best-practices

Observed proof from the compiler validation loop:

    bun run --cwd packages/blueprint-compiler format:check
    All matched files use the correct format.

    bun run --cwd packages/blueprint-compiler lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/blueprint-compiler typecheck
    exited with code 0

    bun run --cwd packages/blueprint-compiler test
    Test Files  9 passed (9)
    Tests  25 passed (25)

Observed proof from the required root validation loop:

    bun run format
    Finished in 598ms on 950 files using 10 threads.

    bun run lint
    Found 0 warnings and 0 errors.

    bun run typecheck
    ✓ Compiled successfully
    Finished TypeScript

Observed proof for the generated installer shell:

    bun -e '...renderStarterSkillFiles...' > /tmp/install-codex-skills.sh
    bash -n /tmp/install-codex-skills.sh
    exited with code 0

## Interfaces and Dependencies

The new renderer module in `packages/blueprint-compiler/src/repo-generation/` should return `RenderedBlueprintFile[]`, the same internal file contract used by the rest of the starter compiler. The root wiring remains in `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`. If the bootstrap script needs to mention the onboarding guide, that change belongs in `packages/blueprint-compiler/src/repo-generation/render-starter-bootstrap.ts`.

The starter-local skill renderer should also return `RenderedBlueprintFile[]` and should emit only repo-local skills and starter-owned metadata. It should not depend on live network access or marketplace lookups at compile time.

The docs-side files live under `apps/web/content/docs/`. In the first implementation pass, the onboarding guide should override `apps/web/content/docs/index.mdx` directly and should not require a `_meta.ts` change. If later work adds a second onboarding page or a dedicated checklist route, that follow-up should revisit `_meta.ts` in a separate plan.

The current lower-level setup docs remain dependencies of the guide because the guide should point into them rather than replace them. The most important ones are `apps/web/content/docs/local-setup.mdx`, `apps/web/content/docs/clerk-convex-auth.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/local-qa.mdx`, and `apps/web/content/docs/build-your-product.mdx`.

The current recommended skill map should be treated as part of the onboarding contract for this feature. The initial static list should include the repo skills that map directly to starter phases: `shadcn`, `frontend-design`, `copywriting`, `clerk`, `convex`, `stripe-best-practices`, `qa-team`, `testing-practices`, and `docs`. If a future change wants to make that list dynamic, that belongs in a separate plan.

The external skill layer is intentionally split from the shipped wrapper skills. Official Codex docs support repo-local `.agents/skills` for project workflows and recommend plugins for reusable installable distribution. The first implementation pass should therefore ship wrapper skills plus a manifest of pinned install commands and a one-command installer, not a live marketplace resolver. The initial external pack should cover Convex, Clerk, and Stripe with the exact commands already chosen. Next.js remains local-wrapper-only in this pass because the customer-safe guidance for Next.js is the installed version-coupled docs in `apps/web/node_modules/next/dist/docs/`.
