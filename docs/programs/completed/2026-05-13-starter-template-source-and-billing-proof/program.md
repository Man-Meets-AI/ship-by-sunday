---
program_id: starter-template-source-and-billing-proof
title: Starter Template Source And Billing Proof
status: complete
created_at: 2026-05-13
completed_at: 2026-05-14
summary: Make hosted billing proof product-specific and turn the generated Starter repo into a pinned template-source pipeline built from the sibling app skeleton, a ChatGPT-style use case, and the Ship by Sunday operating pack.
post_build_recap: Hosted billing proof now supports Starter and Workers, the generated Starter repo comes from pinned template source plus generated overlays, the customer template ships a ChatGPT-style BYO OpenAI app and first Program setup roadmap, and Starter Home has a direct generated template download path backed by the same compiler pipeline with default facts.
read_when:
  - "Resuming hosted billing proof parity for Starter and Workers."
  - "Planning the Starter template source boundary."
  - "Checking how generated repo zips should use a pinned template instead of a static zip."
---

# Starter Template Source And Billing Proof

This Program is a living initiative document for hardening billing proof across Starter and Workers and turning the generated Starter repo into a real template-source pipeline.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The public product split is now real, but two follow-up gaps remain. First, hosted billing proof is still Starter-first even though Workers is a separate paid offer. Second, the generated Starter repo is safe and runnable, but the app template itself is still mostly a rendered shell rather than a product-grade template source that can be improved like normal app code.

When this Program is complete, release proof can verify either Starter or Workers checkout, and Starter downloads come from a versioned template-source pipeline. The generator should still produce the zip dynamically, but the reusable app should live as ordinary source, with generated overlays for intake-specific product truth, design system, docs, Program material, ExecPlans, and skills.

The high-level implementation strategy is settled: use `~/Developer/next-js-convex-clerk-stripe-template` as the skeleton, replace its Notes sample with a ChatGPT-style BYO OpenAI chat app, then layer in the Ship by Sunday generated operating pack. The skeleton supplies the app architecture: Next.js, Convex, Clerk, Stripe, route groups, billing sync, auth, env conventions, tests, and docs. The use-case swap supplies `/chat`, conversations, messages, model picker, streaming responses, ChatGPT-default behavior, and `OPENAI_API_KEY` setup. The operating layer supplies generated facts, docs spine, first customer Program, setup ExecPlans, validation scripts, and agent instructions.

## Program Inputs

The current repository research is recorded in `research-pass-current-generator-and-proof.md`. Product decisions are normalized in `normalized-pass-product-decisions.md`. Canonical decisions are recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. Completed slices used `planning-brief-1.md`, `planning-brief-2.md`, `planning-brief-3.md`, `planning-brief-4.md`, `planning-brief-5.md`, `planning-brief-6.md`, and `planning-brief-7.md`; `current-planning-brief.txt` points at `planning-brief-7.md`, the final closeout brief.

This Program follows `docs/programs/active/2026-05-12-public-product-split-starter-workers/`. That Program split Starter and Workers as products. This Program hardens the proof and generated Starter deliverable that now sit underneath that split.

## Current State

Hosted checkout is app-owned and requires explicit purchase intent. The checkout route accepts `offerId` and routes Starter and Workers purchases through separate offer definitions. Hosted proof now accepts `--offer=starter|workers`, defaults to Starter, and carries offer-specific expectations for route, metadata, amount, and access. Release billing preflight now also checks the trusted Convex billing sync boundary before proof proceeds.

Generated repo downloads are built dynamically by `packages/codebase-compiler` and served by `apps/web/src/app/api/download/repo/route.ts` for authenticated Review downloads. The generated repo includes a runnable app, generated docs, source truth, design truth, Program material, ExecPlans, skills, bootstrap scripts, validation scripts, and `docs/facts/template-source.json` provenance. The generated app now starts from the pinned `templates/starter-app/source` snapshot through a tested adapter that maps the single-app source root into `apps/web/`, then applies manifest-allowed generated overlays.

Direct Starter template downloads are served by `apps/web/src/app/api/download/starter-template/route.ts`. Starter Home signs a short-lived download URL after access succeeds. The route rate-limits requests, validates that token, uses compiler-owned default Starter facts from `packages/codebase-compiler/src/repo-generation/default-starter-template-project-definition.ts`, calls the same `buildReviewDownloadZip` path as Review downloads, and returns `ai-chat-starter.zip` without requiring questionnaire state or live provider calls. Starter Home links to that route as `Download template` while keeping the guided lessons path available.

The generated output already has strong no-provider proof. The clean-room command contract installs the generated repo, lints Program and ExecPlan material, checks the Codebase contract, typechecks the generated app, and proves the dev command exists. Generated repos now ship a first customer Program with active setup ExecPlans for Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice, and generated onboarding routes setup work through those plans. The generated app now keeps the sibling template's public marketing shell, auth routes, authenticated dashboard, billing screen, provider package dependencies, and setup-gated missing-provider states while exposing `/chat` as the protected ChatGPT-style BYO OpenAI product surface.

There is no static zip source of truth. That is good. The Program now has an ordinary source tree boundary and the generator consumes it without reading the sibling checkout.

