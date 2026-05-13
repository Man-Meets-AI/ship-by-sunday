---
title: "Starter Template Source And Billing Proof Research"
summary: "Research pass mapping the current hosted billing proof, generated repo compiler, and template-app output before the next Starter hardening program."
docType: "research_pass"
status: "active"
read_when:
  - "Planning product-specific hosted billing proof."
  - "Planning how the Starter template source should feed generated repo zips."
  - "Checking what the generated Starter template contains today."
---

# Starter Template Source And Billing Proof Research

This research pass records the current repository facts behind two follow-up concerns after the public product split: hosted billing proof is still Starter-first, and the generated Starter app is runnable but still a minimal rendered shell rather than a full app template source.

## Hosted Billing Proof

The release proof entry point is `scripts/release/run-release-proof.mjs`. Its `billing_integration` proof delegates to `scripts/release/lib/billing-integration-step-planner.mjs`, while production and hosted checkout helpers live under `apps/web/scripts/verify-hosted-stripe-checkout.mjs`, `apps/web/scripts/verify-dev-stripe-card-payment.mjs`, and `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`.

The checkout route now requires an explicit `offerId` in the JSON body. The current hosted proof scripts use `offerId: "starter"` and the unit helper tests assert Starter-oriented expectations such as `/starter/home`, `HOMEPAGE_CHECKOUT_PROOF_PATH` being `/starter`, and Starter metadata. `apps/web/scripts/verify-dev-stripe-card-payment.mjs` also expects the Starter amount of `29_700` cents.

This means the proof can verify the split checkout route no longer rejects missing purchase intent, but it does not yet equally prove the Workers offer. Workers has a different price, capability outcome, and post-checkout destination. The proof should become product-specific so the same harness can test Starter and Workers without duplicating logic.

## Generated Repo Pipeline

Generated repo downloads are served from `apps/web/app/api/download/repo/route.ts`. That route calls `@shipbysunday/codebase-compiler/server` and returns a zip built by `packages/codebase-compiler/src/bundle/build-review-download-zip.ts`.

The zip is generated dynamically. There is no static zip artifact committed as the source of truth. `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` builds a generation manifest, collects customer-safe source files, renders overrides, renders the generated template app, renders generated design-system files, renders general starter files, and appends the generated codebase docs tree.

The customer-safe manifest currently includes root tool files, selected `apps/web` config files, and source packages needed by generated docs and presentation code. It explicitly excludes Worker routes, Worker local runner paths, Codex bridge files, Worker Convex state, and protected Worker component paths. The final review patch updated those exclusions to match `apps/web/app/(protected)/`.

## Generated Template App Today

The generated app runtime is rendered by `packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts`. It writes these key files:

- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/_content/home-page.ts`
- `apps/web/config/product.ts`
- `apps/web/config/generated-design-system.ts`
- `apps/web/next.config.ts`
- `apps/web/package.json`

The rendered app is intentionally simple. It creates a Next app with generated design tokens, product config, home-page content, and a single generated homepage that links to docs and uses the intake-derived product facts. The app package uses simplified scripts where Convex and Stripe commands print optional setup messages instead of requiring provider projects.

The generator also writes the operating pack through `render-template-overrides.ts`, `render-starter-operating-pack.ts`, `render-starter-project-onboarding.ts`, and `render-starter-skills.ts`. The output includes `README.md`, `START-HERE.md`, `DESIGN.md`, `docs/facts/project-definition.json`, `docs/facts/design-system.json`, generated Program material, generated ExecPlans, skills, bootstrap scripts, and validation scripts.

The current generated setup path already hints at the right order. `render-template-overrides.ts` tells customers to run `bun run codex:skills:install` and then follow `START-HERE.md` through `$starter-core-setup`, `$starter-auth-setup`, and `$starter-billing-setup`. `render-starter-skills.ts` defines wrapper skills for core setup, Clerk and Convex auth setup, operating-pack work, and Stripe billing setup. The gap is that `render-starter-operating-pack.ts` currently creates one active `First Product Slice` ExecPlan rather than first-class provider setup ExecPlans.

The local runner has a fuller docs operating-system surface that can inform the generated subset. `packages/local-runner/src/commands/docs-operating-system.ts` provides Program lint, ExecPlan lint, markdown/docs validation, and `write-child-plan`. The docs-spine adoption workflow renders Program and ExecPlan contract material plus prompt assets. The Worker Foundations install workflow and compatibility smoke matrix prove package-script conventions such as `programs:lint`, `plans:lint`, and `program:write-child-plan` across different repo shapes. That machinery is a better source than hand-rolling unrelated generated Program logic.

## Existing Generated Repo Proof

`packages/codebase-compiler/tests/generated-repo-command-contract.test.ts` materializes a clean generated repo in a temporary directory and runs the no-provider contract:

- `bun ci`
- `bun run programs:lint`
- `bun run plans:lint`
- `bun run codebase:contract`
- `bun run agentic:check`
- `bun run --cwd apps/web typecheck`
- `bun run --cwd apps/web dev -- --help`

That is strong enough to prove the generated output can install, validate its generated operating pack, typecheck the app, and expose a dev command without requiring Clerk, Convex, or Stripe. It does not prove a richer app template with real auth, data, billing, dashboard, and settings flows yet because those flows are not currently in the generated template app. The target template should include provider dependencies and typed seams from day one while preserving this no-provider proof shape. It should prefer setup-gated missing-config states over fake provider behavior.

## Template Source Gap

The current generated app is represented as TypeScript string renderers. That is deterministic and easy to overlay with intake facts, but it is not the right medium for building and maintaining a full Starter app experience. A real template should be developed as ordinary app source, with tests and screenshots, then consumed by the generator with generated overlays.

Fetching a template repo live at download time would make customer output nondeterministic and network-dependent. A safer shape is a pinned template source: a repo-local `templates/starter-app/` source tree for the first implementation, with an optional later update/import workflow from an external `starter-template` repository. If an external repo is used, the generator should consume a committed, pinned, audited copy or a pinned archive with lock metadata, not fetch a mutable remote branch while a customer is waiting for a zip.

## Sibling Template Source Candidate

The sibling repo at `~/Developer/next-js-convex-clerk-stripe-template` is a strong seed for the Starter template source. It uses Next.js 16, React 19, Convex, Clerk, Stripe, Tailwind, shadcn-style local UI components, Resend, PostHog, and Sentry. Its route groups are `src/app/(marketing)`, `src/app/(auth)`, and `src/app/(app)`, with explicit API integration endpoints. It has provider boundaries under `src/lib/`, reusable layout/app/ui components, Convex schema and domain modules, and tests for billing routes, Stripe sync, Convex auth, notes rules, and public chrome.

Its architecture docs assign ownership clearly: Next.js owns routing and integration endpoints, Convex owns application data/domain/authorization, Clerk owns identity and route protection, Stripe owns checkout/portal/subscription lifecycle, and billing UI reads normalized Convex state. Its conventions explicitly keep provider payloads out of primary application state and keep product auth rules in Convex helpers rather than Clerk metadata or component checks.

Those same docs answer the chat integration boundary. The template should model product concepts in Convex first, validate optional environment variables at the boundary that uses them, and use route handlers or Convex actions for third-party side effects. For this Program, the ChatGPT-style sample should use Convex-owned `conversations` and `messages` state and a Convex action for the OpenAI side effect by default. A Next.js route handler remains appropriate for narrow integration endpoints such as webhooks and redirects, but the first chat implementation should not choose a route handler merely to avoid using the template's product-domain conventions.

The current sample workflow is Notes. That should be adapted, not preserved as-is. The Starter template should keep the same architectural slice but replace Notes with a ChatGPT-style BYO OpenAI chat app, then layer Ship by Sunday's generated docs spine, Program packet, provider setup ExecPlans, generated product facts, design facts, and customer-safe skills into the imported template source.

## ChatGPT-Style Chat Reference

The Worker Dashboard Threads research has been superseded for the customer-facing template. The selected sample is now a ChatGPT-style chat app: a protected `/chat` route with a conversation sidebar, model picker, message timeline, streaming assistant output, regenerate/retry behavior, and setup-gated OpenAI configuration.

ChatGPT is the default behavior spec for ordinary chat UX. Future agents should compare against current ChatGPT behavior during the implementation slice and copy it unless a child ExecPlan records a deliberate divergence. This applies to the sidebar, conversation creation, rename, delete, regenerate, stop, model switching, composer behavior, empty states, and responsive layout.

The sibling sample's auth and billing model is concrete. `src/proxy.ts` protects `/notes`, `/dashboard`, `/billing`, and billing/debug APIs through Clerk. `convex/notes.ts` resolves the current workspace through Convex auth helpers and enforces a `notes_unlimited` entitlement only when creating notes beyond the free limit. The route itself is not subscription-only. Chat should follow that model: Clerk protects `/chat`, Convex owns workspace authorization for conversation data, and Stripe-derived entitlement state gates usage limits.

The concrete chat limit decision is 25 free assistant messages and a `chat_unlimited` entitlement for paid workspaces. This deliberately tracks the sibling sample's 25-note free limit while changing the counted unit to persisted assistant responses.

The BYO-AI part should be implemented as a provider seam, not as client-side key handling. OpenAI's current GPT-5.5 guidance points API work toward the Responses API and server-mediated conversation state patterns. The Program decision is that BYO key means customer/operator-owned key usage for v1: the template buyer supplies their own OpenAI or ChatGPT key for the generated app through `OPENAI_API_KEY` in local or deployment environment configuration, while settings UI and end-user-entered key storage remain out of scope unless a later customer product explicitly needs them.

The model-selection decision is to expose a model picker in the chat UI. The picker should be backed by an app-owned supported-model allowlist. The active conversation's selected model should be the source of truth for a send, new conversations should inherit a remembered default model from the viewer or workspace preference, and each assistant message should record the model actually used.

The model-change decision is to match ChatGPT's practical behavior: changing the selected model affects future responses in the same conversation rather than forking the conversation. Existing messages retain the model metadata they were created with. Official ChatGPT Help Center material describes the model selector as the way paid users switch between models, and ChatGPT release notes describe regenerating responses with stronger models from the response menu; the template should mirror that pattern without adding automatic forks.

The model-label decision is also ChatGPT-style. The UI should show readable mode labels such as Instant, Thinking, and Pro-style choices, while the implementation maps those labels to raw OpenAI model ids through a typed allowlist. The raw id still belongs in persisted assistant-message metadata for proof and debugging.

`Auto` should be the default visible model choice. In the first implementation it can resolve to a configured concrete model or simple routing policy, but persisting both the selected label and resolved raw model id keeps future routing changes auditable.

The ChatGPT-style sidebar should include conversation auto-title, manual rename, and confirmed delete in v1. These are core affordances for the customer experience and give future agents concrete mutation paths to extend.

The conversation-state decision is to use OpenAI `previous_response_id` for the chat continuation path. OpenAI's current docs describe this as a lightweight response-to-response continuation strategy and warn against mixing conversation-state strategies unless deliberately reconciling them. For the generated template, Convex should store app-visible messages and the latest OpenAI response id, while the OpenAI call sends only the new user input plus `previous_response_id` by default.

Because that strategy depends on OpenAI-managed response state, the template should set `store: true` explicitly and document the tradeoff. Convex remains the app-visible source of truth, but it is not the only model-context store for the sample.

Streaming is required for the chat sample. OpenAI's streaming docs describe Responses streaming over server-sent events with typed events such as `response.created`, `response.output_text.delta`, `response.completed`, and `error`. The implementation needs to read those events, show incremental assistant output, and finalize durable Convex state at completion. The docs also flag that production streaming makes moderation harder because partial completions can be harder to evaluate, so the generated setup docs should mention the partial-output tradeoff.

The chosen streaming architecture is Convex-backed realtime updates rather than a Next.js SSE route. This follows the sibling template's product-state convention: Convex owns the product data, and the UI reads application state from Convex. The send-message flow should consume OpenAI streaming events server-side, buffer deltas to avoid per-token writes, patch a streaming assistant message in Convex, and finalize the message with completed content, response id, and selected model. Failed streams should remain visible as failed assistant messages or blocked proof, not disappear.

The concurrency decision is one in-flight assistant response per conversation in v1. This is the smallest reliable shape for a template that uses `previous_response_id`: a second simultaneous generation would race on the conversation's latest response id, complicate streaming writes, and make assistant-message usage limits ambiguous.

Failed streams should stay visible. The generated app should keep failed assistant messages with partial text when available, mark them failed, provide a retry action, and exclude them from assistant-message usage counting. This is more useful to a customer and future coding agent than deleting interrupted output.

The retry decision is to retry in place. The failed assistant slot should behave like a regenerate affordance: on retry, it becomes the streaming replacement response for the same user prompt. That gives customers a clean conversation and gives agents one durable assistant-message record with status and attempt metadata instead of multiple competing assistant messages for one failed turn.

## Research Conclusions

The next work should split into several slices. First, make billing proof product-specific so Starter and Workers can both be proven. Second, introduce a real template-source boundary by importing a pinned, audited snapshot of the sibling template into `templates/starter-app/` so the generator can copy ordinary app files before applying generated overlays. Third, adapt that template into a credible Starter app with auth-ready protected shell, dashboard, settings, a ChatGPT-style BYO OpenAI chat app, provider setup docs, generated design-system wiring, and a stronger generated operating pack. Fourth, prove the no-questions Starter path by generating a default-template zip with no intake customization while keeping the customized questionnaire path.

The generated operating pack should also be upgraded. The customer's first Program should include the whole setup roadmap up front: core boot, Clerk setup, Convex setup, Stripe setup, and first product slice. Provider setup should appear as real ExecPlans before the first product slice, and the pack should reuse the strongest customer-safe parts of the local runner Program/ExecPlan tooling.
