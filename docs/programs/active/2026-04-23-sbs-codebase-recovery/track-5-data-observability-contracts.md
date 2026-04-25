# Data Observability Contracts Research

This research pass captures the Convex and observability data-contract issues.

## Findings

Observability currently has multiple eras of data shape. Older error-event paths and newer incident-ledger paths coexist, and incident records can behave as both rollups and event records. That makes export, debugging, and intake projection less trustworthy.

Some auth-linked records use provider subject-style identity in ways that may be less durable than the repository's intended stable identity boundary. This should be resolved deliberately instead of changing one consumer at a time.

Client error reports can lose stack detail before reaching the incident ledger. Engineering-intake contracts also cross from `apps/web` into `qa/scripts` helpers, which makes ownership blurry.

## Durable Implication

The fifth child ExecPlan should harden the observability and data contracts after the immediate runtime footguns are removed. It should separate event occurrence truth from rollup truth and make export boundaries intentional.
