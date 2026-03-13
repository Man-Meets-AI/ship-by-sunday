# Ship by Sunday Landing Page + Checkout Revision Brief

Last updated: 2026-03-11

## Purpose

This is a first-pass marketing revision brief for tightening the path from landing page to checkout.

It stays inside the current offer:

- `Ship by Sunday`
- `Go from idea to v1 this weekend`
- builders who can already prototype or get things working
- `The Product Trinity` as the mechanism
- the workspace + guided 4-block sprint as the vehicle
- `Product Management for Beginners` as the fear-reducing bonus

## Scope And Guardrails

- Focus only on the hero, the first 2-3 sales-page sections, checkout-supporting copy, and FAQ.
- Keep language beginner-clear on purpose. Simpler language is a strength here, not a downgrade.
- Keep the page grounded in the actual buyer flow:
  - landing-page CTA sends logged-out users to Clerk sign-in
  - signed-in users start Stripe-hosted checkout
  - after payment, buyers land on `/checkout/success`
  - access finalizes there and buyers are redirected into `/mission`
  - there is not yet a live access email that should be positioned as the primary handoff
- Do not introduce tripwire strategy.
- Do not introduce YouTube or social strategy.
- Do not change app code in this pass.

## Current Friction Points

- The hero headline is strong, but it narrows the audience to people with `rough prototypes` even though the offer also speaks to builders with a half-formed app idea.
- The hero subhead uses useful internal language, but `product judgment`, `design direction`, and `execution structure` still read one level too abstract for a cold visitor.
- The first sections spend too much time teaching the reframe before the visitor gets a fast self-qualification check and a concrete picture of what they leave with.
- `The Product Trinity` appears too early as a named concept. The mechanism is valuable, but the page currently asks the visitor to learn our framework before fully understanding the immediate payoff.
- The best-fit / not-fit guidance appears too late. A builder should know near the top whether this is for them.
- The first outcome section is close, but `build-ready screen plan` and `working deployed v1` are still more insider-sounding than they need to be.
- The checkout area has the right bones, but it still needs clearer expectation-setting around what happens immediately after payment.
- The current FAQ misses some of the highest-friction objections: `What happens right after I pay?`, `What if I already know a lot of this?`, and `What if I still do not finish?`
- There is a price alignment issue to resolve before rollout: planning notes reference `$499`, while the current page code shows `$500`.

## Recommended Top-Of-Page Narrative

The first screen and first three sections should do this work in order:

1. Make the weekend promise concrete.
2. Help the visitor self-identify fast.
3. Show what they will leave with.
4. Explain why they are stuck in plain language.
5. Show the 4-block sprint as the path out.
6. Use `The Product Trinity` as a supporting explanation, not the first thing they have to decode.

## Section-By-Section Revision Recommendations

### 1. Hero

#### Current friction

- `Turn rough prototypes into real v1s` is sharper than older copy, but it is slightly narrower than the actual offer.
- The current subhead explains the offer correctly, but it still sounds more strategic than conversational.
- The hero should sell the result and the fit first, then use the mechanism language second.

#### Revision direction

Lead with the weekend outcome in plain language:

- what the buyer will do
- who it is for
- what kind of help they are getting

Keep `Get instant access` as the primary CTA.

Shift the secondary CTA from generic curiosity to process clarity:

- current intent: `See how it works`
- better page-level job: `See the 4-block sprint`

Use a short trust line under the CTA that matches the real flow:

- `One-time payment. Lifetime access. Start the sprint right after checkout.`

#### Hero headline + subhead options

### Option 1

**Headline:** Ship a real v1 this weekend

**Subhead:** Ship by Sunday is a custom software-backed weekend sprint for builders who struggle to get a v1 out the door. Scope the right MVP, map the core screens, build the core flow, and leave with a live app.

### Option 2

**Headline:** Go from app idea to live v1 by Sunday

**Subhead:** Ship by Sunday gives builders who struggle to get a v1 out the door a custom software-backed weekend sprint, workspace, walkthroughs, and worksheets to help them get a real first version live.

