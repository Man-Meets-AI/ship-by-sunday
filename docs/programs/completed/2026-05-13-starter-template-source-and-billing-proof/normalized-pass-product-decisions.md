---
title: "Starter Template Source And Billing Proof Normalized Decisions"
summary: "Normalized decisions for hosted billing proof parity and the future Starter template source architecture."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking the agreed product direction before writing child ExecPlans."
  - "Resolving whether the Starter template should be a static zip, rendered code, or pinned source."
---

# Starter Template Source And Billing Proof Normalized Decisions

## Track A: Billing Proof Parity

Hosted billing proof should become product-specific. Starter and Workers are separate products with separate prices, access capabilities, and post-checkout destinations. The proof harness should accept an offer choice such as `starter` or `workers`, then assert the expected Stripe metadata, PaymentIntent metadata, amount, destination, and access result for that offer.

Starter can remain the default because the existing proof is Starter-shaped today, but billing-sensitive releases should be able to run both offers.

## Track B: Template Source

Do not hand-maintain a static zip. The generated repo zip should continue to be produced by the compiler so the output stays tied to intake facts, generated docs, Program material, ExecPlans, and validation contracts.

The Starter template should stop being represented only as string-rendered app files. A real template app should exist as ordinary source. The first safe version should be repo-local and pinned. A later external template repository can exist, but customer downloads should consume a pinned, audited snapshot rather than fetch a live branch at request time.

The source seed should be `~/Developer/next-js-convex-clerk-stripe-template`. That repo already contains the desired architecture for the customer template: `src/app/(marketing)`, `src/app/(auth)`, `src/app/(app)`, explicit API integration endpoints, Convex schema and domain modules, Clerk route protection, Stripe billing through Convex state, typed env helpers, setup docs, UI components, and behavior tests. The generator should consume a copied or imported snapshot under `templates/starter-app/`, not the sibling path directly.

## Track C: Generator Integration

The generator should compose three layers:

1. pinned template source
2. generated overlays from intake facts
3. generated operating pack, docs, Program, ExecPlans, skills, and validation scripts

Generated overlays should own product truth and customization. The template should own reusable app structure and production-quality starter flows. Worker local-runner code, Worker protected routes, Codex bridge surfaces, and core Man Meets AI internals must remain excluded.

## Track D: Starter Template Product Shape

The template should become a real app starter, not a demo shell. It should include a public homepage, auth-ready protected app area, dashboard/home screen, settings/account area, provider setup path, generated design-system wiring, and one example domain object or workflow that can be replaced by the user's generated Program and first ExecPlan.

The sibling template's Notes feature should not remain the primary sample domain. Preserve the architecture, but adapt the product slice into a ChatGPT-style BYO OpenAI chat app so the Starter feels aligned with AI-heavy builders and gives customers a recognizable product to customize.

ChatGPT is the default behavior spec for chat UX. Future implementation should copy ChatGPT's current user-facing behavior for ordinary chat affordances, including sidebar behavior, conversation creation, rename, delete, regenerate, stop, model switching, composer behavior, empty states, and mobile layout. Ask for user input only when the template intentionally diverges from ChatGPT or the decision is not a chat-product behavior decision.

The chat surface should be one polished product experience rather than a sprawling sample app. It should include a conversation sidebar, model picker, message timeline, streaming composer, setup/status context, and responsive desktop/mobile behavior. It must not copy Worker runtime APIs, local-runner code, Codex bridge internals, private Worker data, protected Worker routes, or Worker Dashboard thread-console naming.

The BYO OpenAI/ChatGPT path should keep model-provider calls behind a server-side route or Convex action boundary. In v1, BYO key ownership means the template buyer/operator supplies their own OpenAI or ChatGPT key for their generated app through `OPENAI_API_KEY` in local or deployment environment configuration. It does not mean the app stores arbitrary end-user API keys or ships a key-management settings UI. Customer API keys must not be exposed to client components. Missing key/config should produce a setup-gated state and blocked proof rather than fake AI behavior.

Because the Starter template will be seeded from the sibling template, its `ARCHITECTURE.md` and `CONVENTIONS.md` should govern this boundary. The chat domain model belongs in Convex before UI work. Conversation and message state should be app-owned product data, not provider payload state. The OpenAI call should be a Convex action by default, because the sibling conventions use Convex actions for third-party side effects when those side effects are product behavior tied to Convex state. Optional OpenAI env should validate at the action boundary instead of during unrelated app startup.

The generated app's primary protected product route should be `/chat`. The route should open directly to the ChatGPT-style sample instead of hiding the main feature inside a generic dashboard. If the sibling template's shell keeps a dashboard route for orientation or billing navigation, `/chat` remains the canonical sample-product destination.

The route and paywall model should follow the sibling Notes workflow. `/chat` should be Clerk-protected and workspace-scoped through Convex authorization. Stripe-derived entitlements should gate usage limits, not basic route access. This keeps the sample app usable immediately after auth setup while still demonstrating billing-backed product limits.

