---
title: Generated Starter Operating Pack Planning Brief 4
program_id: starter-template-source-and-billing-proof
brief_version: 4
status: current
summary: Create the next child ExecPlan for upgrading the generated Starter operating pack now that generated app materialization consumes the pinned template source.
read_when:
  - "Writing the fourth child ExecPlan for this Program."
  - "Upgrading generated Program and ExecPlan setup material."
  - "Checking how generated provider setup should be represented before ChatGPT app implementation."
---

# Generated Starter Operating Pack Planning Brief 4

## Planning Context

Generated Starter repo materialization now validates `templates/starter-app/template-source.json`, maps a no-provider-safe subset of `templates/starter-app/source` into `apps/web/`, and applies generated overlays afterward. The generated app stays close to the pinned template source, uses the template source layout under `apps/web/src/app`, routes questionnaire-derived content through `apps/web/config/product.ts`, preserves clean-room no-provider proof with setup-gated provider states, and records conservative exclusions for provider-heavy Sentry, email, API route, and source-test files.

The next dependency is the generated operating pack. The Program direction says the downloaded Starter repo should include a durable first customer Program and setup ExecPlans, not only README setup prose. Provider setup should be represented as ordered, resumable Program work for core boot, Clerk, Convex, Stripe, and the first product slice. This should happen before the ChatGPT app replacement so later app work has the right customer-agent operating surface.

## Next Plan Recommendation

Exact next plan title: `Upgrade Generated Starter Operating Pack`.

Exact target path: `docs/exec-plans/active/2026-05-13-upgrade-generated-starter-operating-pack.md`.

Exact scope: upgrade the generated Starter operating pack so downloaded repos include a first customer Program, active setup ExecPlans for core boot, Clerk, Convex, Stripe, and first product work, validation scripts that check Program and ExecPlan structure, and agent instructions that route provider setup through those plans. Preserve the existing no-provider generated repo proof and keep the new template-source materialization path intact.

Exact boundaries: do not implement the ChatGPT app, do not add live provider requirements to clean-room proof, do not fetch or mutate the sibling template, do not broaden template-source file materialization beyond the explicit adapter without focused tests, and do not copy internal Worker/local-runner runtime code into generated customer output.

## Success Criteria

The slice succeeds when a generated Starter repo contains a coherent first Program and setup ExecPlans that a customer or coding agent can follow immediately after download, the generated `agentic:check` and `codebase:contract` commands prove the operating pack, and clean-room no-provider validation still passes.
