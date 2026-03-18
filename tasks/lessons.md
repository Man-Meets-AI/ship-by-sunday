# Local Lessons

Use this file to capture recurring mistakes, corrections, and guardrails for future work in this repo.

## Lessons

- Date: 2026-03-18
  Pattern: I left the shared app-shell brand link pointing straight at `routeConfig.mission`, which bypassed the auth-aware home-entry logic and turned the navbar logo into a dead or fragile destination when `/mission` was not the right direct landing target.
  Rule: In this repo, shared brand/logo navigation should prefer the canonical home entrypoint unless the surface truly needs a fixed deep link. If `/` already handles signed-out marketing and signed-in resume routing on the server, reuse that path instead of duplicating or bypassing it with a hardcoded protected route.
  How to verify next time: When wiring any global logo or brand link, trace the existing entry-route redirect behavior first, then browser-QA the logo click from both a signed-out session and an entitled signed-in session.

- Date: 2026-03-14
  Pattern: I kept reading or updating a root `todo.md` from shared skills even after this repo moved its operational tracker to `docs/internal/todo.md`, which risks missing the real launch state and writing to a stale pointer file.
  Rule: In this repo, treat `docs/internal/todo.md` as the canonical tracker unless the task explicitly says otherwise. Shared planning, docs, and critique workflows should prefer the repo's canonical tracker path, not assume a root `todo.md`.
  How to verify next time: Before using any planning or docs workflow, confirm which tracker file `AGENTS.md` names as the source of truth, and if a skill says `todo.md`, adapt it to `docs/internal/todo.md` when that file exists.

- Date: 2026-03-14
  Pattern: I produced planning output that was structurally correct but not immediately executable, and the next user move collapsed into repeated `Implement the plan.` follow-ups instead of a clean coding handoff.
  Rule: When a planning artifact is meant for a downstream builder, make the execution entry obvious inside the plan itself. The chosen slice, first implementation milestone, affected systems, and first verification step should be explicit enough that a follow-up coding pass can start without re-planning.
  How to verify next time: Re-read the final plan and ask whether a coding agent could start from it without another clarification turn. If the first file area, first milestone, or first validation step is still implicit, the plan is not ready.

- Date: 2026-03-14
  Pattern: I left a user-managed implementation skill routing to a `$shadcn` specialist that is not actually installed in this environment, which creates dead-end guidance and weakens trust in the skill graph.
  Rule: Never tell the agent to call a specialist unless that specialist is actually available in the current repo or home-managed skill inventory. If a framework-specific helper is absent, preserve the existing system and route to the closest installed specialist instead of naming a missing one.
  How to verify next time: Before closing any skill edit, search the live skill inventory and confirm every referenced specialist exists. If a skill name does not resolve to a real `SKILL.md`, remove or conditionalize the route.

- Date: 2026-03-13
  Pattern: I left `worksheet` language in buyer-facing and student-facing app copy even though the live product is no longer positioned around worksheets, which made `Start Here`, coach resources, and landing-page copy promise an asset model the product does not actually use.
  Rule: When naming deliverables or support assets in this repo, use the nouns the product actually ships now. If the experience is centered on templates, artifacts, or the guided sprint, remove stale worksheet language across landing, Start Here, coach resources, template CTAs, and tests in the same sweep.
  How to verify next time: Before closing any copy or curriculum sweep, run `rg -n -i "worksheet|worksheets" app components lib tests --glob '!**/*.md'` and confirm the remaining user-facing paths use the current product vocabulary.

- Date: 2026-03-13
  Pattern: I over-corrected the bottom lesson rail by stacking a progress summary, explicit state badges, and visible `Q` / `E` teaching into the same strip, which made adjacent navigation feel heavier than the user job and mismatched how people actually try to move through lessons.
  Rule: For persistent lesson footer navigation, keep the rail focused on adjacent movement. Do not combine macro progress copy, per-step status badges, and shortcut education in the same bar. Default the visible mental model to left/right movement, keep any `Q` / `E` fallback hidden, and make cross-stage movement explicit only at the boundary button.
  How to verify next time: Open a mid-block lesson and a stage-end lesson, confirm the footer reads as one navigation strip at a glance, confirm there is no extra summary/hint row, and confirm `ArrowLeft` / `ArrowRight` work only when focus is not inside forms, buttons, links, or video controls.

