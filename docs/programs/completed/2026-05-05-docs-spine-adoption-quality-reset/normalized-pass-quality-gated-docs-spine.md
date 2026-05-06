---
title: Quality Gated Docs Spine Normalized Pass
summary: Normalized direction for rebuilding docs-spine adoption around evals, linting, checks, and customer-visible quality.
docType: program_normalized_pass
status: active
read_when:
  - Implementing docs-spine quality gates.
  - Deciding the ordering of scanner, synthesis, apply, and pilot fixes.
---

# Quality Gated Docs Spine Normalized Pass

## Direction

The docs-spine adoption loop must become quality-gated before it becomes more generative. The next version should fail the current Arena CRM output, explain why it failed, and prevent apply until the generated docs meet structural, source-truth, and content-quality thresholds.

The Program should treat `docs-spine-adoption` as a customer install experience, not a local artifact generator. The acceptance bar is a repo-specific operating spine that an existing-codebase user can trust on day one.

## Tracks

Track 1 is the eval and lint contract. It defines the docs-spine quality score, required file families, required sections, Program and ExecPlan contracts, docs index route checks, quality-score shape, prompt contract checks, source-truth checks, hidden-noise rejection, and blocked-draft rejection.

Track 2 is scanner repair. It ranks canonical evidence, identifies instruction shims, excludes noisy hidden histories by default, records app topology, discovers native gates, and writes source-truth maps that can drive repo-specific synthesis.

Track 3 is renderer and synthesis repair. It reuses or matches the generated operating-pack renderer and Worker/SBS docs contracts. It produces complete Markdown, not placeholders, and marks uncertain sections as blocked instead of apply-ready.

Track 4 is apply and proof hardening. It refuses blocked drafts, runs the docs-spine eval suite before and after apply, writes detailed proof, and records native-gate blockers without calling the docs spine done.

Track 5 is Arena CRM pilot acceptance. It runs the full loop on Arena and records a customer-visible diff that meets the quality threshold.

## Quality Bar

Good output must include a first-hop `docs/index.md`, complete Program and ExecPlan contracts, first active Program and ExecPlan packets, validation and proof docs, prompt docs, a meaningful `QUALITY_SCORE.md` contract, and source-truth-aware instruction routing. Optional docs such as `ARCHITECTURE.md`, `RELIABILITY.md`, `SECURITY.md`, `FRONTEND.md`, `DESIGN.md`, and `PRODUCT_SENSE.md` should be generated or updated when repo evidence supports them.

Good output must also include checks. At minimum: markdown metadata lint, Program packet lint, ExecPlan lint, docs-spine structure lint, quality-score lint, prompt inventory lint, scanner evidence lint, native command-map lint, and pilot acceptance evals.

## Non-Negotiables

Blocked drafts cannot be applied.

Placeholder docs cannot pass proof.

Hidden audit folders cannot become the primary route map.

Root instruction mutation requires explicit authority; instruction routing docs can be generated first.

Native repo gates must be discovered and attempted or blocked with exact reasons.

The final pilot artifact must be strong enough to show as the runner install story.
