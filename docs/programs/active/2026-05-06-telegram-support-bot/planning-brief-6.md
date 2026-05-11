---
title: Telegram Support Bot Planning Brief 6
program_id: telegram-support-bot
brief_version: 6
status: current
summary: Prove the live Telegram and OpenAI provider loop or record the exact hosted setup gap before closing the Program.
read_when:
  - "Creating or resuming the Live Provider Proof And Program Closeout child ExecPlan."
  - "Verifying support-specific Telegram or OpenAI provider setup."
  - "Deciding whether the Telegram Support Bot Program can move to completed."
---

# Telegram Support Bot Planning Brief 6

The next child ExecPlan should be titled `Live Provider Proof And Program Closeout`.

The goal is to turn the implemented support bridge from code-complete into provider-proven, or to leave an exact, runnable proof contract when hosted secrets and Telegram group access are not available to the current agent. Slices 1 through 5 built the first-party support widget, Convex support backend, Telegram webhook/provider path, structured operator actions, private OpenAI-backed drafts, workspace entry, retention maintenance, manual retry policy, operations snapshot, and privacy tests. The remaining Program blocker is live provider evidence.

Keep this slice focused on proof and closeout, not new product behavior. Verify the hosted Convex environment has the support-specific Telegram and OpenAI env values without printing secret values. Verify Telegram webhook registration with `getWebhookInfo`, including the webhook URL, narrow `allowed_updates`, no growing pending backlog, and no last error. Exercise the real loop when credentials and operator access are present: website visitor message to Convex, Telegram forum topic creation with a safe topic label, allowlisted Telegram operator reply back to the widget, `Close thread`, one customer-visible button such as `Ask email` or `Pricing`, one AI-backed operator-only button such as `Draft reply` or `Summary`, and the missing-OpenAI-key deterministic fallback if it can be tested safely in a non-production deployment.

Do not add more operator buttons, automatic AI replies, account-wide support history, CRM/Linear mutations, uploads, CAPTCHA, or automatic delivery retry scheduling in this slice. Do not print Telegram tokens, webhook secrets, OpenAI keys, visitor session tokens, Telegram user ids, message text, generated AI output, or transcript bodies in logs, docs, plans, snapshots, commits, or final summaries. If provider access is unavailable, record the blocker in the ExecPlan and Program as a setup gap, keep the support docs as the source of setup truth, and do not mark the Program complete.

Focused validation should include the hosted Convex env-presence probe with secret values suppressed. Convex CLI `env get` can exit successfully for missing names, so treat a name as present only when stdout is non-empty. Then run `getWebhookInfo` when a bot token is available through the operator environment, the existing focused support unit and integration-ui tests, hosted Convex codegen if Convex references changed, plan/program/markdown linting for all touched docs, `git diff --check`, and broader repo gates only when this slice changes runtime behavior.