The first repo-local template-source boundary now exists at `templates/starter-app/source`. It is seeded from `~/Developer/next-js-convex-clerk-stripe-template`, pinned by `templates/starter-app/template-source.json`, validated by `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts`, and materialized by `packages/codebase-compiler/src/repo-generation/materialize-starter-template-source.ts`. The current materialized subset is intentionally no-provider safe and excludes provider-heavy Sentry, email, API route, and source-test files until setup-focused slices make those seams customer-ready. Generated billing actions stay visibly disabled until the setup slice deliberately materializes checkout and portal route handlers. The current template pin is `2026-05-13-chat-starter`, file count `134`, digest `sha256-5a0c27830caa417749264f5968c28a44083b63b742260a11c4757702c2924755`; the pin includes the post-review OpenAI stream completion guard and no-provider-safe generated proxy overlay.

## Progress

- [x] 2026-05-13: Identified hosted billing proof as Starter-first and agreed it should become offer-parameterized for Starter and Workers.
- [x] 2026-05-13: Agreed the Starter template should not become a hand-maintained zip or a live mutable remote fetch.
- [x] 2026-05-13: Agreed the generator should compose pinned template source, generated overlays, and generated operating-pack material into the downloadable repo.
- [x] 2026-05-13: Created this Program packet and planning brief 1 for product-specific hosted billing proof.
- [x] 2026-05-13: Settled the template product shape: sibling template skeleton, ChatGPT-style BYO OpenAI chat use case, and Ship by Sunday Program/ExecPlan operating pack.
- [x] 2026-05-13: Completed `Parameterize Hosted Billing Proof By Offer`; hosted billing proof now supports `--offer=starter|workers`, defaults to Starter, asserts selected-offer metadata, amount, destination, and access expectations, and passes focused proof/helper/release-planner validation.
- [x] 2026-05-13: Advanced the current planning brief to `planning-brief-2.md` for the pinned Starter template-source boundary.
- [x] 2026-05-13: Completed `Introduce Pinned Starter Template Source`; the sibling skeleton is imported under `templates/starter-app/source`, pinned by manifest digest, documented with ownership and overlay rules, and validated by compiler/package/root checks.
- [x] 2026-05-13: Advanced the current planning brief to `planning-brief-3.md` for generated repo template-source migration.
- [x] 2026-05-13: Completed `Migrate Generated Template App To Template Source`; generated repo materialization now validates and maps the pinned source into `apps/web/`, applies generated overlays afterward, avoids a competing root app tree, and preserves clean-room no-provider proof.
- [x] 2026-05-13: Hardened the completed template-source slices after review; every generated `apps/web` overlay path is now checked against `template-source.json`, questionnaire-derived content flows through `apps/web/config/product.ts` instead of `_content`, source-template README materialization is replaced by a no-provider-safe app README, generated provider gates keep the template app buildable without Clerk or Convex env, generated env examples use the pinned template env contract, generated billing actions stay disabled while API routes remain excluded, and generated repos emit template provenance at `docs/facts/template-source.json`.
- [x] 2026-05-13: Repaired generated clean-room install proof while staying on Bun; generated repos no longer inherit this repository's root `bun.lock`, generated CI uses `bun install`, and generated `bunfig.toml` keeps Bun's hoisted linker without the source repo's seven-day dependency age gate.
- [x] 2026-05-13: Advanced the current planning brief to `planning-brief-4.md` for generated Starter operating-pack upgrades.
- [x] 2026-05-13: Completed `Upgrade Generated Starter Operating Pack`; generated Starter repos now include a first customer Program, active setup ExecPlans for Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice, stronger Program child-plan validation, and onboarding/skill guidance that routes setup through those plans while preserving clean-room no-provider proof.
- [x] 2026-05-13: Hardened the generated operating pack after review; generated customer guidance no longer points at non-contract `apps/web/content/docs/*` setup docs or Convex `_generated` guidance, generated app-doc onboarding output was removed, and generated validators now check the exact first Program roadmap, active setup ExecPlans, planning brief pointer, and Codebase contract files.
- [x] 2026-05-13: Hardened the generated route-shape contract after review; repo-generation contracts and tests now exclude the old root `apps/web/app/**` source tree as one class and assert the generated repo keeps the template's `apps/web/src/app` route groups for marketing, auth, and app surfaces.
- [x] 2026-05-13: Advanced the current planning brief to `planning-brief-5.md` for the richer Starter template app slice.
- [x] 2026-05-13: Completed `Beef Up Starter Template App`; the generated Starter app now replaces the Notes sample with `/chat`, Convex conversations/messages, a ChatGPT-style model picker and composer, server-only OpenAI Responses API streaming, setup-gated `OPENAI_API_KEY`, and updated generated-output proof.
- [x] 2026-05-13: Advanced the current planning brief to `planning-brief-6.md` for the direct no-questions Starter download path.
- [x] 2026-05-14: Completed `Add Direct Template Download Path`; Starter Home now links to signed `GET /api/download/starter-template` URLs, and the route generates `ai-chat-starter.zip` from compiler-owned default facts through the same dynamic repo-generation pipeline as Review downloads.
- [x] 2026-05-14: Advanced the current planning brief to `planning-brief-7.md` for template update and release proof docs closeout.
- [x] 2026-05-14: Completed `Template Update And Release Proof Docs`; docs now describe the direct generated template route, the release workflow records the Convex billing sync boundary preflight, and the Program packet is ready for the completed lane.

## Decision Log

Decision: Use a Program rather than one ExecPlan.
Rationale: The work spans billing proof, template source architecture, generator integration, app-template product work, and release/operator docs.
Date: 2026-05-13.

