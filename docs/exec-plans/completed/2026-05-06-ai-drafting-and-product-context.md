---
title: AI Drafting And Product Context
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add AI-backed operator-only support drafts in Telegram while keeping generated text out of visitor transcripts unless Parker explicitly sends it.
post_build_recap: Telegram support draft buttons now schedule private OpenAI Responses API generation, patch support action audit records with source/model/failure metadata, post generated or fallback notes only to Telegram, and keep AI output out of visitor transcripts.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-3.md
read_when:
  - Resuming the third Telegram support implementation slice.
  - Changing support AI draft generation or model configuration.
  - Validating that AI output stays operator-only.
---

# AI Drafting And Product Context

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Parker already has Telegram buttons that create deterministic private drafts and prompts. This slice makes those operator-only buttons more useful by generating Parker-side AI drafts from the latest support thread and safe public product context. The visitor still stays in the homepage widget, and AI text is never sent to the visitor automatically.

The behavior works when Parker taps `Draft reply`, `Summary`, `Codex prompt`, or `Linear draft` in a support topic, Telegram quickly acknowledges the tap, and a later bot note appears in that same private topic with generated text. The website transcript must not gain a new operator message from those AI buttons.

## Progress

- [x] 2026-05-06 EDT: Created this ExecPlan from `docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-3.md`.
- [x] 2026-05-06 EDT: Read root and app instructions, Convex AI guidance, Program packet, Slice 2 implementation, OpenAI text generation guidance, and current support tests before freezing the plan.
- [x] 2026-05-06 EDT: Implemented AI draft prompt construction, direct OpenAI Responses API calling, output parsing, Telegram note formatting, and deterministic fallback behavior in `apps/web/convex/support/aiDrafts.ts`.
- [x] 2026-05-06 EDT: Wired accepted operator-only draft actions to scheduled Convex generation, same-record audit patching, generated output source/model/failure metadata, and private Telegram operator notes.
- [x] 2026-05-06 EDT: Updated support bot docs, env docs, `.env.local.example`, and Program ledger with OpenAI setup, model override, missing-key fallback behavior, and the private-output invariant.
- [x] 2026-05-06 EDT: Added focused tests for prompt construction, Responses API parsing/calling, model fallback, provider failure handling, scheduled generation, latest-context loading, and the invariant that AI-backed actions do not insert visitor-visible support messages.
- [x] 2026-05-06 EDT: Ran hosted Convex codegen, focused support tests, adjacent support route/env/http tests, docs/plan/program linting, `git diff --check`, `bun --cwd apps/web lint`, and `bun typecheck`.

## Surprises & Discoveries

OpenAI's current text generation docs recommend the Responses API for direct model requests and warn that raw text should not be assumed at a fixed `output[0].content[0].text` path. The helper in this slice should aggregate `output_text` when present and otherwise walk all `output_text` content parts.

The OpenAI latest-model guidance names `gpt-5.5` as current and recommends pinned production snapshots for consistent behavior. This slice should default support drafts to a fast pinned snapshot, `gpt-5.4-mini-2026-03-17`, with `SUPPORT_AI_DRAFT_MODEL` as the explicit Convex env override.

Hosted Convex dev still lacks the support-specific Telegram env values from earlier slices. The AI code can be proven with unit tests and codegen, but live Telegram proof remains conditional on setting the documented provider env values.

The broad `bun --cwd apps/web format:check` gate still fails on unrelated pre-existing formatting issues in `apps/web/convex/workspace/model.ts` and `apps/web/tests/unit/workspace-findings-read-model.test.ts`. The support files touched by this slice were formatted directly with `oxfmt`, and `git diff --check` passed.

## Decision Log

Decision: Generate AI drafts in a scheduled Convex internal action, not inside the callback mutation.
Rationale: Convex mutations must stay deterministic and free of external I/O. Scheduling lets the Telegram webhook acknowledge callback taps quickly while the slower OpenAI call happens after the audited action record exists.
Date: 2026-05-06

Decision: Keep deterministic generated output as the first stored fallback for AI-capable operator actions.
Rationale: If OpenAI env is missing, the API fails, or Telegram note delivery fails, Parker still has safe private output and the visitor never sees generated text.
Date: 2026-05-06

Decision: Use direct `fetch` to the Responses API instead of adding a new SDK dependency.
Rationale: The repo has no OpenAI SDK dependency today. A small feature-local provider helper avoids lockfile churn and keeps the boundary easy to test with mocked fetch.
Date: 2026-05-06

Decision: Keep AI output private to `supportOperatorActions` and Telegram operator notes.
Rationale: Generated text can contain support transcript context. It belongs to the support retention boundary and must not enter `supportMessages`, PostHog, or customer-visible UI unless Parker later sends a normal reply.
Date: 2026-05-06

## Outcomes & Retrospective

