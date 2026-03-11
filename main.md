# Ship by Sunday Launch OS

Last updated: 2026-03-11

## Launch objective

Ship a sellable, deliverable, promotable version of `Ship by Sunday` that can take cold traffic, warm audience traffic, and later outbound traffic without breaking trust.

## North Star buyer journey

1. Understand the offer quickly
2. Buy cleanly
3. Get access without confusion
4. Land in `Mission` / `Start Here` immediately
5. Complete the first worksheet and make progress toward a shipped v1

## What is locked

- Core offer: `Ship by Sunday`
- Core promise: `Go from idea to v1 this weekend`
- Core audience: builders who can already prototype or get things working, but keep getting stuck before they ship a real v1
- Core mechanism: `The Product Trinity` = product strategy, design, and development working together
- Product format: software-guided weekend sprint plus on-demand walkthroughs, digital guide/workbook, prompts, and worksheets
- Product vehicle: the `Ship by Sunday` workspace plus the guided 4-block sprint
- Fear-reducing bonus: `Product Management for Beginners` for buyers who do not trust their product judgment yet
- App stack: `Next.js` on `Vercel` with `Clerk` for auth, `Convex` for app data, and `Stripe` for checkout / entitlement handoff
- Tripwire is deprioritized until the core buyer journey is stable

## Current state as of Tuesday, March 10, 2026

- The public landing page, FAQ, and primary pricing CTA are live in `app/`.
- Protected product routes are live at `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and `/access-required`.
- `lib/course/manifest.ts` and `content/lessons/` now cover the full structured curriculum, including `0.0`, `0.1`, and `0.2` for the start-here flow.
- Convex already handles lesson autosave, progress, locked lesson gating, entitlement checks, artifact listing, upload persistence, and homepage resume routing.
- Stripe checkout creation, success/cancel pages, and the webhook grant path are implemented in the app.
- The remaining launch blockers are not architecture. They are live-env activation, recording completion, final media hosting, support ownership, analytics, and QA.

## Live blockers

1. Founder recording status is not fully logged, and the next committed recording slot still needs to be explicit in `docs/recording/founder-checklists.md`.
2. The Stripe webhook path exists in code but still needs final env setup and endpoint registration for live entitlement grants.
3. Clerk production envs and issuer configuration still need to replace any local placeholder setup.
4. Final lesson video hosting is still undecided.
5. Support inbox ownership and the exact refund / access-help path are still undefined.
6. Analytics instrumentation and end-to-end buyer journey QA are not complete.

## Critical path now

1. Record and upload the core lessons
2. Activate the live purchase-to-access handoff
3. Choose video hosting and attach real lesson media
4. Tighten the post-purchase onboarding and support path
5. Instrument the minimum viable analytics
6. Run end-to-end QA across purchase, access, first lesson, and Worksheet 01

## Current product handoff

1. Logged-out visitors click `Get instant access` and are sent to Clerk sign-in.
2. Signed-in buyers start Stripe Checkout from the landing page CTA.
3. Stripe success lands on `/checkout/success`, which waits for the entitlement to be granted.
4. The webhook grants the Convex entitlement.
5. The success page redirects the buyer into `/mission`.
6. Returning entitled users who land on `/` are resumed into `/mission` or their last worked lesson unless they use `?marketing=1`.

## Decisions still open

- Final lesson video host / delivery path
- Support inbox and response owner
- Whether launch includes a transactional access email or relies on the in-app success flow first
- Final founder approval on proof claims and any launch-blocking access-flow wording

## Founder-only work

- Set the next recording slot and log it in `docs/recording/founder-checklists.md`
- Record `Day 1: Overview + CEO Block`
- Confirm the exact examples to use on camera
- Approve only launch-blocking proof claims, visuals, and access-flow wording

## What not to work on now

- Tripwire packaging
- Full Instagram grid
- Large outbound volume
- Expanded YouTube library
- Nice-to-have extra worksheets
- Additional nurture sequences beyond the core launch flow

## Next 7 days

### Tuesday, March 10, 2026

- Rebaseline docs and tracker to the real product state
- Confirm the founder recording calendar and Day 1 status
- Prepare the webhook / Clerk env activation checklist

### Wednesday, March 11, 2026

- Record `Day 1: Overview + CEO Block` or log pickups if it was already recorded
- Register the Stripe webhook endpoint and secret
- QA purchase -> entitlement -> `Mission` redirect

### Thursday, March 12, 2026

- Decide the lesson video hosting path
- Attach first real lesson media and validate download links
- Tighten success-page and access-required copy against the actual handoff

### Friday, March 13, 2026

- Define the support inbox, owner, and refund-response path
- Set up the minimal event instrumentation and bug tracker
- Validate the `Start Here` and Worksheet 01 path

### Saturday, March 14, 2026

- QA landing page, sign-in, checkout, success, `Mission`, first lesson, and worksheet flow on desktop and mobile
- Fix only revenue-impacting or trust-impacting issues

### Sunday, March 15, 2026

- Record the next block or complete pickups
- Confirm the course library, downloads, and support path are coherent

### Monday, March 16, 2026

- Decide what is safe to publish now
- Hold back anything that is not stable enough for the first student

## Operating rule

If a task does not directly help sell, deliver, onboard, or support the first student, it is later-phase work.