### Option 3

**Headline:** Stop collecting half-built demos

**Subhead:** This is for builders who can code or prototype, but need help deciding what to build first, what to cut, and how to get it live without chaos.

### Option 4

**Headline:** If you can prototype, you can ship

**Subhead:** Ship by Sunday gives builders who struggle to get a v1 out the door a better process for scoping the MVP, planning the screens, building the core flow, and launching a real first version in one focused weekend.

### Option 5

**Headline:** Turn your rough app idea into something real by Sunday

**Subhead:** Not another theory course. A custom software-backed weekend sprint with on-demand walkthroughs, prompts, and worksheets for builders who are ready to finish.

#### Recommended hero direction

Option 2 is the strongest first-pass direction.

Why:

- it covers both `idea` and `v1`
- it keeps the timed promise front and center
- it sounds beginner-clear without sounding beginner-only
- it leaves room to introduce `The Product Trinity` lower on the page instead of forcing it into the first screen

### 2. First Sales Section: Outcomes + Fit

#### Current friction

- The current `By Sunday you'll have` section is useful, but it should do more of the buyer-qualification work now handled much later in the page.
- The section currently emphasizes artifacts before clearly saying who the sprint is for and what kind of result those artifacts create.

#### Revision direction

Make the first section do two jobs:

- show what the buyer leaves with
- confirm who the sprint is for

Recommended section headline:

- `What you'll leave the weekend with`

Recommended support line:

- `By Sunday, you should leave with a tighter MVP, a clearer screen flow, a working first version, and a live link you can put in front of people.`

Recommended qualifier line near the heading or just under the cards:

- `Best for builders who struggle to get a v1 out the door. Not for total beginners or giant multi-system startup ideas.`

Recommended card language:

- `A one-page product brief`
- `A clear screen-by-screen plan`
- `A working first version`
- `A live link to test and share`

This keeps the section concrete and more readable than:

- `clear scoped product brief`
- `build-ready screen plan`
- `working deployed v1`

### 3. Second Sales Section: Why Shipping Stalls

#### Current friction

- The current `Why builders who can already code still don't ship` section has the right thesis, but it reads slightly like a seller argument instead of the buyer's lived problem.
- The four-card reframe teaches well, but it still asks the visitor to think at the category level before they feel seen at the practical level.

#### Revision direction

Translate the reframe into builder language first.

Recommended section headline:

- `Why you can build things but still don't ship`

Recommended support copy:

- `You do not need more tutorials. You need help deciding what to build first, what screens actually matter, and how to keep the build small enough to finish.`

Recommended three-part structure:

- `What should I build first?`
- `What does this need to feel usable?`
- `How do I keep this focused enough to ship?`

Then introduce the mechanism as the explanation, not the opener:

- `That is why Ship by Sunday is built around product strategy, design, and development working together. We call that The Product Trinity.`

This keeps the mechanism intact while lowering the jargon cost.

### 4. Third Sales Section: How Ship by Sunday Works

#### Current friction

- The page already has a strong 4-block sprint section, but it lands after too much concept teaching.
- The process that makes the offer believable should appear earlier than the branded framework explanation.

#### Revision direction

Move the 4-block sprint into the first three sections and make it the main proof of how the product works.

Recommended section headline:

- `How the weekend sprint works`

Recommended support copy:

- `Each block ends with something real, so you keep moving toward a shipped first version instead of getting stuck in theory.`

Recommended block framing:

- `CEO Block: pick the right problem, tighten the scope, and leave with a one-page product brief`
- `Design Block: map the flow, choose the screens, and leave with a clear plan for what gets built`
- `Build Block: implement the core flow without spiraling`
- `Ship Block: get it live and leave with a link you can share`

Recommended Product Trinity placement:

- keep it as a short line above or below the sprint section
- do not make it the main headline of the section

The page should feel like:

- promise
- fit
- reframe
- process

Not:

