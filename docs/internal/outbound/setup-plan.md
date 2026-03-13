# Ship by Sunday Outbound Setup and Deliverability Plan

Last updated: 2026-03-11

## Goal

Prepare the outbound machine so it can be turned on safely later, without forcing attention away from recording, delivery, checkout, onboarding, and QA right now.

This is a planning document. It is not a recommendation to scale outbound immediately.

## Current setup assumptions

- Core offer: `Ship by Sunday`
- Core audience: builders who can already prototype or get things working, but keep getting stuck before they ship a real v1
- Primary promise: `Go from idea to v1 this weekend`
- Core mechanism: `The Product Trinity`
- Vehicle: software-guided weekend sprint + Ship by Sunday workspace
- Tooling target: `Instantly`
- Current priority: get the product, buyer journey, and onboarding stable before outbound execution
- Outbound should stay in planning mode until:
  - checkout works reliably
  - access and onboarding work reliably
  - support path exists
  - guarantee / refund language is finalized
  - launch emails and QA basics are in place

## Operating rule

Do not send outbound at scale until the buyer journey is stable.

Outbound should move in three stages:

1. planning
2. infrastructure setup and warmup
3. controlled pilot

Do not jump from planning to volume.

## Domain and inbox plan

### Domain strategy

Use separate sending domains for outbound.

Do not send cold outbound from the main brand domain.

Recommended setup:

- main brand domain for site, product, and normal business communication
- `2-3` adjacent outbound domains for cold sending

Domain pattern examples:

- `shipwithmanmeetsai.com`
- `manmeetsai.co`
- `shipbysunday.co`

Do not use sketchy or confusing domains that damage trust.
Keep them brand-adjacent and human-readable.

Use messaging that makes Ship by Sunday sound like a system for finishing, not like a generic course or AI coding product.

### Inbox strategy

Start with:

- `2 domains`
- `2 inboxes per domain`
- `4 total sender inboxes`

Use simple sender names that feel personal and credible.

Recommended structure:

- `firstname@domain`
- `hello@domain` only if needed later

Prefer real-name mailboxes over generic role inboxes for cold outreach.

### Reply handling

- all reply mailboxes should be monitored
- route positive replies to one clear owner
- route unsubscribe / wrong person / not interested replies cleanly
- do not let replies sit unattended

## Authentication checklist

Every outbound domain must be configured correctly before warmup.

### Required DNS and authentication

- [ ] domain registered and accessible
- [ ] inboxes created
- [ ] SPF configured correctly
- [ ] DKIM configured correctly
- [ ] DMARC configured correctly
- [ ] custom tracking domain configured if used
- [ ] forwarding / reply handling verified
- [ ] sending provider aligned with DNS records

### SPF

- keep SPF lean
- avoid duplicate SPF records
- do not exceed DNS lookup limits

### DKIM

- ensure DKIM passes for every sending inbox
- verify selector is active and aligned to the sending platform

### DMARC

Start with a monitoring posture first, not an aggressive reject posture if setup is new.

Recommended path:

- `p=none` while verifying alignment and pass rates
- move stricter only after the setup is proven

## Warmup and ramp guidance

Warmup is required before controlled outbound begins.

### Warmup setup

- warm every inbox before real campaign sends
- keep warmup gradual
- do not combine warmup with real sending volume too early

### Suggested warmup window

- minimum: `2 weeks`
- safer: `3 weeks`

### Suggested initial ramp

Per inbox:

- week 1 of real sends: `10-15` emails per day
- week 2: `15-25` emails per day
- week 3: `25-35` emails per day if reply quality and deliverability remain healthy

With `4` inboxes, that means:

- early pilot total: `40-60` emails per day
- second phase: `60-100` emails per day

Do not treat these as goals. Treat them as ceilings until results prove the setup is healthy.

### Stop conditions during ramp

Slow down or pause if:

