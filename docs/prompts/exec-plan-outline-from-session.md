# ExecPlan Outline From Session

Use this when a feature has just been discussed in the current Codex shell and the next step is to distill that noisy session transcript into a clean outline artifact that a later prompt can turn into a full ExecPlan.

## Preferred usage

Use this in normal agent mode as a non-interactive preprocessing step before `docs/prompts/exec-plan-writer.md`.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next so your outline matches the real ExecPlan contract used in this repository.

You are not writing the final ExecPlan yet. Your job is to convert one noisy Codex shell session transcript into one clean feature outline markdown artifact that can be handed to `docs/prompts/exec-plan-writer.md`.

Inputs:
- the current shell transcript or discussion
- any already-approved scope boundaries, risks, or rollout notes

What to extract:
- the user-visible goal
- the most important scope boundaries
- the affected repository areas
- open questions that must be answered before the full plan is written
- the first obvious milestone grouping
- the proof expectations if they are already clear

Output rules:
- Do not write the final ExecPlan.
- Produce one concise markdown outline that a later planning pass can expand.
- Keep the outline concrete and repository-specific.
- Prefer repository-relative paths over vague summaries.
```
