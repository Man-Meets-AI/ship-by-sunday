# Dependency Graph

## Ordered Work

1. Customer agentic source contract for generated repos.
   This comes first because generated repo output already has agent instructions, prompt assets, skills, and Build Pack readiness. The first risk is drift and unsafe promises, so the source contract must be reconciled before adding the full operating pack.

2. Customer-safe operating pack for generated repos.
   This depends on the source contract. It should add generalized Program and ExecPlan contracts, templates, prompts, skills, and validation only after the path and ownership model are stable.

3. Generated repo explicit agentic bootstrap.
   This depends on the operating pack existing. It should create or refresh a first Program packet from generated facts and Build Pack readiness only when the customer asks for it.

4. Product docs and onboarding for the two-lane model.
   This depends on the generated pack shape because the docs need to point to real files and commands. It can begin before mature-repo ingestion is implemented if it is careful to label the mature lane as upcoming or scoped.

5. Mature repo audit model.
   This depends on the operating pack decisions but not on generated repo bootstrap. It defines the input inventory, maturity report, command map, source-truth map, and adoption Program output.

6. Mature repo adoption artifact generator.
   This depends on the audit model. It creates a Program packet, first child ExecPlan, and optional patch bundle while preserving the customer's package manager and conventions.

7. Mature repo product surface.
   This depends on the adoption artifact generator. The app can then support upload, repository connection, or guided local-agent workflow without inventing output structure in UI code.

8. Cross-lane validation and review proof.
   This runs throughout, but final acceptance depends on both lanes having command-backed proof, clean-room fixture coverage, and customer-safe docs.

## Critical Dependencies

`packages/blueprint-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` must keep internal archives excluded while allowing new generalized artifacts.

`packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts` owns generated root scripts for new repos.

`packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts` and `render-generalized-starter-files.ts` own the generated onboarding and agent guidance.

`packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts` owns generated local skills.

`packages/blueprint-compiler/tests/repo-generation.test.ts`, `review-download-zip.test.ts`, and `customer-safe-snapshot-contract.test.ts` should prove generated output.

## Parallelizable Work

The product narrative, mature-repo audit model, and generated-repo pack can be researched in parallel. Implementation should not begin on mature-repo product UI before the audit artifact contract is stable.
