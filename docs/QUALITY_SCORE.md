---
title: 'Quality Score'
summary: 'Landing surface for repo-wide quality scoring across product domains, architectural layers, and durable gap tracking.'
docType: 'guide'
status: 'active'
read_when:
  - 'You need the durable landing doc for repo-wide quality scoring.'
  - 'You are checking where harness-health gaps should be tracked.'
---

# Quality Score

This file is the stable landing surface for repo-wide harness-health scoring. It is refreshed from repo-visible probes so product-domain and architectural-layer drift stays legible in checked-in Markdown.

## Owns

- the first-hop explanation of what the repo-wide quality score is for
- the expectation that quality is graded per product domain and per architectural layer, not only as one blended repo score
- the contract that `QUALITY_SCORE.review` is the audit hook for Codex to compare business logic against repo guardrails
- routing to the durable tech-debt tracker and the adjacent automation plan
- the promise that harness-health is a tracked repo concern, not ad hoc cleanup

## Does Not Own

- the scoring engine or refresh automation itself
- day-to-day task management
- feature-level acceptance criteria
- direct execution of the follow-up work that later cron-driven agents may pick up

## Current State

The current score is `90 / 100` with grade `A`. Product-domain and architectural-layer gaps are tracked here in deterministic tables, while git history tracks how those gaps move over time.

## Overall Score

- overall score: `90 / 100`
- overall grade: `A`
- product domains reviewed: `26`
- architectural layers reviewed: `8`
- durable follow-up notes open: `17`

## Review Framework

`QUALITY_SCORE.review` audits the app's defined business logic against repo-visible guardrails such as owner docs, contract surfaces, focused tests, validation scripts, and safety docs. It should classify findings with a simple code-authoring triage model:

- `P0`: broken hard guardrail, security issue, data-loss path, or broken core flow
- `P1`: meaningful product, reliability, or maintainability issue worth near-term scheduled work
- `P2`: valid debt that should wait for planned cleanup work
- `P3`: low-leverage note that usually should not spawn immediate work on its own

The rule is simple: each finding should say what is wrong, why it is or is not worth fixing now, and whether it should become a durable follow-up note.

## Product Domains

| Surface | Grade | Score | Priority | Fix Now | Guardrail Mismatches | Review |
| --- | --- | --- | --- | --- | --- | --- |
| Codex Release Watch | A | 100 | - | no | none | Codex Release Watch passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Company Scorecard | A | 100 | - | no | none | Company Scorecard passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Dev | A | 100 | - | no | none | Dev passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Execplan Feature Workflow | A | 100 | - | no | none | Execplan Feature Workflow passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Executive Assistant | A | 100 | - | no | none | Executive Assistant passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Final Cut Captions | C | 75 | P1 | yes | workflow_contract_surface | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. Follow-up: Add a checked-in manifest for `final-cut-captions` so agents can discover the workflow contract without reverse-engineering its source files. |
| Fr Chad Transcripts | F | 40 | P1 | yes | workflow_contract_surface, focused_tests, owner_doc | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. Follow-up: Add a checked-in manifest for `fr-chad-transcripts` so agents can discover the workflow contract without reverse-engineering its source files. |
| Marketing Graphics | A | 100 | - | no | none | Marketing Graphics passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Media Transcript | F | 40 | P1 | yes | workflow_contract_surface, focused_tests, owner_doc | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. Follow-up: Add a checked-in manifest for `media-transcript` so agents can discover the workflow contract without reverse-engineering its source files. |
| Operator Day Brief | A | 100 | - | no | none | Operator Day Brief passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Reddit Dataisbeautiful Discord | A | 100 | - | no | none | Reddit Dataisbeautiful Discord passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Repo Scout | A | 100 | - | no | none | Repo Scout passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Routing | D | 65 | P1 | yes | workflow_contract_surface, owner_doc | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. Follow-up: Add a checked-in manifest for `routing` so agents can discover the workflow contract without reverse-engineering its source files. |
| Runs | A | 100 | - | no | none | Runs passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Systems Workshop | A | 100 | - | no | none | Systems Workshop passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Thumbnail Variant Build | A | 100 | - | no | none | Thumbnail Variant Build passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Video Course Transcripts | F | 40 | P1 | yes | workflow_contract_surface, focused_tests, owner_doc | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. Follow-up: Add a checked-in manifest for `video-course-transcripts` so agents can discover the workflow contract without reverse-engineering its source files. |
| Working Cut Build | A | 100 | - | no | none | Working Cut Build passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Workshop Post Scout | A | 100 | - | no | none | Workshop Post Scout passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Writer Youtube Swipe Extract | A | 100 | - | no | none | Writer Youtube Swipe Extract passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| x Commentary | C | 75 | P1 | yes | workflow_contract_surface | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. Follow-up: Add a checked-in manifest for `x-commentary` so agents can discover the workflow contract without reverse-engineering its source files. |
| x Daily Scout | A | 100 | - | no | none | x Daily Scout passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| x Posting | A | 100 | - | no | none | x Posting passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Youtube Channel2 Pipeline | A | 100 | - | no | none | Youtube Channel2 Pipeline passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Youtube Summarizer | A | 100 | - | no | none | Youtube Summarizer passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Youtube Thumbnail Swipe | A | 100 | - | no | none | Youtube Thumbnail Swipe passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |

