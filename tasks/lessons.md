# Local Lessons

Use this file to capture recurring mistakes, corrections, and guardrails for future work in this repo.

## Lessons

- Date: 2026-03-11
  Pattern: I let lesson-level invalid styling derive from raw completion issues instead of from a validation-visibility gate, which made untouched required fields render as broken on first load.
  Rule: In learner flows, separate submit blocking from visible validation. Required-field errors should not render until the student attempts completion or another explicit validation trigger is active.
  How to verify next time: Open a fresh required lesson with empty state and confirm there are no inline error styles before interacting, then confirm the same lesson shows and clears errors correctly after one failed completion attempt.
- Date:
  Pattern:
  Rule:
  How to verify next time:
- Date: 2026-03-11
  Pattern: I inferred that the block labels should be deemphasized even though the product intent was that `CEO -> DESIGN -> BUILD -> SHIP` are the four ascending levels.
  Rule: For progression UI work, confirm whether existing labels are taxonomy, narrative flavor, or the actual level system before redesigning hierarchy around them.
  How to verify next time: Check the role docs, tracker notes, and user language for whether a label is meant to be preserved as the progression spine or translated into supporting copy.
