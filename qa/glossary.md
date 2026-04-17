# QA Glossary

This glossary defines the plain-English vocabulary for the Ship by Sunday QA operating system. If a term is not in this file, it should not be treated as part of the control plane.

## Journey

A journey is a meaningful product outcome that a human can describe without naming code files. Example: an entitled member opens the blueprint funnel and reaches Review.

## Scenario ID

A scenario ID is the short stable identifier for one journey row in `qa/journeys.csv`. Example: `BLUEPRINT-04` means the Marketing stage opens after the Design stage.

## Journey Bucket

A journey bucket is the PM-facing grouping for related scenarios. The v1 buckets are:

- `Visitor FTUX`: signed-out acquisition and discovery.
- `No-Access FTUX`: signed-in members who do not yet have product access.
- `Has-Access EUX`: entitled members inside the blueprint-first workspace.
- `Free -> Paid`: the paid transition from no access to access granted.

## Persona

A persona is the named starting state required to run a scenario.

- `signed_out`: a fresh browser session with no authenticated identity.
- `member_without_access`: a valid Clerk user who can sign in but does not have Ship by Sunday access.
- `member_with_access`: a valid Clerk user with Ship by Sunday access already granted.

The non-secret protocol for these personas lives in `qa/personas.json`. Real local credentials live only in ignored `qa/personas.local.json`.

## Scenario Pack

A scenario pack is the operational grouping used to decide what to run.

- `default_ship`: the majority-coverage pack for ordinary shipping. This includes homepage, auth, no-access recovery, blueprint funnel, review/download, settings, and checkout-success recovery.
- `extended`: important but non-default surfaces such as docs, starter repo, Codex connection, observability, and curriculum contracts.
- `billing_integration`: real free-to-paid coverage that touches checkout and paid access handoff. Run this only in a safe test environment.

## FTUX and EUX

`FTUX` means first-time user experience. `EUX` means existing user experience. Ship by Sunday uses these labels because a visitor, a member without access, and a member with access each need different QA treatment.

## Browser Sweep

A browser sweep is a bounded run of browser scenarios tied to explicit scenario IDs. A sweep is not “Playwright happened to be green.” It is a reportable run against selected rows in `qa/journeys.csv`.

## Confidence State

The coverage map uses confidence states to describe how much trust the team should place in the current proof.

- `high`: the proving mechanism matches the current product behavior and is worth retaining.
- `medium`: the proving mechanism is useful but incomplete.
- `low`: the proving mechanism is stale, too implementation-led, or too indirect to trust on its own.

## Coverage Status

The coverage map uses these operational statuses:

- `mapped_existing`: the current test or script still proves part of the scenario.
- `rewrite_required`: the current proof is valuable, but it is anchored to old routes or an outdated flow and must be rewritten.
- `gap`: the scenario exists in the catalog but does not yet have trustworthy proof.

## Release-Critical

A release-critical scenario is one that belongs to `default_ship` and should be explainable in a ship report before release. For this repository, that means:

- the public homepage offer and CTA
- sign-in and redirect behavior
- no-access recovery
- the blueprint-first funnel from Start through Review
- settings
- checkout-success recovery

## Release Report

A release report is a dated Markdown summary stored under `qa/runs/`. It states which pack ran, which personas were used, which scenario IDs were attempted, what passed, what failed, and what remained blocked. It must be understandable without opening code.
