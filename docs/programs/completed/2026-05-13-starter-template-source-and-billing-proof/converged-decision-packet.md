---
title: "Starter Template Source And Billing Proof Converged Decision Packet"
summary: "Canonical decisions for product-specific billing proof and a pinned Starter template source built from the sibling skeleton, ChatGPT-style chat, and Ship by Sunday operating pack."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical decisions for this Program."
  - "Deciding whether to implement a static zip, live remote fetch, or pinned template source."
---

# Starter Template Source And Billing Proof Converged Decision Packet

## Canonical Shape

The generated Starter repo should be composed from three layers:

1. `~/Developer/next-js-convex-clerk-stripe-template` as the pinned app skeleton.
2. A ChatGPT-style BYO OpenAI chat app replacing the skeleton's Notes sample.
3. The Ship by Sunday generated operating pack: generated facts, docs spine, first Program, setup ExecPlans, validation scripts, and agent instructions.

The sibling skeleton owns app architecture. The chat use case owns the customer-visible sample product. The generator owns deterministic composition and overlays.

## Decisions

Decision: Parameterize hosted billing proof by product offer.

Rationale: Starter and Workers have different prices, destinations, and access capabilities. A Starter-only proof can miss Workers-specific billing and entitlement regressions.

Decision: Keep Starter as the default proof offer while adding Workers as a first-class proof target.

Rationale: Starter matches the current proof path and is the lower-risk migration default. Workers still needs equal proof coverage for billing-sensitive releases.

Decision: Do not make a hand-maintained Starter zip.

Rationale: A static zip will drift from generated docs, Program material, ExecPlans, package scripts, design tokens, and source-truth overlays. The compiler should remain the zip producer.

Decision: Do not fetch a mutable template repo at customer download time.

Rationale: Live remote fetches make output nondeterministic, network-dependent, and hard to audit. Customer downloads need reproducible source provenance.

Decision: Create a pinned template-source boundary.

Rationale: A real app template should be maintained as ordinary source, but the generator must consume a known version. The first implementation can use a repo-local template source; a later external repo import can update that source through an explicit lockfile and validation process.

Decision: Use `~/Developer/next-js-convex-clerk-stripe-template` as the source seed for `templates/starter-app/`.

Rationale: The sibling repo already has the provider architecture the Starter needs: Next.js App Router route groups, Convex-owned domain models, Clerk route protection, Stripe billing sync through Convex, typed env boundaries, setup docs, local components, and tests. The implementation should import a pinned, audited snapshot into this repo instead of rebuilding those patterns from the current generated shell.

Decision: Optimize the template architecture for customer experience, coding-agent experience, and developer experience in that order.

Rationale: Customers should receive a polished, deterministic repo. Coding agents should see clear source paths and strong contracts on day one. Developers should avoid brittle tests, duplicated renderer logic, and hidden drift between template, generated output, and docs.

Decision: Put the local Starter template source under `templates/starter-app/`.

Rationale: The source should be outside runtime app ownership so production Next.js, app imports, and deployment logic cannot accidentally treat template files as live app code. `templates/` is explicit: this is source for generated customer repos, not the Man Meets AI runtime.

Decision: Make the local template repo-shaped.

Rationale: The generated customer artifact is a repo, not an app subfolder. Keeping the template source repo-shaped creates one strong mental model for customers, agents, and developers and avoids brittle generator code that has to rebuild repo structure from disconnected fixtures.

Decision: Keep a minimal monorepo shape for the Starter template and generated output.

Rationale: The customer repo needs root scripts, `apps/web`, generated docs, Program and ExecPlan validation, and selected package boundaries. A single-app repo would look simpler at first but would fight the existing operating-pack and agent workflow. Minimal monorepo means only packages the generated repo actually needs.

Decision: Compose template source with generated overlays.

Rationale: The reusable template should own app shape. Intake-specific generated files should own product truth, homepage copy, design-system values, docs, Program, ExecPlans, and agent instructions.

Decision: Beef up the Starter template into a real app starter.

Rationale: The current generated app is runnable and safe, but it is closer to a generated shell than a product-grade starter. The offer needs a credible app surface with auth-ready layout, dashboard, settings, provider setup path, generated design-system wiring, and a replaceable example workflow.

