---
title: "Starter Interactive Preview Planning Brief 1"
program_id: "starter-interactive-preview"
brief_version: 1
status: "current"
summary: "First planning brief for adding the Starter-specific interactive preview to `/starter`."
read_when:
  - "Writing the first child ExecPlan for this Program."
  - "Implementing the `/starter` interactive preview."
---

# Starter Interactive Preview Planning Brief 1

## Slice

Add the Starter-specific interactive preview to `/starter`.

## Desired Outcome

The public Starter offer page shows an interactive preview near the hero that lets a visitor enter product facts, choose design DNA, choose a pricing model, see the locked repo/codebase promise, and start Starter checkout. The preview should look like the current T3 public route system and should not bring back the old homepage stack.

## Scope

In scope:

- Add a focused client preview component under a plain source path such as `apps/web/src/components/starter/`.
- Keep `apps/web/src/app/(marketing)/starter/page.tsx` as a small Server Component route assembly.
- Reuse or extract the old codebase-demo draft storage, draft hook, Foundation card, Design card, Pricing card, sidebar progress, locked cards, and save-before-checkout behavior.
- Pass `offerId="starter"` explicitly for every preview checkout CTA.
- Keep the existing hero checkout CTA on `/starter`.
- Add focused tests proving the preview renders, uses Starter checkout, and persists draft state before checkout.
- Keep the old homepage/demo code working if it is still referenced.
- Capture desktop and mobile browser proof for `/starter`.

Out of scope:

- Changing checkout behavior, Stripe offer IDs, checkout session params, success routes, webhook behavior, or entitlement/access grants.
- Changing protected Starter flows, Worker pages, Worker Seal Team 6, Cal.com, Telegram widget mounting, generated repo output, or MDX cleanup.
- Rebuilding `/` or restoring the old homepage section stack.
- Changing provider setup or environment variables.

## Inputs

- `docs/programs/active/2026-05-15-starter-interactive-preview/program.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/research-pass-starter-preview.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/normalized-pass-starter-preview-target.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/converged-decision-packet.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/dependency-graph.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/cross-repo-review.md`
- `apps/web/src/content/docs/configure-the-homepage.mdx`
- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/release-workflow.md`
- `apps/web/src/app/(marketing)/starter/page.tsx`
- `apps/web/src/app/_components/home-page/sections/codebase-demo/`
- `apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts`
- `apps/web/tests/unit/public-marketing-surfaces.test.tsx`
- `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`

## Acceptance

The child ExecPlan records `program_id: "starter-interactive-preview"` and this planning brief path.

`/starter` shows the new preview below or near the hero, while the hero checkout CTA remains unchanged.

Every Starter checkout CTA on the page uses `offerId="starter"`.

The preview uses the current T3 public route visual language and does not render the old full-screen homepage leverage hero or existing-codebase branch.

Editing product facts, design, or pricing can persist to the existing local draft storage before checkout so the protected Starter seeder can still use those facts.

Desktop and mobile `/starter` screenshots show clean layout without overlapping controls, unreadable labels, or old homepage styling.

Focused tests, app format check, root lint, root typecheck, and `git diff --check` pass, or exact unrelated blockers are recorded.

## Watchpoints

Do not silently edit unrelated dirty worktree changes. The repository currently has unrelated runner/package changes in the worktree, so the child ExecPlan should name any validation failures that come from those files separately from preview work.

Do not widen this into checkout, Workers, Cal.com, Telegram, generated output, or MDX cleanup.

Do not import the old full `CodebaseDemoSectionBlock` into the route.
