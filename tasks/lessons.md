# Local Lessons

Use this file to capture recurring mistakes, corrections, and guardrails for future work in this repo.

## Lessons

- Date: 2026-03-11
  Pattern: I mounted Clerk's `UserProfile` on a normal App Router page at `/settings`, which broke as soon as Clerk tried to navigate to its internal path-based subroutes.
  Rule: Any Next App Router route that hosts Clerk components with path-based navigation, such as `UserProfile`, must live under an optional catch-all segment like `[[...rest]]`, and the protected middleware matcher must cover the same base path with `(.*)`.
  How to verify next time: Before closing a Clerk profile/settings change, confirm the file path is `app/<mount>/[[...rest]]/page.tsx`, confirm middleware includes `/<mount>(.*)`, and open at least one nested profile URL.
- Date: 2026-03-11
  Pattern: I let lesson-level invalid styling derive from raw completion issues instead of from a validation-visibility gate, which made untouched required fields render as broken on first load.
  Rule: In learner flows, separate submit blocking from visible validation. Required-field errors should not render until the student attempts completion or another explicit validation trigger is active.
  How to verify next time: Open a fresh required lesson with empty state and confirm there are no inline error styles before interacting, then confirm the same lesson shows and clears errors correctly after one failed completion attempt.
- Date: 2026-03-11
  Pattern: I described Ship by Sunday in course-like language that made the custom software feel secondary and used a weaker ICP phrase than the user's preferred wording.
  Rule: When public-facing offer copy describes Ship by Sunday, make the custom software explicit and prefer `builders who struggle to get a v1 out the door` over more indirect capability-based phrasing unless a narrower segment is intentionally needed.
  How to verify next time: Check hero, checkout, and offer-summary lines for whether the software is named in the description and whether the ICP wording matches the chosen phrase before presenting recommendations.
- Date:
  Pattern:
  Rule:
  How to verify next time:
- Date: 2026-03-11
  Pattern: I inferred that the block labels should be deemphasized even though the product intent was that `CEO -> DESIGN -> BUILD -> SHIP` are the four ascending levels.
  Rule: For progression UI work, confirm whether existing labels are taxonomy, narrative flavor, or the actual level system before redesigning hierarchy around them.
  How to verify next time: Check the role docs, tracker notes, and user language for whether a label is meant to be preserved as the progression spine or translated into supporting copy.