- bounce rate rises
- spam folder placement increases
- reply quality drops sharply
- domain reputation weakens
- inboxes show unusual throttling or blocks

## Instantly architecture

Keep the structure simple and controlled.

### Campaign architecture

Use separate campaigns by segment, not one giant mixed campaign.

Recommended segment split:

- junior engineers with side-project intent
- mid-level engineers with unfinished internal tool / MVP ideas
- warm-adjacent contacts

Do not mix wildly different audiences in the same campaign.

### Account structure

- one Instantly workspace
- domains separated cleanly
- inboxes mapped intentionally
- campaigns segmented by fit and message angle

### Message structure

Start with short, plain-text emails.

Avoid:

- heavy HTML
- image-based emails
- too many links
- attachment-heavy sends
- hype language

### Tracking

Track:

- sends
- opens only if used carefully
- replies
- positive replies
- bounce rate
- unsubscribe rate
- meeting / conversion outcomes if relevant

Do not optimize around opens alone.

## Recommended numbers and sequencing

### Phase 1: planning only

Do now:

- define domains and inbox count
- define DNS/auth checklist
- define segment structure
- define campaign logic
- define reply ownership

Do not do now:

- scale sends
- load giant prospect lists
- push volume before the product and funnel are stable

### Phase 2: infrastructure setup

Do once buyer journey is stable:

- register domains
- create inboxes
- configure SPF / DKIM / DMARC
- connect to Instantly
- begin warmup

### Phase 3: controlled pilot

Do only after:

- checkout works
- onboarding works
- guarantee / refund language is live
- support owner is known
- launch emails are in place

Pilot setup:

- `1-2` tight segments
- short plain-text sequence
- low daily cap
- rapid manual review of replies

### Phase 4: measured expansion

Only expand if:

- bounce rate is healthy
- replies look relevant
- positive response quality is acceptable
- the buyer journey does not break under new demand

## Deliverability risk log

### High risk

- sending from the main brand domain
- launching volume before warmup is complete
- mixing segments and poor-fit prospects
- weak SPF / DKIM / DMARC setup
- generic spammy copy that looks like mass outbound
- not monitoring replies

### Medium risk

- too many new inboxes at once
- too many links in first-touch emails
- poor list quality
- unclear unsubscribe handling
- ramping too quickly because opens look good

### Low but real risk

- inconsistent sender names
- role-based sender addresses that feel low trust
- mismatch between email promise and landing page message

## Pre-send QA checklist

Run this before any real outbound pilot.

### Infrastructure

- [ ] all sending domains registered
- [ ] all inboxes created
- [ ] SPF passes
- [ ] DKIM passes
- [ ] DMARC configured
- [ ] custom tracking domain verified if used
- [ ] inboxes connected correctly in Instantly

### Message and targeting

- [ ] campaign segment is clearly defined
- [ ] list quality spot-checked manually
- [ ] email copy matches landing page promise
- [ ] no exaggerated claims
- [ ] no misleading personalization
- [ ] reply owner is assigned

### Operational readiness

- [ ] support / reply handling path exists
- [ ] unsubscribe handling is clear
- [ ] daily send caps are conservative
- [ ] warmup has run long enough
- [ ] first campaign volume is below max threshold

## Final go-live checklist

Outbound is ready to switch from planning mode to pilot mode only when all are true:

- [ ] checkout is stable
- [ ] onboarding is stable
- [ ] support path exists
- [ ] guarantee / refund language is final
- [ ] sending domains are separate from the main brand domain
- [ ] SPF / DKIM / DMARC are verified
- [ ] inboxes have warmed properly
- [ ] first campaign segments are narrow and relevant
- [ ] reply handling owner is assigned
- [ ] send caps are conservative
- [ ] pre-send QA is complete

## Recommendation

Do the planning now.

Do not execute cold outbound until the core buyer journey is proven.

The best version of outbound for this launch is not “more volume.” It is safe infrastructure plus a small, controlled pilot after the product experience can handle demand.
