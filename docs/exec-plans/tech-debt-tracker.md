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
| connection_integrations-untested-provider-boundaries | Connection Integrations | P1 | yes | apps/runtime/src/connections | Some provider or executor leaves still expose runtime integrations without focused tests at the boundary. | Add focused boundary tests for the untested connection leaves: youtube, chrome, auphonic, browser. | open |
| final-cut-captions-missing-manifest | Final Cut Captions | P1 | yes | apps/runtime/src/workflows/final-cut-captions | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `final-cut-captions` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| fr-chad-transcripts-missing-manifest | Fr Chad Transcripts | P1 | yes | apps/runtime/src/workflows/fr-chad-transcripts | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `fr-chad-transcripts` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| fr-chad-transcripts-missing-tests | Fr Chad Transcripts | P1 | yes | apps/runtime/src/workflows/fr-chad-transcripts | The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. | Add focused tests for `fr-chad-transcripts` before expanding the surface further. | open |
| media-transcript-missing-manifest | Media Transcript | P1 | yes | apps/runtime/src/workflows/media-transcript | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `media-transcript` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| media-transcript-missing-tests | Media Transcript | P1 | yes | apps/runtime/src/workflows/media-transcript | The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. | Add focused tests for `media-transcript` before expanding the surface further. | open |
| routing-missing-manifest | Routing | P1 | yes | apps/runtime/src/workflows/routing | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `routing` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| video-course-transcripts-missing-manifest | Video Course Transcripts | P1 | yes | apps/runtime/src/workflows/video-course-transcripts | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `video-course-transcripts` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| video-course-transcripts-missing-tests | Video Course Transcripts | P1 | yes | apps/runtime/src/workflows/video-course-transcripts | The workflow has no focused tests, so Codex cannot cheaply verify whether this business logic is still behaving as intended. | Add focused tests for `video-course-transcripts` before expanding the surface further. | open |
| workflow_business_logic-workflow-manifest-coverage | Workflow Business Logic | P1 | yes | apps/runtime/src/workflows | Several workflow domains still lack explicit manifest contracts, which makes business-logic discovery weaker than the repo guardrails require. | Backfill manifest coverage for the workflow domains with missing contract surfaces: Final Cut Captions, Fr Chad Transcripts, Media Transcript, Routing, Video Course Transcripts, x Commentary. | open |
| workflow_business_logic-workflow-test-coverage | Workflow Business Logic | P1 | yes | apps/runtime/src/workflows | Several workflow domains still lack focused tests, so the highest-value business logic is not fully reviewable by agents. | Add focused tests for the workflow domains missing them: Fr Chad Transcripts, Media Transcript, Video Course Transcripts. | open |
| x-commentary-missing-manifest | x Commentary | P1 | yes | apps/runtime/src/workflows/x-commentary | The workflow lacks `manifest.ts`, which weakens discoverability and contract legibility for this business-logic surface. | Add a checked-in manifest for `x-commentary` so agents can discover the workflow contract without reverse-engineering its source files. | open |
| fr-chad-transcripts-missing-readme | Fr Chad Transcripts | P2 | no | apps/runtime/src/workflows/fr-chad-transcripts | The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. | Add a local README for `fr-chad-transcripts` that explains what the workflow owns, how it runs, and which files matter most. | open |
| media-transcript-missing-readme | Media Transcript | P2 | no | apps/runtime/src/workflows/media-transcript | The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. | Add a local README for `media-transcript` that explains what the workflow owns, how it runs, and which files matter most. | open |
| routing-missing-readme | Routing | P2 | no | apps/runtime/src/workflows/routing | The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. | Add a local README for `routing` that explains what the workflow owns, how it runs, and which files matter most. | open |
| video-course-transcripts-missing-readme | Video Course Transcripts | P2 | no | apps/runtime/src/workflows/video-course-transcripts | The workflow lacks a local `README.md`, which makes the ownership boundary and operating contract harder to inspect in-repo. | Add a local README for `video-course-transcripts` that explains what the workflow owns, how it runs, and which files matter most. | open |
| workflow_business_logic-workflow-owner-doc-coverage | Workflow Business Logic | P2 | no | apps/runtime/src/workflows | Some workflow domains still lack local owner docs, which weakens progressive disclosure for agents. | Add or restore local README coverage for the undocumented workflow domains: Fr Chad Transcripts, Media Transcript, Routing, Video Course Transcripts. | open |

## Notes On Use

- Keep issue-level implementation detail inside the owning ExecPlan until the work is complete.
- Do not turn this file into a day-to-day task queue.
- Use git history to track which notes were added, removed, or reclassified over time.
