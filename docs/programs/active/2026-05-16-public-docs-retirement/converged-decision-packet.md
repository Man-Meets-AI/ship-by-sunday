---
title: "Public Docs Retirement Converged Decision Packet"
summary: "Canonical decisions for removing public docs while preserving blog and setup truth."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the final decision on /docs."
  - "Resolving whether docs should be disabled, hidden, or deleted."
  - "Checking what setup truth must survive."
---

# Public Docs Retirement Converged Decision Packet

## Decisions

Decision: Delete the public `/docs` surface rather than further demoting it.

Rationale: `/docs` is already unpromoted and noindexed, but it still carries runtime, content, test, and tooling cost.

Decision: Delete docs MDX under `apps/web/src/content/docs`.

Rationale: Keeping the corpus after route deletion leaves stale public docs content for future agents to maintain by accident.

Decision: Keep blog MDX under `apps/web/src/content/blog`.

Rationale: Blog is a separate public publishing surface and remains active.

Decision: Preserve setup truth in non-public durable docs before deleting public docs MDX.

Rationale: Provider setup and verification contracts are part of the shipped operator/customer setup contract even when public docs are removed.

Decision: Use `docs/internal/`, `README.md`, release docs, and active provider Program/ExecPlan docs as setup-truth targets.

Rationale: Future workers already look there for operator and provider setup, and these paths do not imply a customer-facing docs product.

Decision: Remove docs-specific route, loader, navigation, metadata, theme, CSS, tests, config, and markdown family references.

Rationale: Leaving any of those in place keeps a zombie docs module alive.

Decision: Treat missing `/docs` behavior as an intentional public contract.

Rationale: The child ExecPlan must choose and test the final behavior, whether default 404 or explicit redirect, rather than inheriting accidental routing.

Decision: Supersede prior direct-link `/docs` decisions.

Rationale: Earlier work intentionally kept `/docs` reachable for a first demotion pass. This Program records the later stronger product decision.

## Non-Decisions

This packet does not decide to remove blog.

This packet does not decide to remove the repo's internal docs spine under `docs/`.

This packet does not decide to remove generated customer docs under `docs/generated/`.

This packet does not decide to implement Telegram widget UI, Starter preview work, billing changes, or generated repo redesign.

This packet does not decide to preserve every word from public docs MDX. Only setup truth that a future worker needs should survive.