Decision: Preserve no-provider validation.

Rationale: A buyer or generated-repo agent should be able to install, lint the operating pack, typecheck the app, and start the dev command before creating Clerk, Convex, or Stripe projects. Provider setup should be a documented next action, not a blocker to opening the repo.

Decision: Put Clerk, Convex, and Stripe setup inside the generated first Program as ExecPlans.

Rationale: Provider setup is not a side note. It is the customer's first real implementation work after the repo boots, and agents need durable state, ordered dependencies, validation, and blocked-proof reporting for each provider.

Decision: Generate the whole first-program setup roadmap up front.

Rationale: Customers should open the repo and see the path immediately. Agents should not have to invent the initial provider roadmap, and developers should not maintain brittle conditional plan-generation logic for the first setup sequence. The generated Program should include core boot, Clerk setup, Convex setup, Stripe setup, and first product slice ExecPlans from day one, with later plans blocked on prior proof.

Decision: Include provider dependencies and dormant integration seams in the template source.

Rationale: A polished Starter should not ask customers or agents to bolt on the basic provider architecture later. Clerk, Convex, and Stripe packages and typed seams should be present from day one, while live provider behavior stays gated behind env/config proof so the repo remains installable, typecheckable, and inspectable before accounts exist.

Decision: Keep the sibling template's architecture but replace Notes with a ChatGPT-style BYO OpenAI chat app.

Rationale: Notes is a useful reference implementation, but the Starter customer should see an immediately recognizable AI product slice. The imported template should preserve the architectural and test patterns while swapping the sample domain to a chat app with a conversation sidebar, model picker, streaming assistant output, setup-gated provider config, and generated operating docs.

Decision: Use ChatGPT as the default behavior spec for chat UX.

Rationale: The generated chat app should copy ChatGPT's current user-facing behavior unless this Program records a deliberate divergence. Future agents should research and implement the ChatGPT default for ordinary chat affordances instead of asking for each sidebar, composer, regenerate, delete, model-switching, or mobile behavior separately.

Decision: Supersede the Worker Dashboard Threads reference.

Rationale: The Worker Dashboard research helped clarify what a real AI operating surface can feel like, but the Starter template should no longer be a Worker-style threads console. The customer-facing template direction is now a ChatGPT-style chat app.

Decision: Let the template user choose the OpenAI model in the chat UI.

Rationale: A ChatGPT-style template should include model selection as a first-class control. The selector should choose from an app-owned supported-model allowlist, persist the selected model for the conversation or workspace preference, and record the model actually used on each assistant response.

Decision: Make the conversation's selected model the send-time source of truth.

Rationale: New conversations should inherit a remembered default model, but each conversation should own the selected model used for its next response. Assistant messages must record the actual model used so model changes are explicit and historical proof remains stable.

Decision: Model changes affect future responses in the same conversation.

Rationale: ChatGPT treats the model picker as an active conversation control, not as a fork control. The template should update `selectedModel` on the conversation, keep previous message metadata stable, and use the selected model for the next send or regenerate path.

Decision: Use ChatGPT-style model labels in the picker.

Rationale: The UI should show readable mode labels such as Instant, Thinking, and Pro-style choices, while code stores and validates raw OpenAI model ids through a typed allowlist. Users should not have to see or type raw ids to use the starter.

Decision: Include `Auto` as the default model picker option.

Rationale: `Auto` best matches ChatGPT's default interaction and gives the generated app a stable user-facing option that can initially resolve to one configured model and later evolve into smarter routing.

Decision: Include conversation rename and delete in v1.

Rationale: The sidebar should feel like a real chat product. Auto-title, manual rename, and confirmed delete are core ChatGPT-like affordances and are small enough to include in the first app slice.

Decision: Scope BYO OpenAI key ownership to the template buyer/operator in v1.

Rationale: The customer using the generated template should bring their own OpenAI or ChatGPT API key for their app. The first implementation should not add end-user-entered key storage. That keeps the security model narrow and makes the generated setup path easier for customers, agents, and maintainers to validate.

Decision: Use environment configuration for `OPENAI_API_KEY` in v1.

