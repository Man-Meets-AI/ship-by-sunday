# AGENTS.md

Use this file to define Ship by Sunday-generated marketing GPTs, skills, and repeatable workflow automations for a customer product.

## Global rules for all marketing workflows

- Stable knowledge belongs in the packet, not in chat history.
- Fresh facts must be verified when the output depends on current information.
- Every externally visible workflow must define human review before publish.
- Marketing outputs must stay inside approved claims and do-not-say rules.
- Treat channel scope as a hard boundary, not a suggestion.

## Required product facts

- brand voice summary
- approved claims
- do-not-say rules
- channel scope
- marketing goals
- buyer AI promise
- human review rules
- current-facts policy

## Current-facts rule

If the output depends on current facts, the workflow must use one of:

- web research
- connected sources
- a fresh uploaded file
- explicit human confirmation

Do not treat stable packet knowledge as automatically current.

## Human-check rule

No external content should be auto-published from this pack.

Define:

- what can be drafted without approval
- what requires human review
- what must never be sent or published automatically

## Output rule

Every workflow should define:

- primary deliverable
- required sections
- required citations when research is involved
- brand constraints
- confidence or caveat rules
- review note for the human approver

Use these files together:

- `claims.md`
- `review-matrix.md`
- `deliverables.md`

## Suggested starter workflow types

- launch page and email kit
- competitor or market research
- customer story or proof harvesting
- social and channel adaptation
- weekly performance digest
- internal review brief for claims and channel fit
