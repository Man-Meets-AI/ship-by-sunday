---
name: posthog-linear-triage
description: Run a draft-only PostHog-to-Linear bug triage sweep for Ship by Sunday. Use when reviewing PostHog Error Tracking issues, replay links, alerts, SDK Doctor output, or production incidents before drafting Linear bug work.
---

# PostHog To Linear Triage

Use this skill when a maintainer asks for a PostHog-backed bug triage sweep or when the observability runbook points you at PostHog evidence.

## Rules

- Treat PostHog MCP, PostHog AI plugin, PostHog URLs, Linear, GitHub, Vercel, Convex, and support/chat sources as evidence inputs.
- Start draft-only. Do not create, assign, label, close, comment, rerun, or edit Linear issues unless the maintainer explicitly approves that exact mutation.
- If a source is inaccessible, list it first and continue with the accessible evidence.
- Separate observed facts from assumptions.
- Group duplicates before ranking issues.
- Rank findings as P0, P1, P2, or P3.
- P0 and P1 findings always get a draft Linear issue body.
- P2 findings get a draft only when recurring, affecting paying users, or blocking checkout or access.
- P3 findings stay in the report unless explicitly selected.

## Evidence To Capture

For each finding, collect:

- PostHog issue URL
- replay URL when replay has been privacy-reviewed for the affected surface
- source-mapped stack route, file, and function when available
- affected users, sessions, occurrences, and recentness
- first seen and last seen timestamps
- release or deployment context
- GitHub checks or deploy logs that explain timing
- existing Linear duplicate candidates
- observed facts
- assumptions
- severity rationale
- recommended next action

## Linear Draft Template

Use the `man meets ai` Linear team and the `Ship By Sunday` project from `docs/internal/linear.md`.

Draft issue body:

```md
## Problem

<Observed user-facing failure.>

## PostHog Evidence

- Issue: <PostHog issue URL>
- Replay: <safe replay URL or "Not included; replay surface not privacy-reviewed">
- Recentness: <first seen / last seen>
- Impact: <users / sessions / occurrences>
- Stack: <route / file / function>

## Duplicate Check

<Existing Linear/GitHub/PostHog duplicate candidates or "No duplicate found in checked sources.">

## Priority Rationale

<P0/P1/P2/P3 and why.>

## Facts

- <Observed fact>

## Assumptions

- <Assumption, or "None">

## Recommended Next Action

<Smallest concrete repair or investigation step.>

## Source

PostHog triage sweep.
```