Free workspaces should get 25 persisted assistant messages. Paid workspaces should bypass that limit through a `chat_unlimited` entitlement generated from Stripe state. The limit should count only assistant messages successfully returned and persisted by the chat flow, not failed provider calls, setup-gated attempts, user drafts, or validation errors.

Chat should use OpenAI `previous_response_id` as the primary conversation continuation strategy. Convex remains the app's source of truth for visible conversation and message state, but each conversation should persist the latest OpenAI response id and each assistant message should record its OpenAI response id when available. New turns should send the new user input plus `previous_response_id` instead of replaying full Convex history by default.

The chat sample should explicitly set `store: true` on Responses API calls. Generated setup docs and the first Program should explain that OpenAI response storage is part of the sample's continuation strategy. Convex stores UI-visible messages, workspace ownership, usage limits, selected model, and response ids; OpenAI stores the response chain used for model context.

The chat UI should let the template user choose the OpenAI model from a supported allowlist. The active conversation's selected model should be the source of truth for a send. New conversations should inherit a remembered default model from the viewer or workspace preference. Each assistant message should record the actual model used so proof, debugging, and later migrations are clear.

Changing the model in an existing conversation should affect future responses only. The app should update the conversation's `selectedModel`, not fork the conversation. Existing messages retain their recorded model metadata. Regenerate/retry uses the conversation's current selected model unless a later slice adds a per-response model override.

The model picker should copy ChatGPT's user-facing style. It should show readable mode labels such as Instant, Thinking, and Pro-style choices rather than raw API model ids. A typed supported-model allowlist maps labels to OpenAI model ids, controls availability, and gives tests stable fixtures. Assistant messages should record both the selected label/mode and the raw model id used.

`Auto` should be the default visible model choice for new conversations. In v1, `Auto` can resolve to a configured concrete model or simple routing policy. Assistant messages should record both the selected label/mode, such as `Auto`, and the resolved raw model id used for the API call.

The conversation sidebar should include auto-title, manual rename, and confirmed delete in v1. Auto-title can derive from the first user message. Rename should be a simple inline/menu action. Delete should require confirmation and then remove or archive the conversation and its messages according to the chosen data-retention contract.

Assistant output must stream in v1. The template should read Responses API streaming events, render assistant text incrementally, and resolve the stream into durable Convex message state with a completed status and OpenAI response id. The implementation must not be a blocking send-message flow that only shows output after the full model call returns.

Streaming should be implemented as Convex-backed realtime state. The send-message action should persist the user message, create a streaming assistant message, consume the OpenAI Responses stream, buffer deltas, write partial assistant text to Convex on a throttle, and finalize or fail the assistant message explicitly. The UI should subscribe to Convex message state and render the in-progress assistant message from that state instead of consuming a separate Next.js SSE response.

Chat should allow only one in-flight assistant response per conversation in v1. The send-message path should block or reject a second send while the conversation has a streaming assistant message, and the UI should make the response-in-progress state clear. This avoids parallel `previous_response_id` races and ambiguous entitlement accounting.

Failed streams should remain visible as failed assistant messages. The app should preserve partial assistant text when any arrived, mark the message `failed`, show a safe error label, and offer retry. Failed assistant messages should not count toward the 25-message free limit.

Retry should happen in place. The failed assistant message slot should become the retrying/streaming slot, rather than creating a second assistant message for the same user prompt. The message should keep bounded attempt metadata such as retry count and last safe error label, and the retry should use the last completed OpenAI response id before the failed attempt. If the retry completes, the message counts once against usage; if it fails again, it remains failed and retryable.

The template must keep a no-provider validation path. A customer or future agent should be able to install and typecheck the downloaded repo without Clerk, Convex, or Stripe accounts already configured, while setup docs explain how to connect those providers.

The template should still include provider dependencies and typed dormant seams for Clerk, Convex, and Stripe from day one. Missing env should produce setup states or blocked proof, not broken installs. Provider setup ExecPlans should activate and prove the existing seams rather than adding integration architecture from scratch.

No-provider mode should be setup-gated, not fake-provider driven. The public homepage should work immediately. Provider-dependent app areas should show polished missing-config states, active setup-plan links, and blocked-proof guidance until real Clerk, Convex, and Stripe setup is complete.

## Track E: Generated Operating Pack

The generated repo should include the same kind of Program and ExecPlan operating machinery that Ship by Sunday uses to run real work: Program and ExecPlan contracts, active/completed indexes, lint scripts, prompt or skill entrypoints, a generated first Program, and Program-linked child ExecPlans.

Clerk, Convex, and Stripe setup should be part of the customer's first Program. They should be represented as ordered child ExecPlans with validation expectations and blocked-proof language, not only README instructions. The generated repo should ship with the whole first setup roadmap up front: core boot, Clerk setup, Convex setup, Stripe setup, and first product slice. The existing local runner docs operating-system, docs-spine adoption, Worker Foundations install, and compatibility matrix work should be treated as source material for this generated subset.

## Track F: No-Questions Starter Path

Starter should support two paths: questionnaire-customized output and immediate template output. The immediate path should use default Starter intake facts and the same generator pipeline. It should not point at a separate zip or separate source of truth.
