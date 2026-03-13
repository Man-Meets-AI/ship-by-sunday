# Ship by Sunday Offer and Funnel Plan

Last updated: 2026-03-11

## Objective

Make sure the path from landing page to checkout to onboarding is commercially coherent and trustworthy.

The offer is already strong enough to sell. The remaining job is to remove hesitation, set the right expectations, and make the next step feel clean.

## Core Offer Summary

- Product: `Ship by Sunday`
- Promise: `Go from idea to v1 this weekend`
- Audience: builders who struggle to get a v1 out the door
- Format: custom software-backed weekend sprint + on-demand walkthroughs + digital guide/workbook

## Positioning Update

### Core reframe

Development is no longer the main bottleneck.

Product clarity and design clarity now matter more because code is faster and cheaper than ever.

### Unique mechanism

`The Product Trinity`

The Product Trinity is our name for the three things that now need to work together:

1. product strategy
2. design
3. development

The point is not to turn the buyer into a full-time PM, designer, and expert builder.

The point is to give them a better system for making good enough decisions across all three so they can ship a real v1.

### Vehicle

`Ship by Sunday`

Ship by Sunday is the practical vehicle for the mechanism:

- the workspace
- the guided sprint
- the on-demand walkthroughs
- the worksheets and prompts

### Bonus

`Product Management for Beginners`

This is a fear-reducing bonus for the buyer who thinks:

`I can build, but I do not trust my product judgment.`

## Current Friction Points

- The landing page promise is sharp and the checkout trigger now exists, but the live post-purchase support path still needs to be hardened.
- The buyer still needs a clean answer to `what happens immediately after I pay?`, and the docs should match the actual success flow.
- The buyer also needs a believable risk-reversal that matches the product.
- The buyer now also needs a clean explanation for why this is different from another build course or AI coding product.
- The strongest objection remains: `What if I buy this and still do not finish?`

## Current Implementation Reality

- The primary CTA on the landing page is `Get instant access`.
- Logged-out buyers are pushed into Clerk sign-in and then back to pricing.
- Signed-in buyers start Stripe-hosted checkout from the landing page CTA.
- After payment, buyers land on `/checkout/success`, which waits for the entitlement to land and then redirects them into `/mission`.
- Returning entitled users who land on `/` are resumed into the product unless they explicitly use `?marketing=1`.
- There is not yet a live transactional access email, so checkout copy should not promise one as the primary handoff.

## Guarantee / Refund Recommendation

Use a conditional, action-based guarantee. It fits the product better than a generic no-questions-asked refund and reinforces the identity of doing the rep.

### Final locked guarantee

`Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you.`

### Why this works

- it reduces buyer risk
- it aligns the refund with actual use of the product
- it avoids inviting passive buyers to consume and refund
- it reinforces that the product is action-first

### Checkout microcopy

`This sprint is built to be completed. Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us for a refund.`

## Checkout Copy Recommendations

### Checkout headline

`Get Instant Access to Ship by Sunday`

### Checkout support copy

`A custom software-backed weekend sprint for builders who struggle to get a v1 out the door.`

### What the buyer gets

- Ship by Sunday workspace
- 4-block guided sprint
- on-demand video walkthroughs
- digital guide + workbook
- prompts + worksheets
- deploy checklists
- Product Management for Beginners bonus
- lifetime access

### Price line

`$499 one-time payment`

### Trust line

`Immediate access. No subscription. Lifetime access. Built for builders who want to finish, not just watch.`

## CTA Flow

### Landing page

Primary CTA:

- `Get Instant Access`

Secondary CTA:

- `See how it works`

Landing page job:

- make the promise clear
- show the outcomes
- prove the founder can teach this credibly
- make checkout feel like the obvious next step
- if the buyer is not signed in, send them to sign-in without losing the pricing context

### Checkout

Primary CTA:

- `Complete Purchase`

Checkout job:

- remove uncertainty
- clarify what happens after payment
- reinforce the guarantee
- keep focus on the first rep, not lifetime theory value
- match the actual Stripe-hosted checkout flow instead of implying a custom in-app cart

### Post-purchase confirmation

Primary CTA:

- `Open Mission`

Confirmation page job:

- confirm payment
- reassure the buyer they are in the right place while access finalizes
- direct them into `Mission` and then `Start Here` immediately
- provide a fallback if access is delayed for a few seconds

## Post-Purchase Expectation Setting

The first few minutes after purchase are part of the sale.

### Confirmation copy direction

Headline:

- `You are in. Start Here.`

Support line:

- `Do not try to watch everything first. Open Mission, review the 4-block path, watch the two intro lessons, and begin with the CEO Block.`

Checklist:

- `Wait on the success page while access finalizes`
- `Open Mission`
- `Watch the 2 intro lessons`
- `Open the worksheet packet`
- `Start Worksheet 01`

### First onboarding email direction

Subject:

- `You’re in. Start here.`

Body goal:

- reduce overwhelm
- make the first action obvious
- reinforce the product is meant to be completed

Rule:

- do not promise an access email as the primary delivery mechanism until it exists in the product

## Objections To Handle Near Checkout

### `I already know a lot of this`

Answer:

- `This is not sold as information. It is sold as a system for finishing and shipping.`

### `I can already build things`

Answer:

- `That helps, but the real bottleneck now is not just development. It is product judgment, design direction, and execution structure.`

### `I do not need another course`

Answer:

- `That is exactly why this is structured as a guided rep with artifacts, not a theory library.`

### `I am not a product person`

Answer:

- `You do not need to become a full-time PM. You need enough product judgment to scope the right v1, and the offer includes Product Management for Beginners to close that gap.`

### `What if I buy it and still do not finish`

Answer:

- point to the guarantee and the action-first structure

### `Maybe I should get better technically first`

Answer:

- `You do not need to become an expert before shipping something useful. You do need a cleaner sequence.`

### `Will this work for my app idea`

Answer:

- `Best for scoped web apps, tools, MVPs, and narrow utilities. Not for massive multi-system builds.`

## Remaining Promise-vs-Product Mismatches To Watch

- If the recorded lessons feel too broad or too tool-tour-heavy, the promise will feel sharper than the product.
- If checkout promises a smooth student experience but onboarding is clunky, trust will break immediately.
- If the first block does not produce a visible artifact fast, the action-based guarantee loses force.
- If the product ships too many worksheets or side assets, it will feel heavier than the sales page suggests.

## Recommendation

Do not add more sales complexity right now.

The clean path is:

1. landing page makes the sale
2. checkout removes risk
3. confirmation page gets the buyer into `Mission`
4. `Start Here` gets them into the first artifact fast
5. onboarding email reinforces the same next step once that email is implemented

That is enough for launch.
