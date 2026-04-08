---
doc_id: landing-page-video-hero
title: Homepage Hero Video Layout
owner: Codex
team: Ship by Sunday
surface_type: landing page
status: active
created: 2026-04-07
last_reviewed: 2026-04-07
review_cadence: when the homepage hero or sales-video embed changes
related_plan: .plans/2026-04-07-landing-page-video-hero.md
related_files:
  - apps/web/features/marketing/components/home-page/hero-sections.tsx
  - apps/web/features/marketing/components/home-page/home-hero-headline.tsx
  - apps/web/features/marketing/components/home-page/home-hero-media.tsx
  - apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx
  - apps/web/features/marketing/content/home.ts
tags:
  - homepage
  - hero
  - landing-page
  - video
---

# Homepage Hero Video Layout

## 1. Summary

The homepage hero now centers a dedicated media block so the future sales video can be the visual anchor of the first screen instead of feeling bolted on below the fold.

## 2. Problem and goal

- **Problem:** The original hero was text-heavy and pushed the media preview too far down, especially on mobile. The nav also let the wordmark wrap awkwardly.
- **Goal:** Make the hero read in one glance, keep the headline to two lines max, pin the nav items to the corners, and let the media block act as the dominant hero surface.
- **Audience / user:** Knowledge workers and solo founders using AI tools to ship a product quickly.
- **Surface type:** landing page

## 3. Final outcome

- The hero headline stays on two lines and sits higher in the viewport.
- The hero media block sits directly under the headline and above the support copy.
- The top bar now shows only the wordmark on the left and sign-in on the right.

## 4. Design direction

- **Visual thesis:** A calm editorial hero with one centered media plane that can cleanly switch from preview art to a live sales-video embed.
- **Content plan:** Wordmark/sign-in, two-line headline, centered media, CTA stack, then one short support sentence.
- **Interaction thesis:** Keep motion subtle and let scale, spacing, and width consistency do the work.

## 5. Scope of work

### Routes / screens / components changed

- `apps/web/features/marketing/components/home-page/hero-sections.tsx`
- `apps/web/features/marketing/components/home-page/home-hero-headline.tsx`
- `apps/web/features/marketing/components/home-page/home-hero-media.tsx`
- `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx`
- `apps/web/features/marketing/content/home.ts`

### Out of scope

- Wiring a real sales-video URL
- Adding analytics, autoplay, or player-specific controls

## 6. Design-system decisions

### Tokens added or changed

- No global tokens changed.

### Typography decisions

- Reduced the hero headline clamp so each headline row stays intact on mobile.
- Forced the top-bar wordmark to stay on one line with a smaller nav-specific size.

### Layout and composition decisions

- Moved the media block directly under the headline.
- Moved the support sentence below the CTA stack.
- Normalized the primary and secondary CTA widths to one shared column.

### Component reuse vs new work

- **Reused:** `HomePagePrimaryCta`, `HomePageSecondaryLink`, `HeroAtmosphere`, `ProductBrand`
- **New:** `HomeHeroMedia`
- **Why:** The hero needed one feature-local boundary that can render preview mode now and iframe embed mode later.

## 7. Imagery and content decisions

- **Imagery source:** existing asset library via `productConfig.images.heroPreview`
- **Why this imagery works:** It lets the layout ship now while keeping a realistic centered media frame for the upcoming sales video.
- **Copy strategy:** Tightened the support sentence so the hero composition stays focused on headline plus media.
- **What was removed:** the extra top-bar CTA and the oversized mobile hero stack

## 8. Motion and interaction

1. Preserved the existing reveal sequence.
2. Kept the media frame visually strong through scale and shadow instead of decorative animation.
3. Made the CTA stack feel intentional by giving both actions a shared width.

## 9. Responsive behavior

- **Desktop checks:** verified at 1280px wide with Playwright.
- **Mobile checks:** verified at 390px wide with Playwright.
- **Layout safety notes:** headline stays to two rows, top bar keeps wordmark/sign-in in opposite corners, and the media remains visible before the support sentence on mobile.

## 10. Verification

- **Manual review:** checked the homepage in Playwright against the user-provided reference direction.
- **Automated checks:** targeted `integration-ui` test for `HomeHeroMedia`; broader repo gates still required before merge.
- **Reference comparison:** manual comparison to the supplied sales-video landing-page screenshot.
- **Checklist status:** landing-page first-screen rules, homepage contract preservation, and responsive verification were the primary checklist sections used.
- **Blueprint-first status:** CTA boundaries and homepage section order remained intact.

## 11. Tradeoffs and deviations

- The hero still uses a preview asset until a real embed URL is supplied.
- The support sentence now sits below the CTA stack so the media stays visually dominant.

## 12. Known issues

- The hero is ready for embed mode, but no live sales-video URL is wired yet.

## 13. Follow-ups

- Replace preview mode with a real sales-video embed.
- Decide whether the desktop hero should also keep the primary CTA fully above the fold at all times.

## 14. Screenshots and references

- **Before:** user-provided mobile screenshot showing wrapped wordmark and uneven CTA stack
- **After:** verified locally in Playwright at 390px and 1280px widths
- **Plan used:** `.plans/2026-04-07-landing-page-video-hero.md`
- **Additional references:** user-provided sales-video landing-page screenshot

## 15. Maintenance

- **Update owner:** whoever changes the homepage hero next
- **How stable knowledge is refreshed:** update this note when hero order, nav behavior, or media mode changes
- **How often examples are re-baselined:** when the live sales video is attached
- **Sunset criteria:** replace this note when the homepage hero is redesigned again

## 16. Source guidance

This work was guided by:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- `.plans/2026-04-07-landing-page-video-hero.md`