Decision: Parameterize hosted billing proof before template-source work.
Rationale: Billing proof is smaller, billing-sensitive, and directly hardens the newly split Starter and Workers checkout paths.
Date: 2026-05-13.

Decision: Keep Starter as the default hosted proof target while making Workers selectable with `--offer=workers`.
Rationale: Existing production and dev release proof workflows should keep proving Starter unless the operator explicitly asks for Workers, but Workers can no longer be a second-class checkout lane.
Date: 2026-05-13.

Decision: Treat the billing proof destination assertion as product route destination rather than Stripe Connect transfer destination.
Rationale: The app currently uses direct Stripe Checkout with managed prices and no Connect destination account. The offer-specific destination that exists today is Starter `/starter/home` versus Workers `/workers/setup`.
Date: 2026-05-13.

Decision: Keep the compiler as the zip producer.
Rationale: The generated zip must stay tied to intake facts, generated docs, Program material, ExecPlans, design truth, and validation contracts. A static zip would drift.
Date: 2026-05-13.

Decision: Keep direct Starter template defaults in the compiler.
Rationale: The compiler owns generated repo truth. A compiler-owned default project definition lets the direct route, focused tests, and future CLI surfaces generate the same deterministic `ai-chat-starter` repo without duplicating product facts in the web app.
Date: 2026-05-14.

Decision: Make the direct Starter template route provider-free, signed, and rate-limited.
Rationale: The no-questions template path should not require live Clerk, Convex, Stripe, OpenAI, questionnaire state, or Review readiness inside the zip route. Starter Home already proves access before rendering, so a short-lived server-signed token avoids a public expensive zip endpoint while a dedicated rate-limit bucket protects the route and preserves the default generated repo contract.
Date: 2026-05-14.

Decision: Require Convex billing sync boundary preflight in release billing proof.
Rationale: Stripe webhook verification alone does not prove paid access state can safely cross into Convex. Release proof should fail before checkout if the trusted sync mutation secret or customer-owner lookup boundary is missing.
Date: 2026-05-14.

Decision: Defer refund webhook events until refund reconciliation changes product state.
Rationale: Listening to `charge.refunded` without updating entitlement or access state creates false confidence. Refund events should return only with a product-state reconciliation path and focused proof.
Date: 2026-05-14.

Decision: Consume pinned template source, not a mutable live remote branch.
Rationale: Customer downloads must be deterministic and auditable. An external template repo can exist later, but the generator should consume a pinned source snapshot with recorded provenance.
Date: 2026-05-13.

Decision: Start with a repo-local Starter template source tree.
Rationale: A local source tree gives customers deterministic, tested output on day one; gives coding agents a clear, dry, inspectable path; and gives developers one strong template surface without live fetch drift, static zip drift, or repeated renderer logic.
Date: 2026-05-13.

Decision: Seed the Starter template source from `~/Developer/next-js-convex-clerk-stripe-template`.
Rationale: That sibling repo already has the stronger Next.js, Convex, Clerk, Stripe, Tailwind, shadcn/ui, Resend, PostHog, and Sentry architecture we want: route groups, provider lanes, Convex-owned domain logic, Stripe-to-Convex billing sync, typed env boundaries, tests, and contributor conventions. The Program should import or copy a pinned, audited snapshot of that repo into `templates/starter-app/` rather than building the template from the current generated shell.
Date: 2026-05-13.

Decision: Pin the initial sibling template source by content digest instead of git commit.
Rationale: The sibling seed directory did not contain `.git` metadata at import time. `templates/starter-app/template-source.json` records a deterministic digest and file count over the committed source snapshot so future changes must update provenance explicitly.
Date: 2026-05-13.

Decision: Keep the imported source snapshot in `templates/starter-app/source` with metadata beside it.
Rationale: Keeping manifest and template docs outside `source/` prevents those Ship by Sunday ownership files from accidentally becoming customer template files when future generator code copies the source tree.
Date: 2026-05-13.

Decision: Record the source layout mismatch for the next slice instead of solving it implicitly.
Rationale: The sibling seed is a single Next.js app root, while current generated output is a minimal monorepo. Generator migration should name and test the materialization mapping rather than hiding that choice in a broad copy operation.
Date: 2026-05-13.

Decision: Map the single-app template source into generated `apps/web/`.
Rationale: Current generated repos need to keep their monorepo root scripts, workspace packages, docs, Program material, and validation commands. Mapping source paths into `apps/web/` lets the generator consume the pinned app source while preserving the generated repo contract customers already receive.
Date: 2026-05-13.

Decision: Keep the first materialized source subset no-provider safe.
Rationale: The sibling source contains provider-heavy Sentry, Resend, API route, and source-test files that are valuable template material but would make clean-room generated repos require live provider setup too early. The adapter excludes those files explicitly, and generated stubs keep dependent Convex seams type-safe until provider setup and template app slices activate them deliberately.
Date: 2026-05-13.

Decision: Target generated app overlays at `apps/web/src/app`.
Rationale: The pinned template uses Next.js `src/app`. Leaving generated overlays under root `apps/web/app` would create competing app trees. Retargeting overlays to `src/app` keeps the source layout coherent and preserves generated product/design truth.
Date: 2026-05-13.

Decision: Enforce generated overlay policy during repo snapshot materialization.
Rationale: `templates/starter-app/template-source.json` is the source of truth for every generated app overlay under `apps/web`, including additions that do not correspond to an existing pinned source file. Enforcing it before the final merge prevents accidental replacement or addition of provider-heavy or unsafe template files while preserving the settled rule that allowed generated overlays win after materialization.
Date: 2026-05-13.

