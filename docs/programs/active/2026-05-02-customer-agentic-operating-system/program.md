---
program_id: customer-agentic-operating-system
title: Customer Agentic Operating System
status: active
created_at: 2026-05-02
completed_at: null
summary: Make Ship by Sunday the agent doctor and loop operating layer for web-app builders across generated repos, broken apps, and mature existing codebases.
post_build_recap: null
read_when:
  - Planning generated customer repo Program and ExecPlan support.
  - Designing mature repo adoption for existing customer codebases.
  - Writing or refreshing child ExecPlans for the customer agentic operating system.
---

# Customer Agentic Operating System

This is a living initiative document. It keeps the durable initiative-level truth for turning Ship by Sunday into the agent doctor and loop operating layer for generated customer repos, broken existing apps, and mature existing codebases.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should not merely hand customers a starter repo. The buyer-facing product is an agent doctor for web apps: diagnose the app or repo, rank the highest-leverage opportunities, attach a consented execution surface, run the first recommended worker loop, produce proof, and update source truth for the next recommendation. Programs, ExecPlans, validation commands, review evidence, and source-truth docs are the operating substrate that make those workers reliable instead of one-off agents trapped in chat history.

The commercial thesis is that the existing `$250` offer, soon moving toward `$500`, should stay the simple flagship purchase: doctor pass, top opportunities, the first recommended worker loop, proof, and the next recommendation. The loop catalog is fulfillment inventory and positioning proof, not a public SKU maze. New app builders, broken vibe-coded app owners, indie SaaS founders, agencies, operators, and mature teams can all understand the same promise: diagnose what is blocking the web app, run the highest-leverage loop inside the paid engagement, review proof, and receive the next recommendation.

Two buyer modes should stay visible in every later slice. New builders want an awesome worker-ready codebase from their idea: product truth, generated repo, setup docs, Build Pack readiness, and a first loop that proves the app can start moving. Existing app owners, founders, agencies, and operators want an agent doctor pass on a repo they already value: debugging, design, billing, auth, growth, performance, release, observability, support ops, and mature-repo acceleration without replacing the stack. Both modes converge on the same artifact trail: source-truth snapshot, opportunity ledger, selected loop, ExecPlan or work plan, proof, and next recommendation.

The initiative is moving in the right direction when a newly generated repo contains a customer-safe Program and ExecPlan operating pack, when an existing or broken web app can receive a doctor pass with the top nine leverage opportunities, and when customers can buy repeatable loops that respect their current stack instead of forcing the starter workflow onto them. The plain-language promise is "agent doctor for web apps"; the durable machinery underneath remains Programs, ExecPlans, source truth, proof loops, and worker roles.

## Program Inputs

The Program packet lives under `docs/programs/active/2026-05-02-customer-agentic-operating-system/`.

The durable research inputs are `research-pass-generated-repo-operating-system.md`, `research-pass-mature-repo-adoption.md`, `research-pass-packaging-validation.md`, `research-pass-product-ux.md`, `research-pass-market-expansion.md`, `research-pass-loop-catalog-and-monetization.md`, and `research-pass-positioning-and-landing-page.md`.

The normalized input is `normalized-pass-agentic-operating-system.md`.

The convergence artifact is `converged-decision-packet.md`.

The dependency artifact is `dependency-graph.md`.

The plan split artifact is `plan-split-recommendation.md`.

The review artifact is `cross-repo-review.md`.

The current planning brief is `planning-brief-1.md`, with `current-planning-brief.txt` pointing at the current versioned brief. The market-expansion, loop-catalog, monetization, and positioning research passes sharpen the commercial north star but do not supersede the active child ExecPlan.

## Current State

Ship by Sunday already has a strong internal Program and ExecPlan system under `docs/programs/`, `docs/exec-plans/`, `docs/prompts/`, and `scripts/`. Generated customer repos already receive Build Pack readiness, first-slice planning, root agent instructions, onboarding docs, local starter skills, and testing guidance.

