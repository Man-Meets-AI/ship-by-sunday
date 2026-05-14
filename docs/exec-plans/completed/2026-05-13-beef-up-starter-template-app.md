---
title: Beef Up Starter Template App
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Replace the Starter template's customer-facing Notes sample with a protected ChatGPT-style BYO OpenAI chat app while preserving no-provider generated repo proof.
post_build_recap: The pinned Starter template source now ships a protected `/chat` app with Convex-owned conversations/messages, a ChatGPT-style sidebar/composer/model selector, server-only OpenAI Responses streaming, setup-gated `OPENAI_API_KEY`, and updated generator contracts that preserve clean-room no-provider proof.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-5.md
read_when:
  - Resuming the Starter template chat-app slice.
  - Changing generated Starter app routes, Convex chat state, or OpenAI setup behavior.
  - Validating generated no-provider output after template-source changes.
---

# Beef Up Starter Template App

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The generated Starter repo should feel like a real AI app starter, not a generic shell with a Notes demo. After this slice, a customer can open the protected `/chat` surface, see a conversation sidebar, select from an app-owned model allowlist, send prompts through server-side OpenAI calls once configured, and still install, lint, typecheck, and inspect the generated repo before creating Clerk, Convex, Stripe, or OpenAI provider accounts.

## Progress

- [x] 2026-05-13 EDT: Created this ExecPlan from planning brief 5 and confirmed the owning Program requires `/chat`, Convex-owned conversation state, server-only `OPENAI_API_KEY`, model allowlisting, streaming assistant output, and no-provider proof.
- [x] 2026-05-13 EDT: Updated the pinned template source from Notes-first to Chat-first.
- [x] 2026-05-13 EDT: Updated generator materialization and snapshot contracts so generated repos include `/chat` and no longer expose the Notes sample as customer-facing output.
- [x] 2026-05-13 EDT: Updated tests, template provenance, and Program ledger.
- [x] 2026-05-13 EDT: Ran focused compiler/generated-output validation and recorded the outcome.

## Surprises & Discoveries

The OpenAI docs now recommend GPT-5.5 with the Responses API for GPT-5-series work, using `previous_response_id` for multi-turn state, `reasoning.effort`, `text.verbosity`, and streamed semantic events such as `response.output_text.delta`. This slice should use server-side `fetch` instead of adding an SDK dependency, because package management stays Bun and generated repos should not grow a new dependency for the first chat boundary.

The standalone pinned source tree's `bun run typecheck` still fails in this checkout on preexisting source-template packages that are not installed here: `@react-email/components`, `@react-email/render`, `resend`, and `vite-tsconfig-paths`. The generated repo proof remains authoritative for customer output; it excludes or stubs those provider-heavy source files and passed clean-room no-provider validation.

## Decision Log

Decision: Keep conversation and message state in Convex.
Rationale: The sibling template convention is to model product state in Convex first. `/chat` is product behavior tied to persistence and billing limits, so a Convex action should own the OpenAI request and update subscribed message state rather than routing chat through a detached Next.js API endpoint.
Date: 2026-05-13.

Decision: Use `OPENAI_API_KEY` as a server-only environment variable.
Rationale: BYO OpenAI means the template buyer or operator supplies the app key. The first version should not store arbitrary end-user keys or expose OpenAI credentials to browser code.
Date: 2026-05-13.

Decision: Allow only one in-flight assistant response per conversation.
Rationale: One active stream keeps `previous_response_id`, retry behavior, free usage counting, and UI state coherent in the first customer-ready template.
Date: 2026-05-13.

Decision: Keep generated clean-room proof no-provider safe.
Rationale: Buyers must be able to run the generated repo before configuring Clerk, Convex, Stripe, or OpenAI. Missing providers should render setup states and keep validation commands passing.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed on 2026-05-13. The pinned Starter template source now exposes `/chat` as the protected product route instead of the old Notes sample. Chat state is Convex-owned through `chatConversations` and `chatMessages`; sends and retries run through server-side OpenAI Responses API streaming; model selection is constrained to an app-owned allowlist; failed assistant messages stay visible and retryable; and missing `OPENAI_API_KEY` renders a setup-gated state instead of requiring a live provider during clean-room proof.

Generated Starter repos now include the chat source, chat env examples, chat nav/dashboard entry points, updated template provenance, and snapshot tests that assert `/chat`, no customer-facing `/notes`, no browser-reachable OpenAI key access, and preserved no-provider command proof. A post-review fix made OpenAI streaming fail closed unless `response.completed` arrives and overlaid generated `src/proxy.ts` so clean-room no-provider `/chat` can render setup UI before Clerk is configured. The template manifest is pinned at `2026-05-13-chat-starter`, file count `134`, digest `sha256-5a0c27830caa417749264f5968c28a44083b63b742260a11c4757702c2924755`.