Decision: Keep generated billing actions disabled until billing routes are deliberately materialized.
Rationale: The no-provider subset intentionally excludes provider-heavy API route handlers. The generated UI should not post forms to missing checkout or portal routes; setup-focused slices should activate those handlers with provider proof instead.
Date: 2026-05-13.

Decision: Do not ship the source repository `bun.lock` into generated Starter repos.
Rationale: The generated repo has a smaller workspace graph than this source repository. Inheriting the source lockfile makes Bun prune unrelated workspace transitive packages during clean-room installs. Generated repos should still use Bun, but should create their own first lockfile with `bun install` from the generated package graph.
Date: 2026-05-13.

Decision: Keep the Starter template source under `templates/`, outside runtime app ownership.
Rationale: The template should be inspectable and testable source, but it should not live inside `apps/web` or any production route tree where Next.js, app imports, or runtime deployment can accidentally treat it as live application code. `templates/starter-app/` makes the boundary obvious.
Date: 2026-05-13.

Decision: Make `templates/starter-app/` repo-shaped, not just an app-folder fixture.
Rationale: Customers receive a repo, so the template source should look like the generated repo: root package scripts, `apps/web/`, docs, and supporting files. This improves customer polish, lets coding agents reason from the same shape they will modify after download, and avoids generator logic that has to synthesize repo structure from scattered fixtures.
Date: 2026-05-13.

Decision: Keep the generated Starter shape as a minimal monorepo.
Rationale: Current generated output and operating-pack checks already expect root scripts, workspace package boundaries, generated docs, Program checks, and package-backed validation. A small intentional monorepo gives customers and agents a professional repo shape without forcing the generator to flatten package contracts or duplicate source.
Date: 2026-05-13.

Decision: Preserve no-provider local validation for generated repos.
Rationale: Buyers should be able to install, typecheck, and inspect the generated repo before creating Clerk, Convex, or Stripe projects.
Date: 2026-05-13.

Decision: Represent Clerk, Convex, and Stripe setup as generated first-program ExecPlans.
Rationale: Provider setup is real customer work and should live in the same durable Program/ExecPlan loop as product work. The generated repo should guide the customer through setup with checked-in, resumable plans instead of loose prose or chat-only instructions.
Date: 2026-05-13.

Decision: Reuse or adapt the local runner docs operating-system contracts for generated Starter repos.
Rationale: The local runner already contains stronger Program and ExecPlan linting, child-plan writing, docs-spine adoption, compatibility smoke coverage, and package-script conventions. The generated Starter should inherit that proven operating model where possible instead of maintaining an unrelated lightweight clone.
Date: 2026-05-13.

Decision: Ship the full first-program setup roadmap in the generated repo.
Rationale: The best customer, coding-agent, and developer experience is a complete ordered roadmap on day one. The generated Program should include child ExecPlans for core boot, Clerk setup, Convex setup, Stripe setup, and the first product slice, with `Next Slice` pointing at core boot and later plans explicitly blocked on prior proof. `program:write-child-plan` should remain available for later product work, not be required to create the initial setup roadmap.
Date: 2026-05-13.

Decision: Include provider dependencies and dormant integration seams in the Starter template source.
Rationale: The downloaded repo should feel like a serious app starter immediately, and agents should have stable, typed files to finish rather than inventing Clerk, Convex, and Stripe architecture from scratch. The template should install and typecheck with provider packages present, show setup states when env vars are missing, and let setup ExecPlans activate real provider behavior through configuration and proof.
Date: 2026-05-13.

Decision: Use polished setup-gated provider states instead of fake local provider behavior.
Rationale: Fake auth, data, and billing create drift, brittle tests, and misleading customer confidence. The public app should work immediately, while provider-dependent areas should render clear setup states that name missing Clerk, Convex, or Stripe configuration and point to the active setup ExecPlan. Real provider behavior should turn on only after the corresponding setup proof passes.
Date: 2026-05-13.

Decision: Replace the sibling template's Notes example with a ChatGPT-style BYO OpenAI chat app.
Rationale: Notes proves the technical path, but the Starter offer should give buyers a recognizable AI product they can use and customize immediately. The template should preserve the sibling repo's architecture, billing, auth, Convex, and test patterns while swapping the sample domain to a polished chat app with a conversation sidebar, model picker, streaming assistant output, setup-gated provider config, and generated operating docs.
Date: 2026-05-13.

Decision: Treat ChatGPT as the default behavior spec for the template chat product.
Rationale: The generated Starter chat app should behave like a polished ChatGPT clone unless this Program explicitly records a different choice. Future agents should not re-litigate basic chat behavior one affordance at a time. For chat UX questions such as sidebar behavior, conversation creation, rename, delete, regenerate, stop, model switching, composer behavior, empty states, and mobile layout, implementation should copy ChatGPT's current user-facing behavior as closely as practical within the sibling template architecture, then document any intentional divergence.
Date: 2026-05-13.

Decision: Supersede the Worker Dashboard Threads direction.
Rationale: The Worker Dashboard reference was useful research, but the customer-facing template should now be a ChatGPT-style chat clone rather than a Worker operational threads screen. Future implementation should avoid Worker Dashboard route naming, local-runner concepts, and thread-console patterns except where general chat UX learnings apply.
Date: 2026-05-13.

