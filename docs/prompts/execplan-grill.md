# ExecPlan Grill

Use this after an ExecPlan exists and before implementation begins. This is step 2 in the workflow: stress-test the plan, resolve hidden assumptions, and turn ambiguous design branches into explicit decisions before execution starts.

## Why this prompt exists

The OpenAI-aligned workflow is:

1. Use plan mode for difficult work.
2. Ask Codex to interview you when ambiguity remains.
3. Use `.plans/PLANS.md` plus a self-contained ExecPlan for long-horizon work.

This prompt combines those ideas for a specific plan review pass.

## Preferred usage

Use this in plan mode:

```text
/plan Grill this ExecPlan before implementation.
```

Then paste a prompt like the one below.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `.plans/PLANS.md` next and use it as the contract for what a good ExecPlan must contain.

Read this target ExecPlan carefully:
<target_execplan_path>
.plans/example-initiative.md
</target_execplan_path>

You are in planning mode. Do not implement product code.

Your job is to grill this ExecPlan until it is implementation-ready. Treat this as an interview and stress-test pass, not a rewrite pass.

Primary goal:
- Reach a shared understanding strong enough that a fresh coding agent could execute the plan with minimal surprise.

Primary method:
- Inspect the real codebase first.
- If a question can be answered by exploring the codebase, explore the codebase instead of asking me.
- Ask me only the questions that remain materially unresolved after repo inspection.

What to look for:
- scope ambiguity
- hidden dependencies
- sequencing mistakes
- unclear interfaces or contracts
- weak acceptance criteria
- missing validation steps
- rollout, migration, or backfill risk
- missing recovery or rollback instructions
- auth, permissions, or security gaps
- performance or cost traps
- observability gaps
- ownership or boundary confusion
- edge cases that could change the design

Questioning rules:
- Ask one high-leverage question at a time by default.
- You may ask up to 3 questions in one turn only if they are tightly coupled and must be answered together.
- Prefer short numbered questions with multiple-choice options when practical.
- Provide a recommended answer for each question.
- Explain why that recommendation is the default.
- Include a fast-path response such as `default` or `1a 2b`.
- Separate must-have questions from nice-to-have questions.
- Do not ask open-ended questions when a tighter framing would remove ambiguity faster.
- Do not ask questions that the repository can answer.

Per-turn output format:
1. `What I checked`
   - Briefly state the code paths, files, tests, or docs you inspected.
   - If you resolved any uncertainty from the repo, say so directly.
2. `What still seems unresolved`
   - List only the current high-leverage ambiguity or tightly coupled ambiguities.
3. `Question`
   - Ask the next must-have question.
   - Give options when practical.
4. `Recommended answer`
   - State your recommendation clearly.
   - Explain the tradeoff in 1-3 sentences.
5. `Why this matters`
   - Explain what part of the ExecPlan or execution path this answer affects.
6. `Reply format`
   - Give a compact response format such as `default` or `1b`.

Review standard:
- Walk down each branch of the design tree and resolve dependencies between decisions one by one.
- Prefer narrowing and concretizing the plan over generating more options.
- Challenge assumptions directly when they seem weak.
- If the plan claims behavior that is not grounded in the repo, call that out explicitly.
- If the plan is missing the explicit `.plans/PLANS.md` reference sentence near the top, call that out.
- If the plan is missing `Artifacts and Notes` or `Interfaces and Dependencies`, call that out.
- If a section of the ExecPlan is underspecified, cite the section heading and describe what is missing.
- If the plan is already solid in an area, say so and move on.

Completion criteria:
- Continue the interview until there are no remaining high-impact ambiguities in:
  - user-visible outcome
  - scope and non-goals
  - architecture and boundaries
  - data or API contracts
  - milestone sequencing
  - validation and demo proof
  - migration, rollout, and recovery
  - evidence-bearing living sections
  - interfaces and dependency contracts
- Do not keep asking low-value cleanup questions once the plan is implementation-ready.

When the grill is complete:
- Stop asking questions.
- Return:
  - `Grill complete` or `Grill blocked`
  - a concise list of resolved decisions
  - a concise list of any remaining blockers or explicit assumptions
  - a short list of exact edits that should be applied to the ExecPlan

Important constraints:
- Do not implement code.
- Do not rewrite the entire ExecPlan unless I explicitly ask you to.
- Do not ask me for information that the codebase can provide.
- Optimize for a fresh coding agent that will later execute the plan without chat history.
```