The public product surface is already close to worker-first language. `apps/web/config/product.ts` sets the live flagship price to `$500` with a 50 percent active offer, so checkout displays the current `$250` Pilot Member purchase. `starterConfig.homePage.heroPrimaryCta` and `pricingPrimaryCta` both target checkout, and `apps/web/app/_content/home-page.ts` currently sells "Build the worker layer," "Ship codebases that convert," "Generate my codebase," exec loops, role packets, channel handoffs, and QA. The unresolved product issue is that the current customer journey still reads primarily as a generated-codebase path, while the highest-leverage market also includes broken vibe-coded apps, mature codebases, agencies, and operators who need diagnosis and loop execution before they care about methodology.

The live app flow is blueprint-first. `apps/web/AGENTS.md`, `apps/web/content/docs/route-map.mdx`, and the routes under `apps/web/app/(workspace)/blueprint` and `apps/web/app/(workspace)/review` make `/blueprint` the canonical protected workspace and `/review` the customer-facing download handoff. Checkout is owned by `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, the Stripe webhook docs under `apps/web/content/docs/stripe-checkout-webhook.mdx`, and the success path under `apps/web/app/checkout/success/`. That means the next commercial copy slice can change homepage narrative and offer framing, but it must not pretend the app already has mature-repo upload, repo audit, or arbitrary repair flows.

The homepage issue is similar. The product should not sound like abstract agentic engineering, a course, or a prompt library. The first explanation should be normal-buyer language: Ship by Sunday is the agent doctor for web apps. It diagnoses blockers, ranks the highest-leverage fixes, runs named AI worker loops, and ends every loop with proof or an honest blocked-proof report. The homepage should explain the two major buyer modes quickly: "start with my idea" for a generated worker-ready repo and "bring my app" for diagnosis-first existing or broken app help. It should then show the loop catalog as examples of what the flagship can route into, not as a checkout shelf.

The app already has an optional Codex app-server connection surface for paid users to connect their ChatGPT/Codex subscription for in-app generation. The current implementation lives in `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-service.ts`, `apps/web/platform/codex/app-server-contracts.ts`, `apps/web/app/api/codex/`, and `apps/web/app/(workspace)/_components/codex-connection-card/`. It is protected by product access, stores per-user Codex state under a hashed home directory, spawns `codex app-server`, and records account status plus rate-limit snapshots in Convex. It is disabled by default on Vercel unless `CODEX_APP_SERVER_ENABLED` says otherwise, and the generated production env template sets `CODEX_APP_SERVER_ENABLED=false`.

Official OpenAI developer docs, checked through the OpenAI developer documentation MCP server during the 2026-05-03 refresh, support Codex through app, IDE extension, CLI, and cloud surfaces. They also describe ChatGPT or API-key sign-in, GitHub-connected Codex cloud environments, project-scoped `.codex/config.toml` only after trust, Apps SDK MCP tools plus optional UI, and app-review requirements around privacy, tool annotations, and test cases. This means "bring your own AI" should be a real strategy, but the Program must frame it as an explicit, consented execution surface rather than implying silent attachment to a user's Codex account.

Generated customer repos do not yet receive the canonical Program and ExecPlan folder model. The customer-safe snapshot contract currently excludes internal `docs/programs/**`, `docs/exec-plans/**`, `docs/PLANS.md`, `docs/prompts/program-*.md`, `.codex/**`, internal release workflow notes, and source instruction packs. It ships or renders `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/**`, `docs/testing/**`, generated onboarding, local starter skills, `docs/build/**`, and `execplan-*` prompt assets. That protects customers from internal history but also means the best agentic operating practices are not yet installed in the generated repo.

The generated-repo flow is concretely owned by `apps/web/app/api/download/repo/route.ts`, `apps/web/app/api/download/repo/_server/downloads.ts`, `packages/blueprint-compiler/src/bundle/build-review-download-zip.ts`, `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`, `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts`, `packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts`, and materialization tests under `packages/blueprint-compiler/tests/`. Current generated root scripts include `bootstrap`, `codex:skills:install`, app dev/build/check/test scripts, and `test:compiler`; they do not yet include `plans:lint`, `programs:lint`, or `agentic:check`.

Mature existing codebases have no first-class product lane yet. The current product flow is blueprint-first and generated-repo-first. The mature-repo opportunity needs a separate audit and adoption workflow that preserves each customer's conventions. The broken-app rescue opportunity needs an even sharper wedge: reproduce the failure, identify root causes, rank leverage, patch only after review, and prove the app moved from stuck to safer. Until those contracts exist, public copy can sell diagnosis-first existing-app help as planned or concierge/beta, but it must not imply automated mature-repo transformation is live.

## Progress

- [x] 2026-05-02 EDT: Researched `Man-Meets-AI/plans-and-programs` and confirmed its strongest portable practices are Programs, ExecPlans, immutable planning briefs, thin skills, prompt loops, and structural validation.
- [x] 2026-05-02 EDT: Mapped current Ship by Sunday generated repo surfaces, customer-safe snapshot exclusions, prompt pack wiring, starter onboarding, local skills, package scripts, and compiler tests.
- [x] 2026-05-02 EDT: Created this active Program packet and the first planning brief.
- [x] 2026-05-02 EDT: Created the first child ExecPlan for reconciling the generated-repo agentic source contract.
- [x] 2026-05-02 EDT: Incorporated subagent critiques about prompt naming drift, skill trigger drift, package-script promises, product-lane overreach, and mature-repo adoption boundaries.
- [x] 2026-05-02 EDT: Incorporated the worker-first product thesis and the new-codebase versus existing-codebase customer journey into the Program packet.
- [x] 2026-05-02 EDT: Added market-expansion research that reframes the Program around the agent doctor wedge, top-nine opportunity pass, loop catalog, BYO execution surface, and broken-app rescue lane.
- [x] 2026-05-02 EDT: Added loop catalog and monetization research that expands the sellable inventory across diagnostic, rescue, revenue, growth, product, operations, AI, and agency loops.
- [x] 2026-05-02 EDT: Added positioning and landing-page research that makes the first explanation "agent doctor for web apps" instead of abstract agentic methodology.
- [x] 2026-05-03 EDT: Refreshed the Program against current homepage, checkout, blueprint, Codex, OpenAI docs, and generated-repo compiler surfaces; tightened the strategy around one flagship offer, two buyer modes, consented execution, proof promises, and reality boundaries.
- [ ] Implement the first generated-repo source-contract slice.
- [ ] Refresh the Program with generated-repo proof and choose the commercial doctor-pass slice.
- [ ] Define the commercial doctor pass, top-nine ledger, flagship offer, proof contract, homepage narrative, and fulfillment loop catalog.
- [ ] Harden the consented execution surface for BYO Codex, API-key, GitHub, and local-repo paths.
- [ ] Ship the broken-app rescue loop as the first existing-repo monetization wedge.
- [ ] Design and implement the mature-repo adoption lane.

## Decision Log

Decision: Use one Program for generated repos, broken apps, and mature existing repos.
Rationale: The product promise is one operating system with several customer lanes. A single Program keeps shared packaging, validation, prompt, skill, execution-surface, and narrative decisions coherent while child ExecPlans keep implementation slices bounded.
Date: 2026-05-02

Decision: Treat workers as the purchased outcome and Programs, ExecPlans, and loops as the worker substrate.
Rationale: Customers want reliable workers more than they want abstract agent methodology. The methodology matters because it makes the worker layer durable: workers get role packets, source truth, plan state, proof loops, and recurrence instead of depending on a single prompt.
Date: 2026-05-02

Decision: Lead with the agent doctor and loop catalog commercially.
Rationale: The widest web-app market includes new app builders, broken vibe-coded app owners, mature repo owners, agencies, and operators. They buy diagnosis, leverage, repair, and proof before they buy planning doctrine. Programs and ExecPlans should show the work and preserve memory, while the top-level product sells doctor passes and loop execution.
Date: 2026-05-02

Decision: Treat the loop catalog as the sellable inventory and rank loops by money.
Rationale: The most valuable loops combine urgent pain, willingness to pay, clear proof, bounded risk, repeatability, and natural next-purchase pull. The near-term catalog should lead with doctor pass, broken-app rescue, billing/auth hardening, conversion/activation, release proof, observability, design, performance, and test hardening.
Date: 2026-05-02

Decision: Make the doctor pass output a top-nine opportunity ledger.
Rationale: The top-nine schema gives every lane the same conversion artifact: buyer value, expected revenue or speed impact, confidence, blast radius, proof path, required permissions, recommended loop, package or price language, next action, and blocked-proof state.
Date: 2026-05-02

Decision: Use plain landing-page language before operating-system language.
Rationale: A normal web-app builder should understand the product in under 10 seconds. "The agent doctor for web apps" explains the buyer value faster than "agentic engineering operating system"; Programs, ExecPlans, and source-truth loops should appear as proof machinery deeper in the page and docs.
Date: 2026-05-02

Decision: Keep the public first purchase anchored to the `$250` soon-`$500` flagship offer.
Rationale: The buyer should not have to choose from a SKU maze. The flagship offer should include the doctor pass, top-nine opportunity report, selected first loop, proof output, blocked-proof report when needed, and next-loop recommendation. Additional loops, subscriptions, retainers, emergency rescue, agency tier, and concierge review are follow-on or higher-touch shapes, not the main first-purchase story.
Date: 2026-05-02

Decision: Treat bring-your-own AI as a consented execution surface.
Rationale: Ship by Sunday already has optional Codex app-server connection code, and Codex supports ChatGPT or API-key sign-in across local and cloud surfaces. The product should let customers attach ChatGPT/Codex, API keys, GitHub environments, or local repo runners explicitly, then run loops against that authorized surface.
Date: 2026-05-02

Decision: Make generated repo source-contract reconciliation the first implementation lane.
Rationale: Generated repos are controlled by `packages/blueprint-compiler`, already use Bun, already include Build Pack readiness, and can be proven through existing materialization tests. Subagent review found prompt naming drift and skill trigger drift, so reconciliation should precede full operating-pack shipment.
Date: 2026-05-02

Decision: Keep mature-repo adoption separate from generated-repo bootstrap.
Rationale: Mature repos need read-only audit, package-manager preservation, source-truth mapping, and safe patch delivery. They should not inherit generated-starter assumptions.
Date: 2026-05-02

Decision: Avoid hidden `postinstall` or silent bootstrap mutation.
Rationale: Customers should explicitly ask the repo to create or refresh agentic Program artifacts. Hidden mutation makes setup surprising and harder to review.
Date: 2026-05-02

Decision: Separate public offer language from fulfillment routing.
Rationale: The public purchase should read as one flagship web-app progress pass: diagnose the app, rank the top opportunities, run the first recommended loop, prove or report the block, and recommend the next loop. Internally the loop catalog routes fulfillment across new-app generation, broken-app rescue, billing/auth, growth, performance, release, observability, support ops, and mature-repo acceleration, but the buyer should not have to choose among many SKUs before trust exists.
Date: 2026-05-03

Decision: State live capability and future capability separately.
Rationale: Today the repo proves a blueprint-first generated-repo purchase and an optional paid-user Codex app-server connection for in-app generation. It does not yet prove mature-repo ingestion, arbitrary existing-repo patching, GitHub-connected doctor execution, API-key loop execution, or self-serve broken-app rescue. The Program should sell the commercial direction while forcing each later slice to name the files, permissions, proof commands, and blocked-proof states that make a claim real.
Date: 2026-05-03

Decision: Make proof and blocked proof part of the flagship output.
Rationale: A normal buyer can understand proof more quickly than methodology. The flagship should end with either command/browser/dashboard evidence for the selected loop or a blocked-proof report naming the missing permission, environment, secret, provider access, reproduction, or review decision. That makes failure truthful and sets up the next recommendation without pretending unsupported automation succeeded.
Date: 2026-05-03

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`

Completed child ExecPlans:

- None.

Recommended future child ExecPlans:

- Define commercial doctor pass, top-nine ledger, flagship offer, proof contract, and homepage narrative.
- Harden consented execution surfaces for Codex app-server, ChatGPT/Codex cloud handoff, API keys, GitHub-connected execution, and local runners.
- Ship doctor-pass entry, opportunity ledger, permission map, and first-loop purchase surface for the existing flagship checkout.
- Ship broken-app rescue as the first existing-repo fulfillment loop, with read-only reproduction before patching.
- Ship customer-safe operating system file set for generated repos.
- Add explicit generated repo agentic bootstrap.
- Define the worker-led multi-lane customer journey across idea-to-repo, broken-app rescue, mature repo, agency, and operator modes.
- Design mature repo audit contract.
- Generate mature repo adoption Program.
- Wire mature repo adoption into the product.
- Harden cross-lane review and validation.

## Next Slice

An active child ExecPlan exists at `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`. It should reconcile generated-repo source truth and customer-safety boundaries first because current customer output must not point to missing prompts, skills, scripts, or unsafe planning archives.

After that active child lands, the next recommended Program slice is `Define Commercial Doctor Pass, Top-Nine Ledger, Flagship Offer, Proof Contract, And Homepage Narrative`. That slice should stay docs and product-contract first unless implementation is explicitly authorized. It should define the buyer-readable homepage story, the two-mode audience segmentation, the top-nine opportunity schema, the money-ranked fulfillment loop catalog, the scoring rubric, `$250` soon-`$500` flagship offer language, proof and blocked-proof requirements, consent boundaries, and the conversion path from first proof to the next recommended loop before the broader generated-repo operating pack expands.

That next slice must name the exact implementation owners it will later constrain: `apps/web/config/product.ts` for price, routes, modules, and CTA targets; `apps/web/app/_content/home-page.ts` for homepage copy; `apps/web/app/_lib/home-page-render-model.ts` and `apps/web/app/_lib/home-page-structured-data.ts` for section behavior and schema truth; `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` for CTA rendering; checkout code under `apps/web/app/api/stripe/checkout/`, `apps/web/platform/billing/checkout/`, and `apps/web/app/checkout/success/`; blueprint and review routes under `apps/web/app/(workspace)/blueprint` and `apps/web/app/(workspace)/review`; Codex connection surfaces under `apps/web/platform/codex/`, `apps/web/app/api/codex/`, and `apps/web/app/(workspace)/_components/codex-connection-card/`; and generated-repo output under `packages/blueprint-compiler/src/repo-generation/`.

## Risks and Watchpoints

Do not ship internal Program archives, completed ExecPlans, release evidence, or local operator assumptions into customer repos.

Do not duplicate Build Pack readiness truth. Generated Program and ExecPlan guidance should point to readiness and use it as input rather than conflicting with it.

Do not hide Program creation inside `postinstall`. Use explicit commands and reviewable generated artifacts.

Do not overfit mature-repo adoption to Bun, Next.js, Convex, Stripe, Linear, or the generated starter route map.

Do not let product messaging imply mature repos become production-ready automatically. The truthful promise is worker-readiness: clearer source truth, safer plans, validation, review loops, and a first adoption Program that lets agents behave like durable workers inside the customer's actual repo.

Do not sell "attach your Codex" as a hidden or automatic action. The customer must explicitly connect the ChatGPT/Codex account, API key, GitHub repo, local runner, and permission mode used by any loop.

Do not let the loop catalog become a grab bag. Each monetized loop needs a named input contract, output artifact, proof standard, rollback or review boundary, and honest failure state.

Do not let homepage copy sell the internal method instead of the buyer outcome. The first screen should make clear this is for web apps, works for new and existing or broken apps, diagnoses before acting, runs named loops, proves results, and requires consent for BYO Codex, AI, GitHub, API-key, or local execution surfaces.

Do not fragment the first purchase into too many SKUs. The public offer should stay the current `$250`, soon `$500`, flagship promise. Doctor pass, selected loop, and proof are included; additional loop purchases, subscription, emergency rescue, agency tier, and concierge review should appear only where fulfillment, checkout, entitlement, and support can honestly handle them.

Do not let the homepage imply the current generated-repo checkout already includes self-serve mature-repo ingestion or automatic repair. The truthful public story can say the system is being aimed at ideas, broken apps, existing SaaS repos, and client apps, but each lane must be labeled according to actual proof: live generated-repo path, planned doctor-pass contract, concierge/beta existing-app support, or future mature-repo adoption.

## Outcomes & Retrospective

This Program is active. It should complete only after generated repos ship the customer-safe operating pack, after the doctor pass and loop catalog can rank and execute real work with proof, and after the mature or broken-repo adoption lane has a durable, validated product path or a deliberately scoped first release with remaining work recorded.

## Validation and Acceptance

At the Program level, acceptance requires proof across all lanes.

Generated-repo acceptance requires materialized customer repos to include the operating pack, root validation scripts, prompt assets, skills, and customer-safe docs without internal archive leakage. Compiler tests must prove the output structurally, not only through substring checks.

Mature-repo acceptance requires an adoption workflow that audits an existing repo, preserves its conventions, emits a Program packet and first child ExecPlan, and reports blocked proof or missing facts honestly.

Commercial acceptance requires a money-ranked fulfillment loop catalog, flagship `$250` soon-`$500` offer language, and homepage explanation that a normal web-app builder can understand without knowing Program or ExecPlan vocabulary. The homepage proof promise must cover diagnosis, top opportunities, selected first loop, proof or blocked proof, and the next recommendation without introducing first-purchase SKU sprawl.

Doctor-pass acceptance requires a top-nine opportunity schema that can score buyer value, expected revenue or speed impact, confidence, blast radius, proof path, required permissions, recommended loop, price or package language, next action, and blocked-proof state from product and repo truth. Loop acceptance requires at least one monetized existing-repo loop, preferably broken-app rescue, to produce a reviewable patch or blocked-proof report without assuming the starter stack.

BYO execution acceptance requires the product to distinguish the current app-server ChatGPT/Codex subscription connection, future API-key usage, GitHub-connected cloud execution, and local runner execution. Each mode must document consent, storage, permissions, cost or rate-limit implications, and failure states before the product relies on it for paid loops.

Program completion also requires `bun run programs:lint`, relevant `plans:lint` checks, markdown lint for touched planning docs, focused compiler or product tests, and broader repo gates as dictated by child ExecPlans.

## Artifacts and Notes

The current planning brief is `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-1.md`.

The first child ExecPlan is `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`.

The most relevant prior Program is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`.

The market-expansion research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-market-expansion.md`.

The loop-catalog and monetization research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-loop-catalog-and-monetization.md`.

The positioning and landing-page research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-positioning-and-landing-page.md`.

The 2026-05-03 source refresh inspected `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, `apps/web/content/docs/configure-the-homepage.mdx`, `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/build-your-product.mdx`, `apps/web/content/docs/the-build-loop.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/customize-the-starter.mdx`, `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, `apps/web/app/(workspace)/blueprint/page.tsx`, `apps/web/app/(workspace)/review/_components/blueprint-review-page.tsx`, `apps/web/platform/codex/`, `apps/web/app/api/codex/`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `packages/blueprint-compiler/AGENTS.md`, `packages/blueprint-compiler/src/repo-generation/`, `packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts`, `packages/blueprint-compiler/src/server/template-loader.ts`, and generated-repo tests.

## Interfaces and Dependencies

This Program depends on root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/README.md`, `packages/blueprint-compiler/AGENTS.md`, `packages/blueprint-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts`, `packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-contracts.ts`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `apps/web/app/api/codex/`, and generated repo materialization tests.
