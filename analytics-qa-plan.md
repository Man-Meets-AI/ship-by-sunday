# Ship by Sunday Analytics and QA Plan

Last updated: 2026-03-07

## Objective

Make the launch measurable and catch revenue-impacting failures before they cost trust.

The day-one rule is simple: track only the numbers that change decisions, and test every buyer-facing step like it is already broken.

## KPI Dashboard Spec

Track these daily:

### Traffic and demand

- landing page visits
- CTA clicks
- checkout starts
- purchases

### Conversion

- landing page to checkout start rate
- checkout start to purchase rate
- landing page to purchase rate

### Activation

- purchase to login / access rate
- purchase to first lesson start rate
- purchase to first worksheet completion rate

### Messaging / channel signal

- email click-through rate
- reply rate if outbound is active later
- sales by source

### Quality / support

- critical bugs open
- support issues by category
- refund requests

## Event Tracking Map

### Landing page

- `lp_view`
- `lp_cta_click_primary`
- `lp_cta_click_secondary`
- `lp_scroll_50`
- `lp_scroll_90`

### Checkout

- `checkout_view`
- `checkout_start`
- `checkout_submit`
- `purchase_complete`
- `purchase_fail`

### Onboarding

- `confirmation_view`
- `access_email_sent`
- `start_here_view`
- `lesson_intro_start`

### Activation

- `worksheet_01_open`
- `worksheet_01_complete`
- `lesson_ceo_complete`
- `first_login`

## Event Notes

- Do not over-instrument before launch.
- The minimum viable event map is landing page -> checkout -> purchase -> first lesson -> first worksheet.
- If tooling is limited, prioritize `purchase_complete`, `start_here_view`, and `worksheet_01_open` first.

## Buyer Journey QA Script

### Phase 1: Landing page

- [ ] page loads on desktop
- [ ] page loads on mobile
- [ ] primary CTA works
- [ ] secondary CTA works
- [ ] FAQ interactions work if interactive
- [ ] no obvious copy/layout breaks

### Phase 2: Checkout

- [ ] checkout page loads
- [ ] price is correct
- [ ] guarantee / refund copy is present
- [ ] purchase button works
- [ ] failed payment path is understandable
- [ ] confirmation redirect works

### Phase 3: Access and onboarding

- [ ] confirmation page displays correctly
- [ ] access email arrives
- [ ] login / access link works
- [ ] `Start Here` page is obvious
- [ ] worksheet packet is accessible
- [ ] first lesson is accessible

### Phase 4: Activation

- [ ] student can find Worksheet 01
- [ ] student can identify the first action
- [ ] module order is clear
- [ ] naming matches what was sold
- [ ] no dead ends

### Phase 5: Support and recovery

- [ ] support contact path exists
- [ ] refund request path is documented
- [ ] bug report path is documented

## Bug Tracker Format

Use this structure:

| ID | Date | Area | Issue | Severity | Owner | Status | Repro steps | Fix needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |

## Severity Definitions

### `critical`

- blocks purchase
- blocks access
- blocks first lesson or first worksheet
- creates broken trust around price, promise, or delivery

### `high`

- causes major confusion in onboarding
- breaks a key CTA
- breaks layout on one major device class
- causes an important event not to be tracked

### `medium`

- creates friction but not full failure
- weak copy mismatch
- noncritical visual or UX bug

### `low`

- cosmetic only
- minor typo
- non-blocking polish issue

## Daily Reporting Template

Use this format each day:

### Revenue / conversion

- visits:
- checkout starts:
- purchases:
- landing page to purchase rate:

### Activation

- first lesson starts:
- Worksheet 01 opens:
- Worksheet 01 completions:

### Issues

- critical bugs open:
- high bugs open:
- main blocker:

### Notes

- what changed today:
- what needs attention tomorrow:

## Launch Recommendation

Do not wait for perfect analytics maturity.

Ship with:

- a minimal KPI dashboard
- a minimal event map
- a real QA script
- a real bug tracker

That is enough to protect launch decisions and catch silent failures.
