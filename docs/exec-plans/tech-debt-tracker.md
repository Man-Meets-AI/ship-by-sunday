---
title: "Quality Tech Debt Tracker"
summary: "Shared tracker for durable repo-quality follow-ups discovered during validation, docs gardening, and harness cleanup."
docType: "tracker"
status: "active"
read_when:
  - "Recording durable repo-quality debt that should survive beyond one implementation run."
  - "Reviewing follow-ups that may later become ExecPlans."
---

# Quality Tech Debt Tracker

Use this file for durable repo-quality follow-ups when the note should survive beyond one implementation run or one initiative-specific ExecPlan.

## Severity Framework

- `P0`: fix now because a hard guardrail or core user flow is broken
- `P1`: schedule soon because the issue materially weakens product quality or system reliability
- `P2`: keep in the backlog for planned debt collection work
- `P3`: record only when it helps a broader future cleanup or trend line

## Active Follow-Ups

| Debt ID | Surface | Priority | Summary | Follow Up | Status |
| --- | --- | --- | --- | --- | --- |
| remote-workflow-proof | `.github/workflows/` | P1 | The replacement PR and deployment-smoke workflows are validated locally but still need one successful GitHub-hosted run once the branch exists remotely. | Push the branch, run the replacement workflows in GitHub Actions, and record the results in the active harness-reset ExecPlan. | open |

## Notes On Use

- Keep issue-level implementation detail inside the owning ExecPlan until the work is complete.
- Do not turn this file into a day-to-day task queue.
- Use git history to track which notes were added, removed, or reclassified over time.
