# Research Pass: Mature Repo Adoption

## Question

How should Ship by Sunday help customers with existing mature codebases adopt Programs, ExecPlans, and agentic engineering loops without forcing them into the generated starter path?

## Findings

The live Ship by Sunday flow is blueprint-first. Product intake leads to `/review`, and `/review` downloads a generated customer repo. The current product docs under `apps/web/content/docs/` teach local setup, auth, billing, buyer-journey testing, the build loop, prompting patterns, parallel agents, and shipping. They do not yet define a first-class path where a customer points Ship by Sunday at an existing repo and receives an adoption Program.

The mature-repo opportunity is structurally different from greenfield generation. A mature repo already has code, tests, CI, docs, source-of-truth drift, release rules, incidents, and ownership habits. The product should not overwrite those conventions. It should install an operating layer around them: a source-of-truth map, validation command map, agent instructions, Program and ExecPlan contracts, prompt assets, thin skills, and a first adoption Program.

Ship by Sunday's internal repo already demonstrates the mature target state. Root `AGENTS.md` routes agents through docs and path triggers. `docs/index.md` is the first-hop docs spine. `docs/ARCHITECTURE.md`, `docs/RELIABILITY.md`, `docs/SECURITY.md`, `docs/PRODUCT_SENSE.md`, and `docs/QUALITY_SCORE.md` split repo doctrine by concern. `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md` define durable planning. Runtime and release evidence live under `docs/release-workflow.md`, `docs/internal/observability.md`, `docs/internal/linear.md`, release scripts, and runtime-intake tooling.

A mature-repo adoption lane should audit for these surfaces:

- root agent instructions and nested owner instructions
- docs index and architecture/source-of-truth docs
- package manager and canonical scripts
- test commands, CI, release proof, and failure triage
- source boundaries and known risky areas
- existing planning/spec surfaces
- backlog and status system such as Linear or GitHub Issues
- observability and incident loops
- secrets and environment-variable docs
- generated or external artifacts that must not be edited directly

The first output should be an adoption overlay, not a replacement starter repo. The overlay should include `repo-adoption-intake.v1`, a repo audit pack, a Program packet, a first child ExecPlan, a workflow bridge for issue and PR evidence, and an optional runtime evidence bridge. The first child ExecPlan should usually be "Mature Repo Adoption Pack Contract" or "Normalize Validation And Source Truth". It should make the repo legible to agents before any ambitious feature or refactor work.

## Recommended Direction

Create a mature-repo offering lane with this promise: "Bring an existing repo and leave with an agent-ready operating system plus the first safe execution slice." The output should be a patch or artifact bundle that the customer can review before applying.

The adoption Program should include:

- `research-pass-repo-inventory.md`
- `normalized-pass-source-truth.md`
- `normalized-pass-validation-release.md`
- `normalized-pass-agent-workflow.md`
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-1.md`
- `program.md`
- one first child ExecPlan

The adoption input model should include source repo identity, target branch or base branch, package manager, app surfaces, deploy path, CI contexts, test commands, release policy, issue tracker, observability source, runtime incident exports, product goal, first desired outcome, non-goals, and security constraints.

For mature repos, the Program generator should be conservative. It should name missing facts and blocked proof instead of fabricating confidence. It should preserve the repo's package manager and existing conventions. It should install the smallest useful set of agent instructions and validation scripts.

## Validation Targets

Mature adoption proof cannot be one generic command. The product should validate the generated adoption packet structurally, then ask the customer's repo to run its own discovered command map. The Ship by Sunday side should prove that the audit output is complete, path-safe, and free of secrets or local machine assumptions.

## Watchpoints

Do not mutate customer mature repos automatically. Do not assume Bun, Next.js, Convex, Stripe, or Linear. Do not impose Ship by Sunday's internal release workflow as a universal default. Do not present repo-audit confidence as production readiness.