## Architectural Layers

| Surface | Grade | Score | Priority | Fix Now | Guardrail Mismatches | Review |
| --- | --- | --- | --- | --- | --- | --- |
| Case Management | A | 100 | - | no | none | Case Management passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Channel Adapters | A | 100 | - | no | none | Channel Adapters passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Connection Integrations | C | 75 | P1 | yes | focused_tests | Some provider or executor leaves still expose runtime integrations without focused tests at the boundary. Follow-up: Add focused boundary tests for the untested connection leaves: youtube, chrome, auphonic, browser. |
| Daemon Runtime Services | A | 100 | - | no | none | Daemon Runtime Services passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Docs And Validation | A | 100 | - | no | none | Docs And Validation passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Safety And Guardrails | A | 100 | - | no | none | Safety And Guardrails passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Worker Dashboard | A | 100 | - | no | none | Worker Dashboard passes the current repo-visible guardrails for docs, contract surfaces, and focused tests. |
| Workflow Business Logic | F | 40 | P1 | yes | workflow_contract_surface, focused_tests, owner_doc | Several workflow domains still lack explicit manifest contracts, which makes business-logic discovery weaker than the repo guardrails require. Several workflow domains still lack focused tests, so the highest-value business logic is not fully reviewable by agents. Some workflow domains still lack local owner docs, which weakens progressive disclosure for agents. Follow-up: Backfill manifest coverage for the workflow domains with missing contract surfaces: Final Cut Captions, Fr Chad Transcripts, Media Transcript, Routing, Video Course Transcripts, x Commentary. |

## Current Findings

Tracked evidence from the highest-priority reviewed surfaces:

- `Final Cut Captions`: owner path: apps/runtime/src/workflows/final-cut-captions; source files: 14; focused tests: 7; README.md: present; manifest.ts: missing; run entry files: 1
- `Fr Chad Transcripts`: owner path: apps/runtime/src/workflows/fr-chad-transcripts; source files: 1; focused tests: 0; README.md: missing; manifest.ts: missing; run entry files: 0
- `Media Transcript`: owner path: apps/runtime/src/workflows/media-transcript; source files: 1; focused tests: 0; README.md: missing; manifest.ts: missing; run entry files: 0
- `Routing`: owner path: apps/runtime/src/workflows/routing; source files: 3; focused tests: 2; README.md: missing; manifest.ts: missing; run entry files: 0
- `Video Course Transcripts`: owner path: apps/runtime/src/workflows/video-course-transcripts; source files: 1; focused tests: 0; README.md: missing; manifest.ts: missing; run entry files: 0

## Next

- Use [docs/exec-plans/tech-debt-tracker.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/tech-debt-tracker.md) for the durable repo-quality debt ledger.
- Track any follow-up implementation plan under [docs/exec-plans/active/](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md).