Validation passed: chat rules behavior probe, focused compiler/template tests including generated clean-room no-provider command contract, codebase-compiler typecheck, codebase-compiler lint, codebase-compiler format check, plan lint, Program lint, markdown metadata lint, template manifest pin probe, and scoped diff whitespace check. The standalone pinned source typecheck limitation is recorded in Surprises & Discoveries.

## Context and Orientation

The pinned template source lives under `templates/starter-app/source`. It is a single Next.js app root that the compiler maps into generated `apps/web/`. The materializer is `packages/codebase-compiler/src/repo-generation/materialize-starter-template-source.ts`, provenance and overlay rules live in `templates/starter-app/template-source.json`, and generated app overlays live in `packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts`.

The existing customer-facing sample is Notes. Its main files are `templates/starter-app/source/src/app/(app)/notes/page.tsx`, `templates/starter-app/source/src/components/app/notes-workbench.tsx`, `templates/starter-app/source/convex/notes.ts`, and `templates/starter-app/source/src/lib/notes/rules.ts`. This slice replaces that customer surface with Chat. The new product route is `templates/starter-app/source/src/app/(app)/chat/page.tsx`; the client workbench should live under `templates/starter-app/source/src/components/app/`; chat rules and model allowlists should live under `templates/starter-app/source/src/lib/chat/`; Convex chat state and OpenAI calls should live under `templates/starter-app/source/convex/chat.ts`.

### In Scope

Build the protected `/chat` Starter template surface, Convex conversation/message schema, server-only OpenAI Responses API streaming action, model allowlist, missing OpenAI setup state, dashboard/nav entry points, no-provider generated repo behavior, template manifest provenance updates, focused generator tests, and the owning Program ledger update.

### Out Of Scope

Do not fetch or mutate `~/Developer/next-js-convex-clerk-stripe-template`. Do not add end-user OpenAI key storage, OAuth, file upload, tools, image generation, vector search, direct download route changes, or live provider requirements to clean-room generated proof. Do not copy Worker Dashboard route names or local-runner concepts into customer output.

## Plan of Work

First, add the Chat domain to the pinned template source: schema tables, Convex functions, chat rules, model allowlist, `/chat` page, chat workbench, and route/nav/dashboard updates. Then adjust template materialization so generated repos expose the Chat route and stop exposing the old Notes sample. Next, update `templates/starter-app/template-source.json` with the new required files and digest, update tests that assert template and generated snapshot shape, and update this Program's ledger so the active child plan is visible. Finally, run focused compiler tests, typecheck, lint, format checks, plan lint, Program lint, markdown lint, and diff whitespace checks.

## Milestones

The first milestone is planning and source orientation. It is complete when this ExecPlan exists and the current template/generator/test surfaces are mapped.

The second milestone is chat template implementation. It is complete when `/chat` renders a polished workbench, uses Convex state for conversations and messages, keeps OpenAI calls server-side, blocks missing `OPENAI_API_KEY` with a clear setup state, and avoids exposing the Notes demo in customer navigation.

The third milestone is generated output proof. It is complete when generated repo tests assert `/chat`, no customer-facing `/notes`, updated template provenance, no client OpenAI key leakage, and preserved no-provider command contract.

The fourth milestone is Program completion. It is complete when this plan and the owning Program ledger record the finished outcome and all validation has passed.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect source and tests:

    rg --line-number --fixed-strings 'notes' packages/codebase-compiler templates/starter-app

Run focused validation before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-beef-up-starter-template-app.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-beef-up-starter-template-app.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/program.md

## Validation and Acceptance

The slice is acceptable when the generated Starter app has a protected `/chat` route with a conversation sidebar, message timeline, composer, model picker, missing OpenAI setup state, Convex-owned conversations/messages, server-only OpenAI Responses API calls, one in-flight response per conversation, retryable failed assistant messages, and no customer-facing Notes sample route. Generated repos must still pass clean-room no-provider proof without live Clerk, Convex, Stripe, or OpenAI configuration.

### Test Commands

Run these commands before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-beef-up-starter-template-app.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-beef-up-starter-template-app.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/program.md

## Idempotence and Recovery

Keep edits scoped to the Starter template source, compiler generation contracts, focused tests, and this Program packet. If generated proof fails, inspect the materialized repo snapshot and fix the generator or template source rather than weakening the clean-room contract. If OpenAI streaming behavior fails, preserve Convex message state and mark the assistant message failed instead of deleting user-visible history.

## Artifacts and Notes

Owning Program: `docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/program.md`.

Planning brief: `docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-5.md`.

OpenAI docs checked for this slice: `https://developers.openai.com/api/docs/guides/latest-model`, `https://developers.openai.com/api/docs/guides/streaming-responses`, and `https://developers.openai.com/api/docs/guides/migrate-to-responses#additional-differences`.

## Interfaces and Dependencies

This plan depends on the pinned template manifest, generated overlay policy, Convex generic function wrappers used by the template, Next.js App Router route groups under `src/app`, OpenAI Responses API HTTP streaming, Program lint, ExecPlan lint, markdown metadata lint, and the generated repo clean-room command contract.