- Date: 2026-03-13
  Pattern: I updated `STRIPE_WEBHOOK_SECRET` in `.env.local` after starting `stripe listen`, but local checkout still hung because Convex validates the same secret from its own deployment env and that value was still stale.
  Rule: For local Stripe webhook testing in this repo, always treat webhook setup as a 3-part sync: the active `stripe listen` secret, `.env.local`, and `convex env`. After starting or restarting the Stripe listener, update `.env.local`, run `convex env set STRIPE_WEBHOOK_SECRET <new secret>`, and restart the local web server if needed.
  How to verify next time: Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`, confirm the same secret appears in `.env.local` and `node ./node_modules/convex/bin/main.js env list`, then trigger or complete a test checkout and verify `/api/stripe/webhook` receives `checkout.session.completed` without signature errors.

- Date: 2026-03-13
  Pattern: I initially assumed Stripe CLI account context would naturally match the app's `STRIPE_SECRET_KEY`, but the local listener was authenticated to a different Stripe account, which made real checkout events invisible to the forwarder even though sandbox payments succeeded.
  Rule: For local Stripe QA, never trust the default Stripe CLI account. Start listeners with the app secret key or a repo helper that does it for you, and verify the listener account matches the app account before debugging webhook behavior.
  How to verify next time: Print the Stripe account from `STRIPE_SECRET_KEY`, then run the listener via `pnpm run stripe:listen:local` and confirm real `checkout.session.completed` events on the app account correspond to webhook deliveries on the local route.

- Date: 2026-03-12
  Pattern: I left lesson `3.2` in a heavy focus-workbench layout even though the user wanted it to behave like the repo's existing watch-first lessons, which created unnecessary checklist chrome where the main job was to watch the walkthrough and then move into the editor.
  Rule: When a lesson's primary job is to watch a walkthrough and then continue off-screen, match the existing watch-shell contract instead of inventing a custom form/checklist view. Keep the surface mainly video unless the user explicitly wants additional in-product capture.
  How to verify next time: Compare the lesson against the current watch-only lessons before implementing, confirm the main action is watching rather than filling fields, and browser-QA that the screen reads as video-first on first load.

- Date: 2026-03-12
  Pattern: I reached for a skill during a direct prompt-rewrite request, which added unnecessary process when the user wanted a plain rewritten artifact immediately.
  Rule: When the user explicitly asks for a direct rewrite or copy-paste-ready prompt, return the rewritten artifact directly and do not invoke skills unless they also ask for a reusable workflow or skill.
  How to verify next time: Check whether the user wants a reusable system or just a rewritten deliverable. If it is just the deliverable, respond with the artifact itself and skip skill usage.

- Date: 2026-03-12
  Pattern: I treated a planning handoff skill like a mixed planning-and-build lane, which blurred the workstream boundary and made the skill name misleading once an engineering review pass was introduced.
  Rule: When the output is meant to be a plan for another agent, keep the skill plan-only, name it as a planning lane, and make adjacent review lanes consume the same packet instead of inventing a second artifact type.
  How to verify next time: Before closing any planning-skill change, check whether the skill edits code; if it does, it is not purely a planning lane. Confirm the downstream review step enriches the same machine-readable packet and that the skill name matches the actual responsibility.

- Date: 2026-03-12
  Pattern: I designed browser QA around a shared auth account but left user provisioning implicit, which makes auth smoke tests flaky and creates a false assumption that the Clerk user already exists.
  Rule: Any browser-QA flow that depends on auth must verify provisioning prerequisites first. For this repo's Clerk instance, that means checking for the shared test user before sign-in and treating SSO or other non-password auth as a separate mode instead of forcing the password account.
  How to verify next time: Before closing QA-skill changes or auth smoke work, confirm there is one canonical test-account source, a concrete preflight path exists, and the workflow stops cleanly when the sign-in surface is not compatible with the default auth model.
- Date: 2026-03-12
  Pattern: I left component structure rules implicit, which risks shipping oversized UI files that mix presentation with stateful or behavioral logic.
  Rule: Never create a component longer than 150 lines. If a component exceeds that limit, split it automatically and keep UI separate from logic by moving behavior into hooks, helpers, or controller components.
  How to verify next time: Before closing any UI task, check component file length and confirm rendering stays in the component while non-presentational logic lives outside the presentational layer.
- Date: 2026-03-12
  Pattern: I left a block wrap-up lesson as a generic artifact dump even though the learner had already done the real work upstream, which made the handoff feel flat and left the downstream artifact effectively empty.
  Rule: When a wrap-up lesson has little or no new input of its own, compose the artifact from the saved upstream artifacts and treat the screen as a reward + handoff moment, not another plain form or context dump.
  How to verify next time: Check whether the wrap-up lesson is creating new information or locking existing information. If it is locking existing information, confirm the artifact preview is composed from prior lesson outputs, the shell progress is nonzero, and the page makes the next stage obvious before you close the work.
- Date: 2026-03-12
  Pattern: I proposed a form-first preview for a lesson output that the user actually wanted to feel like a reusable premium asset, which would have made the experience feel cheap even if the data model underneath was clean.
  Rule: If a lesson output is meant to become a reusable visual asset later, default to a real stage or canvas surface early. Keep the underlying data structured, but do not make the learner experience feel like a worksheet pretending to be a tool.
  How to verify next time: Ask whether the output is only data capture or a visual asset the learner should feel confident reusing. If it is an asset, browser-QA the first render and make sure it feels like a product tool before closing the work.
- Date: 2026-03-12
  Pattern: I left Scope Hammer as three blank manual fields even though the earlier CEO lessons had already captured enough context to generate a first-pass scope cut, which made the lesson feel like another exhausting form instead of a momentum step.
  Rule: When a later lesson asks the learner to synthesize context that already exists in upstream artifacts, default to a generated prompt/import flow before asking for blank manual entry. Keep the structured fields only as editable cleanup surfaces.
  How to verify next time: Check whether prior artifacts already contain the real inputs, and if they do, confirm the page opens with a copyable prompt or prefilled recommendation instead of an empty board/textarea trio.
- Date: 2026-03-12
  Pattern: I left a pinned-artifact card using both the source-lesson title and a curated context title, which made the `1.5` core-flow page read like repeated headers, and I left stale worksheet-PDF placeholder UI in place after the actual handoff should have moved to an external FigJam template.
  Rule: When a lesson artifact has a curated learner-facing context title, render that as the only card header. If a worksheet handoff moves to an external workspace like FigJam, remove any dead placeholder fields and rename the downstream artifact/upload copy to match the real student output.
  How to verify next time: Open the downstream lesson with saved upstream artifacts, read the pinned cards top-to-bottom for duplicate header language, confirm there is no dead placeholder block, and confirm the template CTA plus upload label describe the same deliverable.
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
- Date: 2026-03-12
  Pattern: I added a second user-selection step in lesson `1.2` even though the learner had already chosen the user by selecting a candidate problem from the prior handoff.
  Rule: When a prior lesson handoff already locks the actor, the next lesson must treat that carried-forward value as the source of truth instead of asking the learner to re-enter or redefine the same actor.
  How to verify next time: Trace the handoff artifact first, confirm whether the selected record already contains the actor, and browser-QA the next lesson to make sure the learner chooses that actor exactly once.
- Date: 2026-03-12
  Pattern: I reused the generic eyebrow-plus-title card pattern for the `1.2` handoff chooser even though both lines were giving the same instruction and making the section read like duplicated headers.
  Rule: If a workbench section is the primary action on the page, give it one clear heading. Do not stack eyebrow and title copy that say the same thing, and make selection cards use a fixed structure so CTA rows align across uneven content lengths.
  How to verify next time: Read the section top-to-bottom without context, confirm the main instruction appears once, and browser-QA mixed-length cards to make sure the action row lands at the same height.
- Date: 2026-03-11
  Pattern: I inferred that the block labels should be deemphasized even though the product intent was that `CEO -> DESIGN -> BUILD -> SHIP` are the four ascending levels.
  Rule: For progression UI work, confirm whether existing labels are taxonomy, narrative flavor, or the actual level system before redesigning hierarchy around them.
  How to verify next time: Check the role docs, tracker notes, and user language for whether a label is meant to be preserved as the progression spine or translated into supporting copy.
- Date: 2026-03-12
  Pattern: I added a ready-to-complete state, but the actual lesson completion moment still felt emotionally flat because the only visible success signal was a subtle progress-rail change during immediate navigation.
  Rule: In student flows, completion must trigger a visible multi-surface success response before route changes. At minimum: CTA success morph, explicit completion copy, and one shell-level progression cue, all with reduced-motion-safe fallbacks.
  How to verify next time: Complete a lesson in the live UI and confirm the success moment is noticeable without hunting for it, the reward survives long enough to register before navigation, and reduced-motion users still get clear non-animated state changes.
- Date: 2026-03-13
  Pattern: I let a machine-readable planning skill return raw JSON-only output, which preserved structure but made the result awkward to review and reuse in normal chat workflows.
  Rule: When an artifact must stay machine-parseable but will still be read in chat, return it with the smallest human shell possible: one short markdown heading and one fenced code block, with no extra prose.
  How to verify next time: Read the output in chat, confirm it is visually scannable without losing parseability, and make sure a downstream agent can still copy the payload directly from the fenced block.

- Date: 2026-03-13
  Pattern: I left skill docs pointing at `~/.codex/skills` even though this machine's canonical user-managed skill store is `/Users/parkerrex/.agents/skills`, which creates path drift and install confusion.
  Rule: On this machine, any user-managed skill path, script path, or install guidance must point to `/Users/parkerrex/.agents/skills` unless the task is explicitly about Codex system skills.
  How to verify next time: Search changed skill docs for `.codex/skills`, compare the instructions against the repo AGENTS guardrails, and confirm example commands resolve to real files under `.agents/skills`.

- Date: 2026-03-13
  Pattern: I let skill discovery guidance jump straight to global installs even though the local workflow is supposed to check existing `.agents` coverage first and route managed adoption through Team Hub.
  Rule: For this setup, skill discovery is local-first. Search the current skill inventory before suggesting installs, and route new managed skills through `/Users/parkerrex/Projects/team-wiki` or a deliberate local fork instead of ad hoc global installs.
  How to verify next time: Before recommending installation, check whether an existing skill already covers the task, and confirm any install or adoption instructions match the `.agents` plus Team Hub workflow.

- Date: 2026-03-13
  Pattern: I started from screen-level critique patterns instead of enforcing a goal-clarity gate that ties the UI to product outcomes and business outcomes.
  Rule: For UX critique work, never start from surface form alone. First establish product goal, surface goal, business model, and relevant metrics, then critique gaps and propose prioritized solutions with explicit trade-offs.
  How to verify next time: Before delivering critique output, confirm the response includes goal context, `Problems I Notice`, `Solutions I Recommend`, trade-off rationale, and a narrative summary that ties user impact to business impact.

- Date: 2026-03-18
  Pattern: I polished `/checkout/success` inside the current app shell but left sibling buyer-flow routes on the older `ink/paper/line` palette, which made trust-critical checkout surfaces drift visually and feel like hardcoded placeholders.
  Rule: When touching any trust-critical buyer-flow route inside the product runtime, audit its neighboring routes for token drift before closing. For app-flow surfaces such as checkout success, checkout cancel, and access recovery, prefer the current `product-*` token system and `ProductShell`-aligned treatment over older standalone `ink/paper/line` cards unless the route is intentionally part of the marketing/auth entry experience.
  How to verify next time: Run `rg -n "bg-white|border-line|text-ink|bg-paper|bg-ink|text-paper" app/checkout app/access-required app/settings app/mission app/lesson features/checkout features/course features/settings --glob '!**/*.test.*'` and confirm any remaining hits are intentional before marking the UI pass complete.
