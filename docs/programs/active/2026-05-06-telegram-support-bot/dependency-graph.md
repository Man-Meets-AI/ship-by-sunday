---
title: "Telegram Support Bot Dependency Graph"
summary: "Ordering and dependency graph for the support widget, Convex thread state, Telegram bridge, and operator actions."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next Telegram support implementation slice."
  - "Checking which pieces block the website widget or operator buttons."
---

# Telegram Support Bot Dependency Graph

## Graph

`Provider Contract And Secret Naming` precedes every implementation slice. The app needs a dedicated support bot token, support chat id, webhook secret, operator Telegram user id allowlist, and setup docs before customer support can be safely separated from observability.

`Convex Support Data Model` precedes `Website Widget Live Thread` and `Telegram Webhook Bridge`. The widget and bot need one canonical visitor/thread/message store with browser-token hashing for anonymous access.

`Website Widget Live Thread` can proceed in parallel with `Telegram Webhook Bridge` after the data model exists. The widget needs lazy first-message thread creation, list-message, and send-message flows through Convex React queries and mutations. The bridge needs visitor-message-to-Telegram topic delivery and Telegram-reply-to-Convex HTTP action ingestion.

`Support Retention Model` depends on `Convex Support Data Model` and precedes any production rollout. The schema needs close and purge timestamps before support messages become customer data.

`First-Slice Abuse Controls` depend on `Convex Support Data Model` and precede public widget enablement. Convex needs token-scoped limits, pending-message limits, global send caps, and kill-switch state before visitor messages can be mirrored to Telegram.

`Close Thread Operator Button` depends on `Telegram Webhook Bridge`, `First-Slice Abuse Controls`, and `Support Retention Model`. It proves inline keyboard callback parsing, operator allowlisting, action audit, and thread lifecycle mutation with one safe action.

`Operator Buttons Framework` depends on the `Close Thread Operator Button`. Broader inline keyboard callbacks need the same update handler and mapping from Telegram callback data to support operator actions, but should not ship until the safe lifecycle button works.

`AI Draft And Prompt Actions` depend on `Operator Buttons Framework` and the app's existing AI/Codex boundaries. They should begin as operator-only drafts, not direct visitor replies.

`Linear And Sales Workflow Actions` depend on `Operator Buttons Framework`, Linear connector/operator policy, and support action audit records.

`Workspace Authenticated Support` depends on the homepage proof and a privacy review. Authenticated support may associate visitor threads with Clerk users and product state, which raises different retention and access questions.

## Critical Path

1. Dedicated support provider contract and docs.
2. Convex support schema, anonymous token access, and function contracts.
3. Homepage widget vertical proof.
4. Telegram forum-topic bridge vertical proof.
5. Retention fields and cleanup runbook.
6. First-slice abuse controls.
7. `Close thread` operator button.
8. AI draft and business-workflow actions.

## Parallelizable Work

The widget visual design can be prototyped while the Telegram provider contract is documented, as long as it does not hardwire fake bot behavior.

The external setup docs can be drafted in parallel with the first implementation slice, but the work is not done until the exact env names and verification steps match the shipped code.

Operator action taxonomy can be drafted before implementation, but only safe read or draft actions should ship before audit and failure states exist.
