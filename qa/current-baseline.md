# QA Current Baseline

This file holds dated QA resume state. Keep stable operating rules in `qa/AGENTS.md`; update this file when the current baseline changes.

Last reviewed: 2026-04-24

## Current Resume State

- Feature branches get only preview-safe QA. Use dry-run `default_ship` or focused tests, never real billing proof.
- Start with `dev`. `qa/runs/2026-03-26-dev-default-ship-local-auth.md` is the current green `default_ship` baseline and is the canonical first debug baseline.
- `billing_integration` on `dev` has a green rerun in `qa/runs/2026-03-25-dev-billing-integration-rerun.md`. Use that report as the local billing baseline.
- Move to `prod` second. `default_ship` is green there too; use `qa/runs/2026-03-25-default-ship-prod-rerun.md` as the current hosted baseline.
- Hosted `billing_integration` has both the repair report and the automatic post-fix rerun. Read `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md` first for the misconfig repair, then `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md` for the fresh automatic delivery proof.
- The key prod invariants are: Stripe posts to the Convex `.convex.site` webhook URL, production Convex has both `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY`, and a fresh live completed no-cost order can patch or insert a `stripe_webhook` access grant without replay.
- For this repo, prefer a live no-cost Checkout verification using a restricted `100% off` discount instead of a real card charge. That proves the webhook/access handoff without treating prod as a card-testing surface.
- On production, the canonical `billing_integration` automation should create the Checkout Session directly with that discount already attached. Do not make the production gate depend on manual promotion-code entry in Stripe's hosted UI.
- Use `qa/runs/` as the durable evidence set and read the latest relevant environment report before rerunning a pack.