- promise
- thesis
- framework
- more framework
- process

## Checkout-Supporting Copy Recommendations

### Current friction

- The checkout area is close, but it still leans more on value stacking than immediate clarity.
- The trust line should do more to remove uncertainty about access and next steps.
- The guarantee is strong, but it should sit next to language that makes the first action feel obvious.

### Recommended checkout headline

Primary recommendation:

- `Get instant access to Ship by Sunday`

Backup options:

- `Start the Ship by Sunday sprint`
- `Open the workspace and start the CEO Block`

### Recommended checkout support copy

Primary recommendation:

- `A custom software-backed weekend sprint for builders who struggle to get a v1 out the door.`

Optional expanded version if more specificity is needed:

- `You are getting the Ship by Sunday workspace, the guided 4-block sprint, on-demand walkthroughs, prompts, worksheets, and the Product Management for Beginners bonus.`

### Recommended checkout trust lines

Use one or two of these near price and CTA:

- `One-time payment. Lifetime access. No subscription.`
- `After checkout, you'll land on the success page, your access will finish syncing, and you'll be taken into Mission to start.`
- `No need to wait for an email to begin.`
- `Built for builders who want to finish, not just watch.`

### Recommended guarantee line

Keep the current locked guarantee direction:

- `Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you.`

### Recommended checkout emphasis

The checkout area should answer these questions without making the buyer hunt:

- What am I buying?
- Is this for someone like me?
- What happens right after I pay?
- What is the risk if I get stuck?

## FAQ Edits And Additions

The FAQ should focus less on internal explanations and more on buying objections.

### Keep, but sharpen

**Who is this for?**

- `Ship by Sunday is for builders who struggle to get a v1 out the door. It is best for scoped apps, MVPs, and practical web products, not giant multi-system ideas.`

**Is this a coding course?**

- `No. Coding is part of the sprint, but this is not just a coding course. It is a guided process for deciding what to build, planning the core screens, building the key flow, and getting a real v1 live.`

**Do I need product or design experience?**

- `No. You do not need to become a product manager or designer in a weekend. You need enough product judgment and design direction to ship a usable first version, and the sprint is built to help you do that.`

**What kind of app is a good fit for this?**

- `Scoped web apps, MVPs, narrow tools, and practical products are the best fit. This is not for giant startup ideas with multiple systems, teams, and edge cases from day one.`

### Add

**What happens right after I pay?**

- `If you are not signed in yet, you will sign in first. After Stripe checkout, you will land on the success page while access finalizes. As soon as it is ready, you will be sent into Mission to start the sprint.`

**What if I already know a lot of this?**

- `Then the value is not more theory. The value is the structure. Ship by Sunday gives you a clean sequence, concrete outputs, and a tighter path from idea to shipped version so you actually finish.`

**What if I buy this and still do not finish?**

- `The sprint is built around four blocks and concrete outputs so you keep moving. If you complete the CEO Block within 14 days and do not leave with a clear One-Page Product Brief and tighter MVP scope, email us and we will refund you.`

**How long do I get access?**

- `Lifetime access. One payment, no subscription.`

### Candidate FAQ to remove or demote

`Why does the workspace matter?` is true, but it is less urgent than the objections above. It should be demoted below the buying objections or folded into another answer rather than taking a top FAQ slot.

## Final Approval Items

Founder approval is not required for this first-pass brief, but these items should be explicitly resolved before rollout:

- confirm public price: `$499` vs `$500`
- confirm the final public guarantee wording
- confirm whether the hero should lead with `app idea` language, `rough prototype` language, or a combined version
- confirm `lifetime access` is final and should stay in both hero-adjacent trust copy and checkout copy

## Bottom Line

The page does not need a new strategy. It needs a clearer order of explanation.

The strongest revision path is:

- simpler hero
- earlier fit + outcome clarity
- plain-language reframe before branded mechanism
- earlier 4-block process proof
- checkout copy that explains the next step cleanly
- FAQ that handles finish-risk and post-purchase uncertainty directly
