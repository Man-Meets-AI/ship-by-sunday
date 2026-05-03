# Dependency Graph

## Ordered Work

1. Customer agentic source contract for generated repos.
   This comes first because generated repo output already has agent instructions, prompt assets, skills, and Build Pack readiness. The first risk is drift and unsafe promises, so the source contract must be reconciled before adding the full operating pack.

2. Commercial doctor pass, top-nine ledger, flagship offer, proof contract, and homepage narrative.
   This depends on coherent source truth but should move ahead of the full generated operating pack because it is the revenue wedge across new repos, broken apps, mature repos, agencies, and operators. It defines the top-nine opportunity schema, money-ranked fulfillment loop catalog, `$250` soon-`$500` flagship offer language, proof and blocked-proof expectations, consent boundaries, and first-page positioning without splitting the public purchase into many SKUs.

3. BYO execution surface.
   This depends on the doctor taxonomy because the product must know which loop needs which execution mode. It should define consent, storage, permissions, rate limits, and failure states for Codex app-server, ChatGPT/Codex cloud, API keys, GitHub-connected execution, and local runners.

4. Doctor-pass entry and opportunity ledger.
   This depends on the doctor taxonomy and execution-surface boundary. It should create the first product path for diagnosis, top-nine reporting, permission mapping, proof planning, loop recommendation, blocked-proof reporting, and routing the existing flagship checkout into the selected first loop.

5. Broken-app rescue loop.
   This depends on the doctor pass and BYO execution boundary. It is the first existing-repo monetization wedge because the pain is clear and proof can be concrete: reproduce, localize, patch after review, prove, and update source truth.

6. Customer-safe operating pack for generated repos.
   This depends on the source contract and benefits from the doctor taxonomy. It should add generalized Program and ExecPlan contracts, templates, prompts, skills, and validation only after the path and ownership model are stable.

7. Generated repo explicit agentic bootstrap.
   This depends on the operating pack existing. It should create or refresh a first Program packet from generated facts and Build Pack readiness only when the customer asks for it.

8. Worker-led landing page, product docs, and onboarding for the multi-lane model.
   This depends on the doctor taxonomy, BYO execution boundaries, and generated pack shape because the docs need to point to real files, commands, and proof states. The customer-facing distinction should be lane-based: create a new worker-ready codebase, run a doctor pass on an existing or broken app, or bring an existing mature repo under a worker operating layer.

9. Mature repo audit model.
   This depends on the operating pack decisions but not on generated repo bootstrap. It defines the input inventory, maturity report, command map, source-truth map, and adoption Program output.

10. Mature repo adoption artifact generator.
   This depends on the audit model. It creates a Program packet, first child ExecPlan, and optional patch bundle while preserving the customer's package manager and conventions.

11. Mature repo product surface.
   This depends on the adoption artifact generator. The app can then support upload, repository connection, or guided local-agent workflow without inventing output structure in UI code.

12. ChatGPT app distribution.
   This depends on the loop engine being stable. It can expose doctor, loop selection, and loop status through MCP tools and optional UI, but app review, privacy, OAuth, and tool annotations should not block the core web-app product.

13. Cross-lane validation and review proof.
   This runs throughout, but final acceptance depends on all lanes having command-backed proof, clean-room fixture coverage, customer-safe docs, and honest blocked-proof states.

## Critical Dependencies

`packages/blueprint-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` must keep internal archives excluded while allowing new generalized artifacts.

`packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts` owns generated root scripts for new repos.

`packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts` and `render-generalized-starter-files.ts` own the generated onboarding and agent guidance.

`packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts` owns generated local skills.

`packages/blueprint-compiler/tests/repo-generation.test.ts`, `review-download-zip.test.ts`, and `customer-safe-snapshot-contract.test.ts` should prove generated output.

`apps/web/platform/codex/app-server.ts`, `apps/web/app/api/codex/`, and `apps/web/app/(workspace)/_components/codex-connection-card/` are the current BYO Codex connection surfaces that future execution-surface work must account for.

`apps/web/app/_content/home-page.ts` and `apps/web/app/_lib/home-page-render-model.ts` are the current homepage content and behavior surfaces that later landing-page implementation must account for.

`apps/web/config/product.ts`, `apps/web/app/_lib/home-page-structured-data.ts`, `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`, `apps/web/app/api/stripe/checkout/`, `apps/web/platform/billing/checkout/`, `apps/web/app/checkout/success/`, `apps/web/app/(workspace)/blueprint`, and `apps/web/app/(workspace)/review` constrain any later offer, CTA, checkout, blueprint, or review-download implementation.

Official Codex docs and Apps SDK docs are dependencies for any slice that claims ChatGPT/Codex login, GitHub-connected cloud execution, MCP tools, OAuth, or ChatGPT app distribution behavior.

## Parallelizable Work

The product narrative, loop taxonomy, flagship offer language, mature-repo audit model, and generated-repo pack can be researched in parallel. Implementation should not begin on mature-repo product UI before the doctor, audit, and execution-surface artifact contracts are stable.
