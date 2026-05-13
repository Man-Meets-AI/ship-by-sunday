---
title: "Autonomous Program Execution Loop Converged Decision Packet"
summary: "Canonical decisions for automating Parker's Program and ExecPlan execution SOP with a headless review, fix, proof, and checkpoint loop."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical decisions for the autonomous Program runner."
  - "Deciding whether to add hooks, a separate repo, or command-driven execution."
  - "Reviewing what v1 must automate before the runner moves to the next ExecPlan."
---

# Autonomous Program Execution Loop Converged Decision Packet

## Canonical Shape

The autonomous Program runner should encode Parker's existing manual SOP. Parker approves a Program and starts it. The system then executes one child ExecPlan, proves it, generates a fresh review prompt from live context, runs a fresh review pass, fixes real findings, reruns proof, updates docs, checkpoints state, and only then moves to the next child ExecPlan. The Program loop repeats until Program completion criteria pass.

## Decisions

Decision: Automate the existing SOP rather than invent a new process.

Rationale: The current manual loop has been proven through repeated real work. The waste is prompt-pasting, review-thread creation, fix handoff, context-window management, and state tracking, not the underlying sequence.

Decision: Make the first implementation a one-slice runner.

Rationale: A reliable `program:run-slice` path creates immediate value and provides the primitive that a later full Program loop can call repeatedly.

Decision: Defer full SDLC automation.

Rationale: Ideation, paper steps, moodboards, taxonomy review, screen-by-screen polish, and feature usage instrumentation are important, but the urgent repetitive pain is the post-ExecPlan review/fix/proof cycle before moving to the next plan.

Decision: Use command-driven orchestration before hooks.

Rationale: The state machine must be inspectable, resumable, and testable. Hooks can assist with notifications or lifecycle receipts later, but hidden hook side effects should not own the first mutating loop.

Decision: Use `codex exec` as the headless execution backbone.

Rationale: The local runner already wraps `codex exec --json`, and the sibling Worker repo already demonstrates build, proof, and repair workflows around headless Codex execution.

Decision: Generate the review prompt at runtime after implementation.

Rationale: The review prompt is valuable because it contains current context: Program docs, child ExecPlan, changed files, git diff, proof output, risks, assumptions, and exact validation state.

Decision: Run review in a fresh execution context.

Rationale: The fresh reviewer catches blunders because it is not carrying the implementer's local assumptions. The automated loop should preserve this separation.

Decision: Require structured review findings before fix.

Rationale: The fix pass should act on real bugs, regressions, missing tests, security issues, and incorrect assumptions. Structured findings let the runner distinguish must-fix issues from notes or open questions.

Decision: Cap repair attempts.

Rationale: Autonomy needs a safety limit. A slice can try one or two fix-and-reproof cycles, then mark itself blocked with the review result and proof summary if it cannot converge.

Decision: Treat context-window management as a solved state problem.

Rationale: The runner should not depend on whether the original chat thread is below 70 percent context. Each slice starts from durable docs and run receipts, so a new Codex execution context can pick up cleanly.

Decision: Store technical run artifacts under ignored state.

Rationale: Raw logs, temporary prompts, review JSON, and proof captures are execution artifacts. They should be inspectable locally without becoming durable product truth or syncing raw transcripts by default.

Decision: Store durable progress in Program and ExecPlan docs.

Rationale: Later agents and humans should resume from checked-in docs. Run artifacts can explain how something happened, but Program and ExecPlan docs remain the source of truth.

Decision: Do not create a separate repo yet.

Rationale: Ship by Sunday owns the canonical docs contracts and local runner distribution path. Worker owns useful reference machinery. A separate repo should wait until the command contract is proven across Ship by Sunday, Worker, installed customer repos, and the generated Starter template.

Decision: Use the Worker repo as a reference implementation, not a dependency.

Rationale: Worker has strong headless execution patterns, but its runtime state and dashboard assumptions are not the same as Ship by Sunday's local runner and generated repo needs.

Decision: Checkpoint completed slices.

Rationale: Program execution is safer when each completed ExecPlan has a clear boundary, proof summary, and optional commit point before the next slice begins.

Decision: Keep automatic pushing, merging, provider configuration, and production deployment out of v1.

Rationale: The first autonomous loop should mutate the repo, run local proof, and update docs. External irreversible or account-level actions need later explicit design.

Decision: Keep Parker's customer, agent, and developer experience rubric as a first-class planning rule.

Rationale: The runner should not optimize only for code completion. It should preserve the quality bar that produced the existing SOP: customer-visible value, clear agent paths, and maintainable developer surfaces.