Rationale: A local/deployment env variable is the simplest durable contract for the template user. It avoids building a secrets-management product inside the Starter template and keeps the first chat slice focused on server-side model calls, missing-config setup states, and proof that a configured key works.

Decision: Apply the sibling template's architecture and conventions to chat.

Rationale: The template docs say to model product concepts in Convex first, keep provider payloads out of primary application state, validate optional env at the boundary that uses it, and use route handlers or Convex actions for third-party side effects. Chat should therefore store conversation/message product state in Convex and use a Convex action for the OpenAI side effect by default. Next.js route handlers should remain for narrow integration endpoints such as webhooks, redirects, and browser-facing integration boundaries when the architecture specifically calls for them.

Decision: Make `/chat` the template's primary protected product route.

Rationale: The Starter template should present the ChatGPT-style sample directly. `/chat` is clearer than `/threads` and avoids carrying Worker Dashboard naming into customer output.

Decision: Follow the sibling sample's route and entitlement model for chat.

Rationale: The current sibling sample protects `/notes` through Clerk, resolves workspace authorization in Convex, and uses Stripe entitlement state to enforce plan-aware limits instead of hiding the whole feature behind a paid route. `/chat` should use the same model.

Decision: Use 25 free assistant messages and `chat_unlimited` for paid usage.

Rationale: The current sample has a 25-note free limit and an unlimited entitlement. Chat should keep that simple teaching pattern while changing the unit of value to persisted assistant messages. Failed model calls and drafts should not count.

Decision: Use `previous_response_id` for chat continuation.

Rationale: Convex should own app-visible conversations and messages, while OpenAI's Responses API can carry model context from turn to turn with the last response id. This gives the template a modern AI pattern without forcing agents to replay full local history on every message.

Decision: Set `store: true` for the chat Responses API calls.

Rationale: The template is intentionally teaching OpenAI-managed response continuation through `previous_response_id`. It should make that storage choice explicit in code and docs instead of relying on implicit defaults or mixing in a local replay strategy.

Decision: Require streaming assistant output in v1.

Rationale: The ChatGPT-style sample should demonstrate a product-grade AI interaction. It should render text as the Responses API emits streaming events, then finalize a durable Convex assistant message when the stream completes.

Decision: Implement streaming through Convex-backed realtime updates.

Rationale: Convex owns product state in the sibling template. The OpenAI stream should be consumed server-side, buffered, and written to Convex as a streaming assistant message so the client renders from the same state it will keep after completion. A direct Next.js SSE stream would split product behavior between transient HTTP output and durable Convex state.

Decision: Permit one in-flight assistant response per conversation.

Rationale: `previous_response_id`, streaming updates, usage limits, and final response ids are simplest and most reliable when one conversation has at most one active assistant generation. Parallel generations can be designed later if a customer product needs branching conversations.

Decision: Preserve failed assistant messages and provide retry.

Rationale: A failed stream should remain visible product state, not vanish. Keeping partial output, status, and a retry affordance makes the template more realistic and gives future agents a clear debugging and recovery pattern.

Decision: Retry failed responses in place.

Rationale: The best v1 experience is a ChatGPT-style regenerate flow: the failed assistant slot becomes the retrying/streaming slot instead of adding another assistant message for the same prompt. Bounded attempt metadata gives agents and tests enough state without cluttering the conversation.

Decision: Prefer setup-gated no-provider states over fake provider behavior.

Rationale: Fake auth, fake data, and fake billing would make the generated repo look further along than it is and would create test drift once real providers are connected. Missing provider configuration should render polished, actionable setup states that point to the active ExecPlan and blocked-proof path.

Decision: Reuse or adapt the local runner docs operating-system model for the generated Starter pack.

Rationale: The local runner already has Program and ExecPlan linting, child-plan creation, docs-spine adoption, package-script conventions, and compatibility smoke coverage. The generated Starter should use that proven model as its source of truth where it can, rather than drifting into a weaker parallel implementation.

Decision: Implement the no-questions template path through the same generator.

Rationale: The direct template path and questionnaire path should produce the same kind of output. Default intake facts should drive immediate template output instead of a separate artifact.
