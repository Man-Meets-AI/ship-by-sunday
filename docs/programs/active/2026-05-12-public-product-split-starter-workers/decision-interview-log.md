---
title: "Public Product Split Decision Interview Log"
summary: "Running log of one-at-a-time decisions for the Man Meets AI, Starter, and Workers split."
docType: "decision_log"
status: "active"
read_when:
  - "Continuing the decision interview before implementation."
  - "Checking which questions have already been resolved."
---

# Public Product Split Decision Interview Log

## Resolved Questions

### 1. Should `/workers` become permanently public marketing?

Recommended answer: yes. `/workers` should be public marketing, while protected Worker app work lives only below explicit operational subroutes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.

Answer: yes.

Resulting decision: `/workers` is permanently public. Paid Home and app navigation should link Worker customers into a specific protected operational route, not the public landing page.

### 2. After checkout, should buyers land directly in the product they bought?

Recommended answer: yes. Starter buyer checkout success should route to `/generate-codebase`, Worker buyer checkout success should route to `/workers/setup`, and `/home` should remain the returning-user, multi-capability, and unresolved-access hub.

Answer: yes.

Resulting decision: checkout needs a purchased-offer or default-surface value that drives product-aware success routing. Starter routes to `/starter/home`; Worker routes to `/workers/setup`.

### 3. Should a Worker purchase include access to the Starter videos/tutorial library?

Recommended answer: Starter-only by default.

Answer: Worker is totally separate.

Clarification captured: Starter has two first-run paths. A buyer can answer step-by-step questions to get a customized repo with a Program and ExecPlans in it, or skip customization and get a template plus guided videos.

Resulting decision: Worker purchases grant Worker access only by default. Starter template and guided video access is not included unless manually granted.

### 4. Where should the protected Starter experience live after purchase?

Recommended answer: keep protected Starter work at `/generate-codebase`.

Answer: use `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`.

Resulting decision: `/starter` remains public marketing. Protected Starter app work lives under `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`.

### 5. After Starter checkout, should the buyer land on `/starter/home` first, or go directly to `/starter/generate-codebase`?

Recommended answer: `/starter/home`.

Answer: yes.

Resulting decision: Starter checkout success lands on `/starter/home`, where the buyer chooses between guided customized repo generation and the template plus guided videos path.

### 6. What should `/home` do for single-product users?

Recommended answer: keep `/home` as a protected hub/fallback, but auto-forward single-product users to their product home when they hit it directly.

Answer: agree.

Resulting decision: Starter-only users visiting `/home` forward to `/starter/home`. Worker-only users visiting `/home` forward to `/workers/setup` or a later most-relevant Worker progress route. Multi-product, unresolved, and legacy users can see `/home` as a chooser or recovery state.

### 7. What should happen to old protected `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` routes?

Recommended answer: keep them as unpromoted redirects for the first implementation pass, then delete them later after the new route family has shipped cleanly.

Answer: ok.

Resulting decision: `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` redirect to matching `/starter/*` routes during the first cut and are not promoted as current product routes.

### 8. Should Starter lesson detail pages live at `/starter/lessons/[lessonKey]`?

Recommended answer: yes. Use `/starter/lessons` as the library index and `/starter/lessons/[lessonKey]` as the individual lesson detail/watch page.

Answer: yes.

Resulting decision: Starter lessons use an index plus keyed detail pages. `/tutorials/[lessonKey]` redirects to `/starter/lessons/[lessonKey]`.

### 9. Should the first implementation build two real Stripe-backed checkout offers?

Recommended answer: yes. Build two real app checkout offers now rather than relying on temporary/manual payment links.

Answer: yes.

Resulting decision: The first implementation must include app-backed `starter` and `workers` checkout offers. Starter grants generator plus videos and routes to `/starter/home`. Workers grants Worker access only by default and routes to `/workers/setup`.

### 10. What are the first public prices?

Recommended answer: Starter `$297` and Workers `$750`, with no auto-applied shared promotion code.