This slice shipped an operator-only AI drafting lane for the existing Telegram support buttons. `Draft reply`, `Summary`, `Codex prompt`, and `Linear draft` still create a deterministic private fallback output first, then schedule a Convex internal action that calls the OpenAI Responses API with safe public product context and the latest bounded support transcript. Successful generation patches the same `supportOperatorActions` row with `generatedOutputSource: "openai_responses"` and the model name, then posts the generated note privately in the Telegram support topic. Missing keys or provider failures patch the same action row with deterministic output and `generationFailureReason`, then post the fallback note privately.

Generated AI output is never inserted into `supportMessages` by these buttons, so it does not appear in the homepage widget transcript automatically. Parker can still send a normal Telegram reply manually after reading or editing the draft; that manual reply remains the explicit customer-visible boundary.

The docs now name `OPENAI_API_KEY` and optional `SUPPORT_AI_DRAFT_MODEL` as hosted Convex env values, describe verification, and document the missing-key failure shape. Live Telegram/OpenAI proof was not run because the hosted Convex support Telegram env values and `OPENAI_API_KEY` are not configured in this checkout's current environment.

## Context and Orientation

The support backend lives in `apps/web/convex/support.ts` and feature-local helpers under `apps/web/convex/support/`. The Telegram webhook HTTP route in `apps/web/convex/http.ts` calls `internal.support.processTelegramSupportWebhookUpdate`, which parses Telegram updates and applies operator button callbacks. The support domain model in `apps/web/convex/support/model.ts` writes visitor messages, operator messages, threads, and `supportOperatorActions` audit records.

The existing operator button definitions live in `apps/web/convex/support/operatorActions.ts`. Slice 2 made `draft_reply`, `summarize_lead`, `generate_codex_prompt`, and `create_linear_draft` operator-only deterministic outputs. This slice should keep those action names and customer-visible boundaries, then add an asynchronous AI generation path after those callbacks are accepted.

The OpenAI provider boundary should be a small helper under `apps/web/convex/support/aiDrafts.ts`. It should build product-aware prompts, call `https://api.openai.com/v1/responses` with `Authorization: Bearer $OPENAI_API_KEY`, and parse text without assuming a single fixed response array position.

### In Scope

In scope: feature-local AI draft prompt construction; a direct Responses API helper with injected fetch for tests; Convex env keys `OPENAI_API_KEY` and `SUPPORT_AI_DRAFT_MODEL`; audit fields for generated output source, model, and failure reason; scheduled generation for `draft_reply`, `summarize_lead`, `generate_codex_prompt`, and `create_linear_draft`; Telegram operator notes for generated output; deterministic fallback output when AI is unavailable; docs and tests proving AI output stays operator-only.

### Out Of Scope

Out of scope: customer-visible AI auto-replies, new visitor UI, workspace support, retrieval over private code or logs, file search, web search, OpenAI hosted tools, Linear API writes, Stripe checkout session creation, uploads, CRM dashboards, analytics events containing message bodies or generated output, automatic visitor-message retries, and changes to the support session cookie authority.

## Plan of Work

First add the AI helper in `apps/web/convex/support/aiDrafts.ts`. It should define the default model snapshot, supported AI action types, safe product context, prompt builders, Responses API request construction, response text extraction, and provider error normalization. It should not import Convex generated types unless needed; keep pure helpers directly unit-testable.

Next extend `apps/web/convex/support/validators.ts` and `apps/web/convex/schema.ts` with optional audit fields on `supportOperatorActions`: `generatedOutputSource`, `generatedOutputModel`, and `generationFailureReason`. Do not change visitor message schema for AI drafts.

Then update `apps/web/convex/support/model.ts`. `applyOperatorActionFromTelegramHandler` should insert deterministic fallback output for AI-capable operator-only actions, mark the output source as `deterministic`, return the `operatorActionId`, and signal that an AI draft should be scheduled. Add a query that can load the action, thread, visitor, and latest bounded messages for generation. Add a mutation that patches the existing action with OpenAI output or a failure reason.

Then update `apps/web/convex/support.ts`. Add an internal action that reads `OPENAI_API_KEY`, reads optional `SUPPORT_AI_DRAFT_MODEL`, calls the AI helper, patches the action record, and posts the final private note back to Telegram. In `processTelegramSupportWebhookUpdate`, answer callback queries as soon as the action mutation returns, schedule the AI generation action for AI-capable results, and avoid sending deterministic fallback notes immediately for those AI-capable actions.

Finally update `apps/web/content/docs/telegram-support-bot.mdx`, `apps/web/content/docs/environment-variables.mdx`, `apps/web/.env.local.example`, and `docs/programs/active/2026-05-06-telegram-support-bot/program.md`. The docs must name the exact Convex env setup, verification steps, missing-key failure shape, and the invariant that AI draft output is private to Telegram and support action audit records.

## Milestones

The first milestone is provider and prompt helpers. Success means pure tests can build action-specific prompts, parse Responses API text from multiple output shapes, use the default model when no override is set, and report provider errors without leaking secrets.

The second milestone is Convex scheduling and audit. Success means an accepted AI-capable callback creates one operator action record with deterministic fallback output, schedules one background generation action, patches the same record when OpenAI succeeds or fails, and never inserts a `supportMessages` row for AI-generated text.

