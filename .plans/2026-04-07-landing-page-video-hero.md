---
summary: Recompose the homepage hero so it can carry a centered sales-video slot without breaking the existing CTA, section-order, or blueprint-first homepage contract.
read_when: Open this when changing the homepage hero layout or wiring the eventual sales-video embed into the public landing page.
plan_status: done
---

# Landing Page Video Hero

## 1. Task framing

- **Surface type:** landing page
- **Goal:** Make the homepage hero support a centered dominant video slot that can later host a real sales video while still reading as one calm first-screen composition.
- **User / audience:** Knowledge workers and solo founders using AI coding/design tools to ship a v1 in one weekend.
- **Job to be done:** Understand Ship by Sunday quickly and take the primary CTA with confidence.
- **Existing system or new surface:** extend existing system
- **Primary route / screen / component(s):** `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `apps/web/features/marketing/content/home.ts`, new hero media component, homepage tests.
- **References:** user-provided screenshot of a centered sales-video hero.
- **Reasoning level:** medium because this changes the first-screen composition and should preserve homepage contracts.
- **Definition of done:** Hero renders with a centered dominant media block, the content contract supports preview/embed modes, desktop/mobile both read clearly, and tests/docs reflect the change.
- **Funnel or blueprint stage affected:** public marketing

## 2. Constraints

- **H1 rule:** one H1
- **Max major sections:** unchanged homepage section count
- **Typeface limit:** existing two-font system only
- **Accent color strategy:** keep the current restrained neutral palette with a single primary accent
- **Primary CTA above fold:** yes, existing checkout CTA remains above the fold
- **Hard constraints from product or brand:**
  - Keep the page blueprint-first, not hype-first.
  - Preserve the existing CTA boundary and section order.
  - Keep the first viewport as one composition, not a dashboard.
- **Ship by Sunday invariants:**
  - Do not move checkout logic out of `HomePagePrimaryCta`.
  - Do not change `#system` or `#pricing` anchors.
  - Do not require a real video URL to render the hero safely.

## 3. Visual thesis

> A calm, premium editorial hero with one dominant centered media plane that makes the upcoming sales video feel intentional rather than bolted on.

## 4. Content plan

| Section | Purpose | Headline / label | Supporting copy | Primary action | Dominant visual idea |
|---|---|---|---|---|---|
| 1 | hero | Existing Ship by Sunday hero headline | Existing body copy | Existing primary CTA | Centered framed video slot or preview |
| 2 | support | Existing system section | Existing copy | Existing secondary CTA / scroll | Unchanged |

## 5. Interaction thesis

1. Hero media should feel present through scale, framing, and subtle hover polish rather than noisy animation.
2. The CTA row should remain visually linked to the media block instead of floating as a separate promo strip.
3. The layout should collapse cleanly to mobile without clipping the headline or crowding the media.

## 6. Surface-specific rules

- **Brand signal:** Keep the wordmark/top bar and existing display headline as the unmistakable first-screen brand signal.
- **Hero composition:** centered editorial stack with dominant media anchor.
- **Hero budget:** wordmark/top bar, headline, supporting sentence, CTA group, dominant media.
- **Hero exclusions:** no stat rows, countdowns, detached promo stickers, or extra proof strips above the fold.

## 7. Design system plan

- **Tokens to use or define:** reuse existing homepage tokens only.
- **Typography roles:** keep current marketing display headline and sans body/caption hierarchy.
- **Layout system:** preserve `max-w-7xl` shell and tighten the hero to a centered `max-w-5xl` composition.
- **Components to reuse:** `HomePagePrimaryCta`, `HomePageSecondaryLink`, `HeroAtmosphere`, `ProductBrand`.
- **New components or tokens to add:** add one feature-local hero media component.

## 8. Imagery plan

- **Imagery role:** narrative anchor
- **Source:** existing asset library for preview mode until a real embed URL is supplied
- **Key visual attributes:** wide aspect ratio, quiet frame, calm contrast, no badge clutter
- **Text-safe area:** text stays above the media, not over it
- **Failure modes to avoid:** dashboard-like stacked cards, promo overlays, noisy labels, fake player chrome

## 9. Copy plan

- **Tone:** premium, direct, editorial
- **Copy source:** existing real homepage copy
- **What the user should understand after scanning headings only:**
  - Ship by Sunday helps ship a real product by Sunday.
  - The system is concrete enough to show, not just describe.
  - There is one clear primary action.
- **What will be aggressively removed:**
  - extra hero chrome
  - any redundant media labels
  - any placeholder copy that reads like implementation notes

## 10. Implementation plan

1. Extend hero content with a discriminated media model that supports preview and future embed modes.
2. Add a feature-local hero media component that renders preview or iframe safely.
3. Recompose the hero layout so the media sits centered in the stack with the CTA row attached.
4. Add tests and update design docs/notes.

## 11. Verification plan

- **Desktop viewports to check:** 1440px and 1280px wide
- **Mobile viewports to check:** 390px wide
- **Validation tools available:** Playwright, lint, typecheck, format
- **Reference comparison method:** manual comparison against the user screenshot and existing homepage patterns
- **Homepage contract review needed?** yes
- **Checklist sections that must pass before merge:**
  - landing page first-screen rules
  - homepage contract preservation
  - responsive verification

## 12. Acceptance criteria

- [x] The result matches the chosen visual thesis.
- [x] The result matches the chosen content plan.
- [x] The result matches the chosen interaction thesis.
- [x] Desktop and mobile both work.
- [x] The screen can be understood quickly.
- [x] The design system remains coherent.
- [x] The implementation fits the repo's architecture.
- [x] Blueprint-first product rules still hold.
- [x] Known tradeoffs are documented.

## 13. Risks, unknowns, and follow-ups

- **Known risks:**
  - No live sales-video URL exists in the repo yet.
  - The current hero copy is long enough that spacing can drift if the media block is oversized.
- **Open questions:**
  - Which final embed provider or URL format will the sales video use?
- **Follow-up ideas intentionally deferred:**
  - auto-playing or advanced video analytics
  - extra social-proof strips in the hero

## 14. Completion notes

- **What changed:** Added a typed hero media boundary with preview/embed modes, reordered the hero so the media sits directly under the two-line headline, normalized the CTA stack width, removed the top-bar primary CTA, and tightened mobile wordmark/headline behavior.
- **What deviated from plan and why:** The final hero order became headline, media, CTA stack, then support sentence so the video slot could stay dominant on small screens.
- **What still needs work:** Wire the actual sales-video embed URL into `homePageContent.hero.media` when it is ready.
- **Documentation updated:** yes; `docs/ship-by-sunday/design-pack/decisions/landing-page-video-hero.md` and `docs/ship-by-sunday/design-pack/decisions/changelog.md`