Decision: Let the template user choose the model in the chat UI.
Rationale: A ChatGPT-style template should include a visible model selector. The selector should choose from an app-owned allowlist of supported OpenAI model ids, persist the selected model for the conversation or user workspace preference, and record the actual model used on each assistant response for debugging and proof.
Date: 2026-05-13.

Decision: Store model selection on the conversation, with a remembered default for new conversations.
Rationale: This gives the most ChatGPT-like behavior without creating brittle state. The active conversation's selected model is the source of truth for a send. New conversations inherit a default model from the viewer or workspace preference. Each assistant message records the actual model used so later model changes do not rewrite history and proof remains inspectable.
Date: 2026-05-13.

Decision: Changing the selected model affects future responses in the same conversation.
Rationale: Match ChatGPT's user-facing behavior: model selection is an in-conversation control, not a fork button. Existing messages keep their recorded model. Updating the conversation's selected model changes the next send and future regenerations unless the user changes it again. Forking can be added later as a separate branch/share feature if a customer product needs it.
Date: 2026-05-13.

Decision: Present ChatGPT-style model labels instead of raw model ids.
Rationale: The chat UI should copy ChatGPT's model-picker feel. Users should see product labels such as Instant, Thinking, and Pro-style options, not raw API ids. The implementation should map those labels to raw OpenAI model ids in a typed allowlist, persist the raw id used for each assistant response, and keep unavailable models hidden or disabled through config rather than letting users type arbitrary model ids.
Date: 2026-05-13.

Decision: Include `Auto` as the default visible model option.
Rationale: ChatGPT's picker emphasizes an automatic/default mode before advanced choices. The template should expose `Auto` by default, backed by the app's configured default model/routing choice, with explicit choices such as Instant, Thinking, and Pro-style modes available through the same allowlist. This keeps the UI familiar while leaving room for smarter routing later.
Date: 2026-05-13.

Decision: Include conversation auto-title, rename, and delete in v1.
Rationale: A ChatGPT-style starter needs a real conversation sidebar. New conversations should receive a useful title from the first user message, users should be able to rename conversations inline or through a menu, and delete should require confirmation. This is small enough for v1 and makes the generated template feel materially more complete.
Date: 2026-05-13.

Decision: Treat BYO OpenAI key ownership as template-buyer/operator owned for v1.
Rationale: BYO key means the customer using the generated template supplies their own OpenAI or ChatGPT API key for their app. It does not mean the generated app should store arbitrary end-user API keys in the first implementation. This keeps the first slice simpler, safer, and easier to prove while leaving end-user key storage for a separate security-sensitive feature if the customer's product needs it.
Date: 2026-05-13.

Decision: Configure the BYO OpenAI key through environment variables in v1.
Rationale: The generated template should read `OPENAI_API_KEY` from local or deployment environment configuration, not from a persisted settings UI. The app can surface an OpenAI setup state that tells the template user where the key belongs, but key storage, encryption, rotation UI, and per-user secrets should remain out of the first template slice.
Date: 2026-05-13.

Decision: Follow the sibling template architecture and conventions for the chat boundary.
Rationale: The imported template's docs are the source of truth for its architecture: model product concepts in Convex first, keep provider payloads out of primary application state, use route handlers or Convex actions for third-party side effects, and validate optional environment variables at the boundary that uses them. For the ChatGPT-style sample, conversation and message state should be Convex-owned product data, and the OpenAI call should be a Convex action by default because it is feature behavior tied to Convex persistence rather than a narrow Next.js integration endpoint like Stripe webhook or billing redirect.
Date: 2026-05-13.

Decision: Use `/chat` as the primary protected product route in the generated Starter template.
Rationale: The template should open directly to the recognizable AI product surface. `/chat` is clearer than `/threads` for a ChatGPT-style starter and avoids carrying Worker Dashboard naming into customer output.
Date: 2026-05-13.

Decision: Protect `/chat` with Clerk and workspace-scoped Convex authorization, while using Stripe entitlements for usage limits.
Rationale: The sibling template's current Notes workflow protects the route with Clerk, resolves workspace access through Convex, and uses Stripe-derived entitlements for plan-aware limits rather than making the route itself subscription-only. The chat sample should follow that convention: signed-in workspace users can open the screen, Convex enforces workspace ownership, and entitlement state gates limits such as free usage versus unlimited usage.
Date: 2026-05-13.

Decision: Give free workspaces 25 assistant messages and paid workspaces the `chat_unlimited` entitlement.
Rationale: This mirrors the sibling Notes sample closely enough for coding agents to port the pattern, while making the billing limit meaningful for an AI app. The free limit should count assistant messages generated by the model, not local drafts or failed attempts. Paid workspaces should receive a `chat_unlimited` entitlement from the existing Stripe entitlement sync path.
Date: 2026-05-13.

Decision: Use OpenAI `previous_response_id` as the primary chat continuation strategy.
Rationale: The generated app should keep Convex as the source of truth for visible conversation and message state, but it should not replay the entire local message history on every OpenAI call by default. Store the latest OpenAI response id on the conversation and store response ids on assistant messages so each new turn can pass the new user input plus `previous_response_id`. This follows the current OpenAI Responses API guidance for lightweight response-to-response continuation.
Date: 2026-05-13.

Decision: Explicitly use OpenAI Responses API storage for the chat sample.
Rationale: `previous_response_id` depends on OpenAI-managed response state. The template should call the Responses API with `store: true`, record response ids in Convex, and document that conversation continuation uses OpenAI response storage while Convex remains the app-visible source of truth for conversations and messages.
Date: 2026-05-13.

