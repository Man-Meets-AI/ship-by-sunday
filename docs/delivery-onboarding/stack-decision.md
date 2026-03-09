# Ship by Sunday Stack Decision

Last updated: 2026-03-07

## Locked decision

- App / course shell: `Next.js`
- Deployment: `Vercel`
- Checkout: `Stripe`
- Auth: `Clerk`

## What this means

The marketing site, checkout handoff pages, onboarding shell, `Start Here` page, and course navigation should be planned around a `Next.js` app deployed on `Vercel`.

This aligns with:

- the recording / instructor materials
- the default teaching stack inside the course
- a fast path to shipping the public site and product shell

## Already supported by existing docs

- [recording sprint packets](../recording/sprint-packets.md)
- [course ops plan](../course-ops/plan.md)
- [offer and funnel plan](../offer-funnel/plan.md)
- [analytics and QA plan](../analytics-qa/plan.md)

## Still open

- exact Stripe checkout flow details
- exact Clerk access / post-purchase handoff flow
- where downloads and lesson video hosting will live

## Recommended next decision

Choose the exact post-purchase handoff flow next.

That is now the real blocker, not the app stack itself.
