---
title: "Quality Score"
summary: "Landing surface for repo-quality status and durable follow-up debt in Ship by Sunday."
docType: "guide"
status: "active"
read_when:
  - "You need the durable landing doc for repo-quality follow-ups."
  - "You are checking where harness or docs drift should be tracked."
---

# Quality Score

This file is the stable landing surface for repo-quality status. In Ship by Sunday, repo quality is measured primarily by whether the canonical validation surface stays green and whether the checked-in docs still describe the real system truthfully.

## Owns

- the first-hop explanation of how repo quality is judged
- routing to the durable tech-debt tracker and active cleanup plans
- the expectation that docs truth, test structure, and workflow simplicity are all part of quality

## Does Not Own

- a generated numeric scoring engine
- feature-level acceptance criteria
- day-to-day task management

## Current Quality Signal

The current quality surface for this repository is the required root command set:

```bash
bun run format
bun run lint
bun run typecheck
bun run test
bun run test:contracts
bun run build
bun run test:e2e
```

When those commands pass and the live docs match the live runtime, the repo is in a good local state. When a durable mismatch remains, record it in the tech-debt tracker or the active ExecPlan that owns the cleanup.

## Current Durable Follow-Up

| Debt ID | Surface | Priority | Summary | Follow Up | Status |
| --- | --- | --- | --- | --- | --- |
| remote-workflow-proof | `.github/workflows/` | P1 | The new PR and deployment-smoke workflows are green locally by contract but cannot be proven in GitHub Actions until the branch exists remotely. | After push, run the replacement workflows in GitHub Actions and record the results in the active ExecPlan. | open |

## Next

- Use [docs/exec-plans/tech-debt-tracker.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/tech-debt-tracker.md) for durable repo-quality follow-ups.
- Use [docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md) for the active harness-reset implementation record.
