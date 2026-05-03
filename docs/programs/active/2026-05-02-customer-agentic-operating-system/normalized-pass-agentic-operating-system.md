# Normalized Pass: Customer Agentic Operating System

## Decision Tracks

The initiative has four customer lanes, one commercial loop-marketplace lane, and one shared infrastructure lane.

The new-repo lane installs the agentic operating system into every generated customer repo. It owns generalized Program and ExecPlan contracts, indexes, templates, prompt assets, thin skills, root scripts, generated onboarding, and clean-room materialization tests.

The doctor lane diagnoses product and repo truth, ranks the top nine highest-leverage opportunities, recommends the next loop, and produces a reviewable artifact that can convert either new-repo or existing-repo customers into paid loop execution.

The commercial loop-marketplace lane owns the money-ranked catalog, flagship offer, landing-page story, pricing language, opportunity ledger, and proof-to-next-purchase motion. It makes the product legible as an agent doctor for web apps instead of an abstract agentic methodology.

The broken-app rescue lane handles existing web apps that are stuck, fragile, or failing. It owns read-only reproduction, root-cause localization, safe patch proposals, proof commands, and blocked-proof reports.

The mature-repo lane creates an adoption workflow for existing codebases. It owns repo audit inputs, maturity/readiness scoring, adoption Program generation, patch or artifact delivery, and non-invasive validation. It must preserve customer conventions instead of assuming the Ship by Sunday starter stack.

The shared infrastructure lane owns customer-safe packaging, validation, prompt and skill versioning, docs mirrors, product narrative, BYO execution attachment, and review proof across all lanes.

## Decisions

Decision: Ship generalized customer-safe Program and ExecPlan contracts instead of exposing internal Ship by Sunday planning archives.
Rationale: Customers need the operating model, not our historical work product. The current snapshot exclusions are protecting the right boundary.
Date: 2026-05-02

Decision: Make the first implementation slice a generated-repo source-contract reconciliation.
Rationale: Generated repos already have a controlled package manager, docs structure, starter skills, prompt pack, Build Pack readiness model, and clean-room replay tests, but the current guidance has prompt naming drift and skill trigger drift. The first slice should stabilize the customer-safe source contract before adding the full operating pack.
Date: 2026-05-02

Decision: Treat mature-repo adoption as a separate product lane, not as an option inside the generated starter bootstrap.
Rationale: Mature repos need read-only audit, convention preservation, and patch review. They should not inherit greenfield assumptions such as Bun, Convex, Stripe, Next.js, or the generated starter route map.
Date: 2026-05-02

Decision: Add a doctor pass before broad existing-repo implementation.
Rationale: A top-nine opportunity report is easier to sell and easier to prove than a broad promise to transform arbitrary repos. It creates a common input for generated repos, broken apps, and mature codebases while preserving scoped execution through later loops.
Date: 2026-05-02

Decision: Treat the loop catalog as product inventory.
Rationale: Loops such as broken-app rescue, design, test, release, billing/auth, performance, docs, observability, and growth are the paid units customers can understand. Programs and ExecPlans remain the durable execution substrate behind those units.
Date: 2026-05-02

Decision: Expand the loop catalog across the full web-app lifecycle.
Rationale: The catalog should include diagnostic, debugging, design, growth, onboarding, activation, auth, billing, performance, SEO, conversion, analytics, observability, security, refactor, test hardening, release, migration, dependency upgrade, AI feature integration, admin tooling, mobile responsiveness, accessibility, email, content, support ops, and agency/client reporting loops so every web-app buyer sees a relevant entry point.
Date: 2026-05-02

Decision: Rank loops commercially before implementing more surfaces.
Rationale: The highest-value loops combine buyer pain, willingness to pay, proof clarity, bounded risk, repeatability, and next-purchase pull. The near-term money loops are doctor pass, broken-app rescue, billing/auth hardening, conversion/activation, release proof, observability, design, performance, and test hardening.
Date: 2026-05-02

Decision: Define the top-nine doctor output as an opportunity ledger.
Rationale: Each opportunity should include title, buyer value, expected revenue or speed impact, confidence, blast radius, proof path, required permissions, recommended loop, price or offer language, next action, and blocked-proof state. This lets diagnosis convert into loop purchase without implying unsupported automation.
Date: 2026-05-02

Decision: Keep the first public purchase as the current `$250` soon-`$500` flagship offer.
Rationale: The buyer should not have to select from many loop SKUs. The flagship offer should include diagnosis, top-nine opportunity report, selected first loop, proof or blocked-proof report, and next-loop recommendation. Subscriptions, retainers, emergency rescue, agency tier, and concierge review are follow-on or higher-touch shapes after the first proof.
Date: 2026-05-02

Decision: Lead landing-page positioning with "agent doctor for web apps."
Rationale: A normal web-app builder should understand the offer in under 10 seconds. The page should explain web apps, new and existing or broken apps, diagnosis before work, named AI worker loops, proof, and consented BYO execution before introducing Programs, ExecPlans, or operating-system language.
Date: 2026-05-02

Decision: Treat BYO AI as an explicit execution attachment layer.
Rationale: Customers may bring ChatGPT/Codex subscriptions, API keys, GitHub-connected Codex cloud environments, or local runners. Each mode needs explicit consent, storage, permission, and failure-state handling before paid loops rely on it.
Date: 2026-05-02

Decision: Avoid hidden bootstrap mutations.
Rationale: A `postinstall` or silent bootstrap step that creates Programs would surprise customers and can dirty a repo before review. The correct command should be explicit, such as `bun run agentic:bootstrap`, and should explain what it will write.
Date: 2026-05-02

Decision: Keep Build Pack readiness as the first generated-repo source of truth for first-slice confidence.
Rationale: `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/` already made readiness deterministic. The new operating pack should connect to that model rather than duplicate blockers and validation truth in another document.
Date: 2026-05-02

## Open Questions

The Program should decide later whether customer-safe Program prompt assets are copied from `docs/prompts/program-*.md`, generated from templates, or rendered from a smaller source pack.

The Program should decide later whether generated repos should always include a seed Program packet or create it only after the explicit `agentic:bootstrap` command.

The Program should decide later how mature repo audits are uploaded, run, and returned in the product. The first Program slice should not require that product surface.

The Program should decide later which exact homepage, checkout, and entitlement surfaces implement the `$250` soon-`$500` flagship offer, then which surfaces support additional loops, subscription or retainer, emergency rescue, agency tier, and concierge review.

The Program should decide later which execution surfaces are eligible for self-serve loops: Codex app-server, ChatGPT/Codex cloud, OpenAI API keys, GitHub app installation, or local CLI handoff.