Answer: Starter `$297` and Workers `$600`.

Resulting decision: Starter is priced at `$297`; Workers is priced at `$600`. The new default checkout path should use clean offer-specific prices and should not use the current shared auto-promotion behavior.

### 11. For users who have both Starter and Worker access, should `/home` show only two cards?

Recommended answer: yes. Show only Starter and Workers.

Answer: yes.

Resulting decision: Multi-product `/home` shows only Starter and Workers. It does not show separate Tutorials or Generate Codebase cards.

### 12. What should the main public navigation be after the split?

Recommended answer: Man Meets AI, Starter, Workers, Blog, and Sign in.

Answer: yes.

Resulting decision: Public navigation includes only Man Meets AI, Starter, Workers, Blog, and Sign in. It does not include Docs, Tutorials, Generate Codebase, or Pricing.

### 13. Should `/` primarily be a brand/thesis split page?

Recommended answer: yes. `/` should route visitors by buyer intent rather than sell either offer directly.

Answer: yes.

Resulting decision: `/` is a Man Meets AI brand/thesis routing page with paths to `/starter` and `/workers`. Pricing belongs on product pages, not the index.

### 14. Should `/starter` lead with “Ship your idea by Sunday” as the H1?

Recommended answer: yes.

Answer: yes.

Resulting decision: `/starter` leads with `Ship your idea by Sunday.`, explains the two Starter paths, and uses `Get Starter — $297` as the primary CTA.

### 15. Should `/workers` lead with “Install AI workers into your existing codebase.” as the H1?

Recommended answer: yes.

Answer: yes.

Resulting decision: `/workers` leads with `Install AI workers into your existing codebase.`, explains the doctor pass, top findings, first approved worker loop, and proof or blocked-proof report, and uses `Get Workers — $600` as the primary CTA.

### 16. What is included in the `$600` Workers purchase?

Recommended answer: local runner setup, private doctor pass, top findings, approval of one worker loop, and proof or blocked-proof report.

Answer: yes.

Resulting decision: The `$600` Workers purchase includes local runner setup, private doctor pass, top findings, one approved worker loop, and proof or blocked-proof report. It does not imply unlimited implementation work.

### 17. Should the Workers page explicitly say this is a hands-on founding install while self-serve hardens?

Recommended answer: yes.

Answer: yes.

Resulting decision: `/workers` should explicitly set the expectation that founding installs are hands-on while the self-serve runner hardens. Buyers get help through setup, diagnosis, first loop approval, and proof review.

### 18. Should first-pass generated code customization be mostly source truth and plans?

Recommended answer: yes. Generate a clean template app, then customize docs, Program, ExecPlans, and agent instructions from the questionnaire.

Answer: yes.

Resulting decision: First-pass generated app code stays template-shaped. Questionnaire answers customize source truth, docs, Program, ExecPlans, and agent instructions.

### 19. Should compiler/generated-repo extraction be part of the first implementation slice?

Recommended answer: no. Make it Slice 2 after public IA, protected routes, checkout, access, redirects, `/home`, nav, and copy land.

Answer: yes.

Resulting decision: Compiler/generated-output extraction is Slice 2 unless it becomes a hard blocker for Slice 1. Slice 1 should avoid over-claiming generated-template behavior until Slice 2 lands.

### 20. Should `/docs` remain publicly reachable but unpromoted?

Recommended answer: yes. Keep `/docs` public by direct link, remove nav/sales promotion, and preserve generated-codebase support links.

Answer: yes.

Resulting decision: `/docs` remains publicly reachable for the first pass but is not promoted from public navigation, homepage CTAs, product paths, or sales-page CTAs.

### 21. Should Slice 1 create new blog posts from Plan/Program homepage material?

Recommended answer: no. Keep `/blog` linked and usable in Slice 1; extract posts later.

Answer: later content slice.

Resulting decision: Blog post extraction is deferred. Slice 1 should only keep `/blog` public, linked, and usable.

## Open Questions

The interview is still active.
