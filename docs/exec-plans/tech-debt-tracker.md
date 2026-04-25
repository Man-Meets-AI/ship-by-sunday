---
title: 'Quality Tech Debt Tracker'
summary: 'Shared tracker for durable repo-quality follow-ups discovered by quality review, doc gardening, and guardrail audits.'
docType: 'tracker'
status: 'active'
read_when:
  - 'Recording repo-quality debt discovered during quality-score review or doc-gardening work.'
  - 'Reviewing durable follow-up notes that may later become ExecPlans, scheduled jobs, or cron-driven agent work.'
---

# Quality Tech Debt Tracker

Use this file for durable repo-quality follow-ups when the note should survive beyond one implementation run or one initiative-specific ExecPlan.

Capture only concrete debt, guardrail mismatches, missing automation, or contract follow-ups that should survive beyond a single implementation run. This includes notes emitted by `QUALITY_SCORE.review` when Codex audits business logic against the repo guardrails and finds work that should later be scheduled for an agent or cron lane.

## Severity Framework

- `P0`: fix now because a hard guardrail or core user flow is broken
- `P1`: schedule soon because the issue materially weakens product quality or system reliability
- `P2`: keep in the backlog for planned debt collection work
- `P3`: record only when it helps a broader future cleanup or trend line

## Active Follow-Ups

| Debt ID | Surface | Priority | Fix Now | Owner | Summary | Follow Up | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | Repo Quality | P3 | no | docs/exec-plans | No open broad repo-quality debt is recorded in this tracker after the Codex-style docs cleanup reset. | Add concrete SBS-owned debt here only when it does not fit one active ExecPlan. | closed |

## Notes On Use

- Keep issue-level implementation detail inside the owning ExecPlan until the work is complete.
- Do not turn this file into a day-to-day task queue.
- Use git history to track which notes were added, removed, or reclassified over time.