Decision: Streaming assistant output is required for chat v1.
Rationale: The template should feel like a real AI product, not a blocking form submission. The send-message path must render assistant output as it arrives from the Responses API stream while still preserving the Convex-owned conversation/message state, usage counting, selected model, and final response id.
Date: 2026-05-13.

Decision: Use Convex-backed realtime updates for streaming.
Rationale: The sibling template architecture says Convex owns product state, and the UI should read app state from Convex rather than provider-shaped streams. The chat send action should consume the OpenAI Responses stream server-side, create or update an assistant message with `status: "streaming"`, write buffered partial text to Convex on a throttle, then finalize the message with completed content, usage metadata, selected model, and OpenAI response id. The UI should subscribe to Convex messages and render the assistant text as it changes.
Date: 2026-05-13.

Decision: Allow only one in-flight assistant response per conversation in v1.
Rationale: A single in-flight response keeps `previous_response_id`, entitlement counting, streaming message updates, and UI state coherent. The send-message path should reject or block a second send while the conversation has an assistant message with `status: "streaming"`, then return to an idle state only after the assistant message is completed or failed.
Date: 2026-05-13.

Decision: Keep failed assistant messages visible with retry.
Rationale: Failed streams are real product state. The template should preserve a failed assistant message, keep any partial text that arrived, mark it with `status: "failed"`, show a safe error label, and expose a retry action. Failed assistant messages should not count against the free assistant-message limit.
Date: 2026-05-13.

Decision: Retry failed assistant responses in place.
Rationale: The retry experience should feel like ChatGPT-style regenerate: the failed assistant slot shows a retry action, then that same slot streams the replacement response. This is cleaner for customers than adding another assistant bubble for the same user prompt, and it keeps the schema and tests focused. The message should keep bounded attempt metadata such as retry count, last error label, and the previous OpenAI response id used for the retry, while the visible message content becomes the current attempt.
Date: 2026-05-13.

## Slice Ledger

Active child ExecPlans:

- None currently.

Planned child ExecPlans:

- None.

Completed child ExecPlans:

- [Parameterize Hosted Billing Proof By Offer](../../../exec-plans/completed/2026-05-13-parameterize-hosted-billing-proof-by-offer.md) shipped Starter/Workers hosted proof selection, release proof planner propagation, offer-specific assertions, docs, and focused validation.
- [Introduce Pinned Starter Template Source](../../../exec-plans/completed/2026-05-13-introduce-pinned-starter-template-source.md) imported the sibling skeleton into a repo-local pinned source snapshot, added provenance and overlay docs, and added compiler-side source validation.
- [Migrate Generated Template App To Template Source](../../../exec-plans/completed/2026-05-13-migrate-generated-template-app-to-template-source.md) connected generated repo materialization to the pinned source snapshot, mapped source files into `apps/web/`, retargeted generated overlays, and preserved clean-room no-provider proof.
- [Upgrade Generated Starter Operating Pack](../../../exec-plans/completed/2026-05-13-upgrade-generated-starter-operating-pack.md) made generated customer downloads ship a first Program with ordered setup ExecPlans, active child-plan link validation, and onboarding/skill instructions that route provider setup through those plans.
- [Beef Up Starter Template App](../../../exec-plans/completed/2026-05-13-beef-up-starter-template-app.md) replaced the customer-facing Notes sample with the protected `/chat` product surface, Convex-owned chat state, server-only OpenAI streaming, setup-gated OpenAI config, updated template provenance, and preserved clean-room no-provider proof.
- [Add Direct Template Download Path](../../../exec-plans/completed/2026-05-13-add-direct-template-download-path.md) added compiler-owned default Starter facts, signed `GET /api/download/starter-template` links, the Starter Home direct download action, and focused zip/route/UI tests proving the path uses dynamic generation.
- [Template Update And Release Proof Docs](../../../exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md) closed the Program by documenting the direct generated template route, confirming product-specific billing proof docs, and preserving the template update and release proof contract.

## Next Slice

No required next slice remains for this Program. Future work that changes the pinned template source, generated app contract, or billing proof should start from a new Program or a focused ExecPlan that cites this completed packet.

## Risks and Watchpoints

Do not make a static zip the source of truth. The generator must keep producing the customer download so generated facts, docs, Program material, ExecPlans, skills, package scripts, and template source stay together.

Do not fetch mutable template source during a customer download. If an external template repo is added later, import or pin it through an explicit update process and lock metadata.

Do not treat the sibling template as a runtime dependency. It is a source seed. Customer downloads should consume the pinned repo-local `templates/starter-app/` snapshot plus generated overlays, not reach into `~/Developer/next-js-convex-clerk-stripe-template` at request time.

Do not let Workers proof remain second-class. Starter can be the default proof target, but Workers needs a way to be proven through the same harness.

Do not make the richer template require live Clerk, Convex, or Stripe configuration just to typecheck or open. Provider setup can be the next step after the repo boots.

Do not leave Clerk, Convex, and Stripe architecture for later ad hoc implementation. The template should own typed provider seams and dependency wiring from day one, but those seams must remain no-provider safe until the corresponding setup ExecPlan proves live configuration.

Do not implement fake local auth, fake billing, or fake provider data as the primary no-provider experience. No-provider mode should be a polished setup-gated experience with actionable missing-config states.

