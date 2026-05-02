# Cross-Repo Review

## Review Summary

The Program split is directionally right, but the first generated-repo slice should be source-contract reconciliation, not full operating-pack shipment. Generated repos are the right first target because the output is controlled, the package manager is known, and compiler tests can prove the contract. Mature repo adoption is strategically larger but should not block the first generated-repo source-contract work.

## Risks

The biggest risk is source-of-truth duplication. Generated customer repos already include Build Pack readiness and first-slice planning. The new Program/ExecPlan pack must connect to those docs instead of creating a second contradictory planning layer.

The second risk is leakage. Internal completed Programs, internal prompt assumptions, local release evidence, and Ship by Sunday-specific CI rules must not enter customer artifacts.

The third risk is over-automation. A hidden `postinstall` or default bootstrap mutation would make the repo dirty before the customer understands the change. Agentic bootstrap must be explicit.

The fourth risk is mature-repo overreach. Existing repos may use npm, pnpm, yarn, Python, Go, Rails, GitHub Issues, Jira, or custom CI. The adoption lane must audit and adapt instead of imposing the starter's Bun and Next.js assumptions.

The fifth risk is optional tool drift. Linear, external skills, MCPs, Codex app-server runtime, and PostHog triage are valuable later layers, but they need explicit customer setup and safety decisions. They should not become hidden prerequisites for the first generated-repo operating-system slice.

## Missing Work To Carry Into Later Slices

The Program needs a customer-safe prompt and skill versioning policy. If prompts are copied from internal docs, the first implementation slice must strip repo-specific references and test for forbidden internal paths.

The Program needs a mature-repo data boundary. Before product UI is built, the team must decide whether audits run locally, through a GitHub connector, through zip upload, or through a generated prompt pack that a customer's agent runs inside their repo.

The Program needs a product promise update. The public surface should say that Ship by Sunday makes repos agent-ready through Programs, ExecPlans, validation, and review loops. It should not imply that mature repos become production-ready automatically.

## First ExecPlan Critique

The first child ExecPlan should be narrower than full pack shipment. It should reconcile the customer-facing source contract: root agent guidance, Build Pack docs, generated prompt naming, generated skill triggers, generated package-script promises, snapshot exclusions, and tests. It should not implement the mature-repo lane, even though the Program has to design for it. The first slice should end with a materialized generated repo whose current agent guidance is coherent and whose future operating-pack extension points are safe.

## Required Validation

The first child ExecPlan should validate the package with focused compiler tests, output snapshot or materialization checks, package typecheck, package lint, package format check, Program lint, ExecPlan lint, markdown lint for touched docs, and repo diff whitespace checks.
