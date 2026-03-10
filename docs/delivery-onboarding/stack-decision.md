# Ship by Sunday Stack Decision

Last updated: 2026-03-10

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
- final lesson video hosting path

## Current implementation status

- Protected product routes are live in the Next.js app.
- The public home page now resumes entitled users into their last worked lesson, with `?marketing=1` as an explicit landing-page override.
- Start Here lessons `0.1` and `0.2` are in the lesson registry and content system.
- Lesson image/video uploads now persist to Convex storage and rehydrate into the lesson player.
- Worksheet and student-packet downloads are currently served from `public/downloads/`.

## Still intentionally deferred

- final hosted lesson video URLs
- transcript attachment for recorded lessons
- any richer download/library system beyond the current public download links

## Recommended next decision

Choose the exact post-purchase handoff flow and video hosting path next.

Those are now the real blockers, not the app stack itself.