Do not preserve the sibling template's Notes use case as the customer-facing sample. Preserve its architectural slice and tests, but adapt the domain to a ChatGPT-style BYO OpenAI chat app.

Do not copy Worker Dashboard runtime internals or route naming into the Starter template. The Worker Dashboard Threads direction has been superseded by the ChatGPT-style chat template.

Do not expose customer OpenAI or ChatGPT API keys to client components. BYO key behavior is template-buyer/operator owned for v1 and should follow the sibling template's server-only integration conventions: Convex owns conversation/message product data, a Convex action performs the OpenAI side effect by default, optional env is validated at that boundary, and proof must cover the configured path.

Do not count failed OpenAI calls or unsent drafts against the free usage limit. The limit is for persisted assistant messages that prove the model returned usable output.

Do not mix multiple conversation-state strategies in the same conversation unless a later slice deliberately designs migration or fallback behavior. Convex should own app-visible message state, while OpenAI `previous_response_id` owns model continuation for the first implementation.

Do not set `store: false` in the chat sample while also depending on `previous_response_id`. If a customer wants local-only replay later, that should be a deliberate variant with a different conversation-state strategy.

Do not let the model picker accept arbitrary unvalidated model ids in v1. The UI should copy ChatGPT-style labels and choose from a maintained allowlist so the generated app has predictable tests and docs.

Do not ask for bespoke product behavior when ChatGPT already has a clear default. Ask only when the template needs to intentionally diverge from ChatGPT or when the decision is outside chat UX.

Do not fork or duplicate a conversation merely because the user changes the selected model. Model changes apply to future assistant responses in the active conversation.

Do not make conversation deletion ambiguous. Delete should require an explicit confirmation and remove or archive the conversation and its messages according to the implementation's chosen data-retention contract.

Do not satisfy the streaming requirement by leaving the final assistant message unpersisted until page refresh. Streaming should be visible in the UI and resolve into durable Convex message state.

Do not write every token or tiny delta to Convex. Streaming persistence should be throttled or buffered so the sample demonstrates realtime UX without creating unnecessary write pressure.

Do not split the primary chat product behavior between a Next.js SSE stream and Convex state in v1. Next route handlers remain available for narrow integration endpoints, but the sample's streaming product state should be Convex-backed.

Do not allow parallel assistant generations inside the same conversation in v1. That would create OpenAI response-id races, duplicate provider calls, confusing partial-message state, and ambiguous usage accounting.

Do not delete failed assistant messages automatically. Hiding failed state makes debugging harder and teaches customers the wrong pattern for AI product work.

Do not create a new assistant message for the default retry path. New assistant messages should represent new turns, not retries of the same failed turn.

Do not collapse provider setup into untracked instructions. Clerk, Convex, and Stripe setup should appear in the generated customer's first Program as ordered ExecPlans with explicit validation, blocked-proof states, and handoff notes. Generate the first-program roadmap up front instead of making customers or agents create the initial provider plans manually.

Do not fork the Program/ExecPlan operating model without checking the local runner docs operating-system and Worker Foundations install code first. If the generator needs a smaller customer-safe subset, derive it deliberately from those contracts.

Do not reintroduce Worker local-runner code, Codex bridge internals, protected Worker routes, private Program archives, local paths, or secrets into generated Starter output.

Do not let generated overlays overwrite the template source unpredictably. The template-source contract should define which files the generator may replace and why.

## Outcomes & Retrospective

Completed on 2026-05-14. Hosted billing proof now verifies Starter by default and Workers when selected, with offer-specific route, metadata, amount, and access expectations plus a Convex billing sync boundary preflight. The generated Starter repo now comes from a pinned repo-local template source snapshot, generated overlays, generated docs, a first customer Program, setup ExecPlans, skills, validation scripts, and template provenance rather than a static zip or mutable remote fetch.

The customer-facing template now ships as a ChatGPT-style BYO OpenAI starter with `/chat`, Convex-owned conversation state, server-only OpenAI streaming, setup-gated provider configuration, and no-provider-safe validation. Starter Home now also offers a direct template-first download through signed `GET /api/download/starter-template` links; that route generates `ai-chat-starter.zip` from compiler-owned default facts through the same zip builder as the authenticated Review download.

Closeout validation passed: direct generated zip tests, direct route integration, Starter Home rendered-link coverage, billing webhook and sync-boundary unit tests, production proof workflow tests, both closeout ExecPlan lints, Program lint, targeted markdown metadata lint, `git diff --check`, `bun run format`, `bun lint`, and `bun typecheck`.

The main durability lesson is that the template is now a source and proof system, not an artifact. Future changes must update template source, manifest provenance, generated overlays, generated output tests, docs, and proof together.

## Validation and Acceptance

Program-level acceptance requires billing proof to run for Starter and Workers with offer-specific metadata, amount, destination, and access expectations. Billing proof must keep the existing approval gate so Stripe checkout cannot run accidentally.

Generated repo acceptance requires a pinned template-source pipeline that does not rely on a static zip or live mutable remote branch. The generated repo must include template version/provenance metadata, generated overlays from intake facts, generated docs, Program material, ExecPlans, skills, and validation scripts.

The Starter template must be a credible app starter. It should include a real public homepage, auth-ready protected shell, dashboard/home screen, settings/account area, provider setup affordances, generated design-system wiring, and one example domain flow. That domain flow should be a ChatGPT-style BYO OpenAI chat app with a conversation sidebar, model picker, message timeline, streaming composer, setup/status affordances, and mobile-responsive behavior. It must continue to pass no-provider clean-room validation.