The third milestone is documentation and validation. Success means setup docs describe `OPENAI_API_KEY` and `SUPPORT_AI_DRAFT_MODEL`, Program truth points at this active child plan, hosted Convex codegen succeeds, focused support tests pass, and broad validation is run or any unrelated blockers are recorded.

## Concrete Steps

Work from the main checkout:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the relevant files before implementation:

    sed -n '1,260p' apps/web/convex/support/operatorActions.ts
    sed -n '1,760p' apps/web/convex/support/model.ts
    sed -n '1,360p' apps/web/convex/support.ts
    sed -n '1,220p' apps/web/convex/support/validators.ts
    sed -n '340,390p' apps/web/convex/schema.ts
    sed -n '1,260p' apps/web/content/docs/telegram-support-bot.mdx

Edit these files:

    apps/web/convex/support/aiDrafts.ts
    apps/web/convex/support/operatorActions.ts
    apps/web/convex/support/validators.ts
    apps/web/convex/schema.ts
    apps/web/convex/env.ts
    apps/web/convex/support/model.ts
    apps/web/convex/support.ts
    apps/web/content/docs/telegram-support-bot.mdx
    apps/web/content/docs/environment-variables.mdx
    apps/web/.env.local.example
    apps/web/tests/unit/support-ai-drafts.test.ts
    apps/web/tests/unit/convex-support-model.test.ts
    apps/web/tests/unit/support-telegram-update.test.ts
    docs/programs/active/2026-05-06-telegram-support-bot/program.md

Run hosted Convex codegen after schema or function changes:

    bun --cwd apps/web convex codegen

Run focused validation first:

    bun --cwd apps/web test:unit tests/unit/support-ai-drafts.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/convex-support-model.test.ts
    bun --cwd apps/web test:unit tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts tests/unit/convex-env.test.ts tests/unit/convex-http-boundary.test.ts

Run plan and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx apps/web/content/docs/environment-variables.mdx
    git diff --check

Run broader gates before completion where local dirt permits:

    bun --cwd apps/web lint
    bun typecheck
    bun --cwd apps/web format:check

## Validation and Acceptance

Acceptance is behavior-based. For every AI-capable operator-only callback, the support action audit must show a deterministic fallback first, then OpenAI output and model metadata when generation succeeds. If OpenAI env is absent or the API call fails, the action remains completed with deterministic output plus a generation failure reason. In every case, AI-generated text must not be inserted into `supportMessages` and must not appear in the website widget transcript automatically.

Telegram webhook behavior must stay retry-safe. Authenticated callback updates should return success after the action is accepted and scheduled. OpenAI failures and Telegram operator-note delivery failures must not cause Telegram webhook retries.

Live provider proof is conditional on support-specific Telegram env and `OPENAI_API_KEY` being configured in hosted Convex. If those values are absent, the final summary and this plan must say that live Telegram/OpenAI proof was not run.

### Test Commands

    bun --cwd apps/web convex codegen
    bun --cwd apps/web test:unit tests/unit/support-ai-drafts.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/convex-support-model.test.ts
    bun --cwd apps/web test:unit tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts tests/unit/convex-env.test.ts tests/unit/convex-http-boundary.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx apps/web/content/docs/environment-variables.mdx
    git diff --check
    bun --cwd apps/web lint
    bun typecheck

## Idempotence and Recovery

Callback idempotence remains owned by `telegramCallbackQueryId`. If Telegram retries the same button tap, `applyOperatorActionFromTelegramHandler` should return a duplicate result and should not schedule another AI generation. If the scheduled generation runs more than once anyway, patching the same action record with equivalent generated output is acceptable, but it must not create visitor-visible messages.

If OpenAI setup is missing, set `OPENAI_API_KEY` in hosted Convex env and tap the button again on a new callback. If model configuration is wrong, unset `SUPPORT_AI_DRAFT_MODEL` to fall back to `gpt-5.4-mini-2026-03-17`. If Telegram note delivery fails after generation, the audit record still contains the output for operator recovery.

## Artifacts and Notes

OpenAI docs used for this plan: `https://developers.openai.com/api/docs/guides/text` for Responses API text generation and output parsing guidance, and `https://developers.openai.com/api/docs/guides/latest-model.md` for current GPT-5.5/model snapshot guidance.

The existing Slice 2 tests already prove deterministic operator-only actions do not insert support messages. This slice should add AI-specific tests rather than weakening those assertions.

## Interfaces and Dependencies

The durable internal interfaces are the support action taxonomy in `apps/web/convex/support/operatorActions.ts`, the support model handlers in `apps/web/convex/support/model.ts`, the Convex functions in `apps/web/convex/support.ts`, the support schema in `apps/web/convex/schema.ts`, and the support setup docs in `apps/web/content/docs/telegram-support-bot.mdx`.

External dependencies are Telegram Bot API `answerCallbackQuery` and `sendMessage`, OpenAI Responses API `POST /v1/responses`, hosted Convex env values `OPENAI_API_KEY` and optional `SUPPORT_AI_DRAFT_MODEL`, plus the existing support Telegram env values from Slices 1 and 2.
