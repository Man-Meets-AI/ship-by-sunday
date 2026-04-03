# ExecPlan Outline From Session

Use this when a feature has just been discussed in the current Codex shell and the next step is to distill that noisy session transcript into a clean outline artifact that a later prompt can turn into a full ExecPlan.

## Why this prompt exists

The current shell transcript is a useful record, but it is not a good direct planning artifact. It mixes dead ends, partial ideas, repo inspection, and execution chatter. This prompt turns the full session transcript into a concise, reusable outline that preserves the real feature intent, constraints, repo context, and unresolved decisions.

## Preferred usage

Use this in normal agent mode as a non-interactive preprocessing step before `docs/prompts/execplan-writer.md`.

```text
Distill this Codex session transcript into a clean feature outline.
```

Then paste the prompt below and provide the transcript payload.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

You are not writing the final ExecPlan yet. Your job is to convert one noisy Codex shell session transcript into one clean feature outline markdown artifact that can be handed to `docs/prompts/execplan-writer.md`.

The transcript may contain false starts, dead branches, repeated instructions, repo inspection chatter, validation chatter, and local execution details that should not all survive into the outline. Distill the transcript down to the feature intent that still matters.

Assume the transcript comes from one current Codex shell session that is primarily about one feature or one tightly related initiative. If minor side topics appear, keep the main feature and discard the side topics unless they materially affect the plan.

Use this transcript input:
<session_transcript>
Paste the distilled readable transcript payload here. This may come from a session JSONL file that has already been converted into plain text.
</session_transcript>

Optional extra constraints:
<extra_constraints>
Add any operator notes about scope, timeline, rollout, or execution posture here.
</extra_constraints>

Output requirements:
- Return only Markdown for the outline artifact.
- Do not write the final ExecPlan.
- Do not invent product requirements that are not grounded in the transcript.
- Prefer the latest clearly stated intent when the transcript contains conflicting directions.
- If the transcript leaves a materially important decision unresolved, keep it under `Open questions` instead of guessing.
- If the transcript already resolved a branch, present the resolved choice directly and omit the abandoned alternatives unless they are still important context.
- Keep the outline concise, concrete, and useful for a later planning pass.

Write the outline with exactly these sections in this order:
- `# Feature Outline`
- `## Goal`
- `## User-visible outcome`
- `## In scope`
- `## Constraints and non-goals`
- `## Relevant repo surfaces`
- `## Validation expectations`
- `## Open questions`
- `## Transcript-derived notes`

Section guidance:
- `Goal`: the main thing the user is trying to accomplish.
- `User-visible outcome`: what exists or works after the change.
- `In scope`: the concrete work that belongs in the feature.
- `Constraints and non-goals`: explicit limits, sequencing rules, safety boundaries, or things the transcript ruled out.
- `Relevant repo surfaces`: the files, folders, commands, systems, or docs that the writer will likely need to inspect.
- `Validation expectations`: the tests, smoke checks, or observed behaviors the transcript implies must exist.
- `Open questions`: only the unresolved items that would materially affect the plan.
- `Transcript-derived notes`: short evidence-bearing notes from the transcript that preserve important nuance without dumping raw chat.

Output behavior:
- If the transcript is truly too fragmented to identify one main feature, say so clearly under `Open questions` and still produce the best possible outline.
- Do not ask the user follow-up questions in this step.
- Return only the outline Markdown.
```