Chat-clone acceptance requires future implementation and review to compare the generated `/chat` behavior against current ChatGPT user-facing behavior and record any intentional divergence in the child ExecPlan or implementation notes.

The Starter template source should inherit the sibling repo's file-system pattern: `src/app/(marketing)`, `src/app/(auth)`, `src/app/(app)`, explicit `api/` integration endpoints, Convex-owned domain logic, reusable app/layout/ui components, provider boundaries under `src/lib/`, and tests near the behavior they prove.

The generated operating pack must include the Program/ExecPlan machinery needed to run setup and first product work: Program and ExecPlan contracts, lint scripts, prompt assets or skills, a first customer Program, and active child ExecPlans for core boot, Clerk setup, Convex setup, Stripe setup, and the first product slice. Clerk, Convex, and Stripe setup must be represented as durable plans, not only README steps.

The template-source acceptance bar includes provider packages, typed env parsing, setup-state UI, and stable integration seams for Clerk, Convex, and Stripe. Missing env must produce clear setup states or blocked proof, not broken installs, fake success, or hidden runtime crashes.

No-provider app acceptance requires a working public homepage and setup-gated app states that identify missing provider configuration. The app must not pretend checkout, identity, or persistence worked when the real provider is absent.

BYO-AI acceptance requires model-provider calls to stay behind the sibling template's server-only integration boundary, no client exposure of API keys, a polished missing-key setup state for absent `OPENAI_API_KEY`, and proof that a configured key can send and persist a chat message through the app's real Convex data path. The default boundary is a Convex action because chat is product behavior backed by Convex-owned conversation/message state.

Billing-limit acceptance requires free workspaces to be limited to 25 persisted assistant messages and paid workspaces to bypass that limit through a `chat_unlimited` entitlement derived from Stripe state.

Conversation-state acceptance requires each conversation to persist the latest OpenAI response id, each assistant message to record its OpenAI response id when available, and the send-message path to pass `previous_response_id` instead of replaying full Convex history by default.

OpenAI storage acceptance requires the setup docs and generated Program to state that the sample uses `store: true` for Responses API continuation, and that Convex stores the UI-visible messages plus response ids rather than acting as the only model context store.

Model-picker acceptance requires the chat UI to let the template user select from a supported model allowlist, store the active selection on the conversation, seed new conversations from a remembered viewer or workspace default, and record the actual model used on each assistant message.

Model-change acceptance requires switching the selected model in an existing conversation to affect only future assistant responses. Previous messages must retain their recorded model metadata, and the conversation should not fork automatically.

Model-label acceptance requires the visible picker to use ChatGPT-style labels, the code to map those labels to raw OpenAI model ids through a typed allowlist, and each assistant message to record both the label/mode selected and the raw model id used.

Auto-model acceptance requires `Auto` to be the default visible model choice for new conversations, to map to a configured concrete model or routing policy in code, and to record both `Auto` and the resolved raw model id on each assistant message.

Conversation-sidebar acceptance requires auto-title from the first user message, manual rename, delete with confirmation, and visible empty/sidebar states that still work on mobile.

Streaming acceptance requires the UI to render assistant text incrementally from Responses API streaming events and finalize the persisted assistant message with status, content, and OpenAI response id when the stream completes.

Convex-streaming acceptance requires a send-message flow that persists the user message, creates a streaming assistant message, writes partial assistant text through throttled Convex updates, marks failed streams explicitly, and counts only completed assistant messages against the free limit.

In-flight acceptance requires the conversation or latest assistant message state to prevent a second send while streaming is active, with a clear UI state explaining that a response is in progress.

Failure-state acceptance requires interrupted or failed streams to leave a durable failed assistant message, preserve partial assistant text when present, show a retry action, and exclude failed assistant messages from free usage counting.

Retry acceptance requires the retry action to reuse the failed assistant message slot, increment attempt metadata, stream replacement content into that same slot, use the last completed OpenAI response id before the failed attempt, and count the message only if the retry completes.

The direct no-questions Starter path must use the same generator pipeline with default facts. It must not point at a separate artifact or separate zip.

## Artifacts and Notes

Current proof commands that matter include:

    bun run release:proof:dev-payment
    bun run release:proof -- --proof=billing_integration
    bun run release:proof -- --proof=billing_integration --offer=workers
    bun test packages/codebase-compiler/tests/generated-repo-command-contract.test.ts

Current generated repo creation flows through:

    apps/web/src/app/api/download/repo/route.ts
    apps/web/src/app/api/download/starter-template/route.ts
    packages/codebase-compiler/src/bundle/build-review-download-zip.ts
    packages/codebase-compiler/src/repo-generation/default-starter-template-project-definition.ts
    packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    packages/codebase-compiler/src/repo-generation/materialize-starter-template-source.ts
    packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts

Current pinned template source boundary:

    templates/starter-app/source
    templates/starter-app/template-source.json
    packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts

## Interfaces and Dependencies

This Program depends on checkout proof code under `apps/web/scripts/`, release proof orchestration under `scripts/release/`, checkout route tests under `apps/web/tests/`, pinned template source under `templates/starter-app/`, generated repo source under `packages/codebase-compiler/src/repo-generation/`, generated repo tests under `packages/codebase-compiler/tests/`, the authenticated Starter UI source in the app route tree, and the public Starter page under `apps/web/src/app/starter/page.tsx`.
