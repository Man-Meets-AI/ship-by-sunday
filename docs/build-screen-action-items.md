# Build Screen Action Items

## Build-wide actions

- Create a reusable `Tool stack` block for Build lessons using `Accordion` + `Card`.
- Include these tools wherever relevant: `VS Code / Cursor`, `Codex`, `GitHub`, `Clerk`, `Convex`, `Stripe`, `Vercel`, `Cloudflare`, `Resend`, `React Email`.
- Add a required `Leave this lesson with` artifact for every Build page so the student exits with something usable, not just a watched video.
- Promote critical links into the main lesson body. Do not hide setup-critical links in a generic collapsed resources panel.
- Use `copy_prompt` cards aggressively on Build pages. The transcripts repeatedly teach “ask the AI this” and that should be first-class UI.

## 3.0 Build Kickoff

Source signal:
- `3.0--build-overview`

Action items:
- Add an `Accounts and tools` checklist for `VS Code/Cursor`, `Codex`, `Clerk`, `Convex`, and `Stripe`.
- Add `Template path` vs `Manual path` tabs.
- Add primary resource links for the starter repo and the long-form guide.
- Add a `First instruction to AI` textarea.
- Add a `Know the lay of the land` accordion so the student understands just enough to steer the AI.

## 3.1 Clone Template

Source signal:
- `3.11--build-day-2-clone-template`
- `3.9--github`

Action items:
- Add a `Starter repo URL` input and `Copy this repository down` prompt card.
- Add a `Start fresh repo` prompt card that wipes template history and initializes the student’s repo.
- Add a `Before you run the server` checklist for `env.local`, `Convex`, `Clerk`, and `Stripe`.
- Add a `Run the server` CTA instead of leaving this as passive explanation.
- Add a `Folder name for my project` input so the student decides where this repo is going to live before cloning.

## 3.2 Map the Repo and Starter

Source signal:
- `3.2--build-vs-code-overview`

Action items:
- Add a `Know these 7 things` accordion for `app`, `api`, `components`, `convex`, `.env`, `AGENTS.md`, and `package.json`.
- Add a simple repo map card instead of making the student reconstruct the file tree from transcript text.
- Add a `GitHub ready` check.
- Add a small `What does this folder do?` capture field only if we want lightweight comprehension.
- Add a warning card that `.env` values are secrets.

## 3.3 Provider Setup

Source signal:
- `3.12--provider-setup`
- `3.8--env-vars-provider-setup`

Action items:
- Add a `Provider setup` accordion with separate cards for `Stripe`, `Convex`, `Clerk`, `Resend`, and `React Email`.
- Add a `Development vs production` explainer card.
- Add a checklist for `Create account`, `Create project/app`, `Copy keys`, `Paste into env.local`, `Paste into env.production`, `Verify`.
- Add prompt cards for:
  - create Stripe product
  - connect Convex project
  - connect Clerk
  - connect Resend
  - wire React Email templates
- Add a `JWT template / provider handshake` warning card for the provider pairings that must talk to each other.
- Add a `Test user setup` card and explicitly call out when QA automation requires a setting change.

## 3.4 Wire DB, Auth, and Payments

Source signal:
- `3.5--how-clerk-works`
- `3.12--provider-setup`

Action items:
- Add a `Marketing pages vs protected pages` tab set.
- Add an `Authentication vs authorization` explainer card.
- Add a `How protected pages work` copy-prompt card for Codex.
- Add a `Payments wiring` checklist for `product`, `price`, `secret key`, `publishable key`, and `post-purchase flow`.
- Add a `What should be public vs gated?` textarea.

## 3.5 Codex Marketing Site

Implemented in-app as workbench `codex_marketing_site` (lesson `3.5`): dependencies + pinned CEO artifacts, readonly prompt template with copy, structured brief, tabbed landing copy sections, optional style URL, workflow/git checklist, command snippets, plan-mode alert, optional advanced accordion.

Source signal (historical):
- `3.13--codex-marketing-site`
- `3.4--build-day-2-overview`

## 3.6 Switch to Sandbox and Boot Local

Source signal:
- `3.11--build-day-2-clone-template`
- `3.8--env-vars-provider-setup`

Action items:
- Add a `Local / development / production` explainer.
- Add a `Boot local` checklist that ends with `run the server`.
- Add a `Which tabs should be open right now?` checklist for `Convex`, `Clerk`, `Stripe`, and the repo.
- Add a `Sandbox means safe testing` warning card so students stop confusing it with production.

## 3.7 Read and Execute AI Plans

Source signal:
- `3.6--plan-mode`
- `3.15--build-core-ux-plan-flow`

**Implemented (workbench `fresh_template_plan`):** Goal `Card` + tool `Badge`s (`Codex`, `Convex`, `Next.js`); plan-first `Alert`; `Tabs` (`Plan mode` / `Manual plan`); prefilled manual planning `Textarea`; `ToggleGroup` reasoning (`Medium` / `High` / `Extra high`) with one-line hints; optional reference path `Input`; stack `Checkbox`es (`Convex`, `Next.js`, `Clerk`, `Stripe`) plus optional “other” `Input`; copy-assembled-prompt `Button`; macOS pathname `Accordion` (`Option` → Copy as Pathname); optional Codex plan paste `Textarea`. Lesson copy tightened in [`features/course/lesson/content/build.ts`](features/course/lesson/content/build.ts).

Historical action notes (superseded by the above product spec):
- Clarifying-questions / explicit “approve plan” fields were not carried into the shipped screen; approval stays in the agent thread.

## 3.8 Build Setting Up Slices

Source signal:
- `3.14--build-setting-up-slices`

Action items:
- Add a `What is a slice?` explainer card.
- Add a `Present UX -> get slices -> pick one -> build -> test -> loop` visual.
- Add a `Chosen slice` field.
- Add a `Why this slice first` field.
- Add a `Reference UX` upload or screenshot slot for whiteboard / Figma / paper sketch input.

## 3.9 Implement the First Slice

Product intent (current): **brand starter kit** before build—name, Figma export, favicons, hex colors, Stripe branding, domain—implemented as `brand_kit_workbench` with resource buttons, brand inputs, naming textarea, artifact checklist, preview, required outputs, alerts, and reference accordion.

Source signal (historical notes):
- Branding + first-asset pass from the Build video track

Action items (shipped direction):
- Resource `Card` with external tool links (Figma boards, Stripe branding, favicon.io, coolors.co, Cloudflare).
- `Brand inputs` + naming `Textarea` + required artifact `checklist` + optional icon/wordmark uploads + live preview + `Accordion` quick refs + dual `Alert`s + required outputs list with `Badge`s.

## 3.10 Build Core UX Plan Flow

Source signal:
- `3.15--build-core-ux-plan-flow`

Shipped: **`core_ux_plan_flow` workbench** in [`features/course/lesson/workbench/modes/core-ux-plan-flow/`](features/course/lesson/workbench/modes/core-ux-plan-flow/) — commands `Card` (`Shift+Tab` + fallback prompt with copy), `Tabs` (Instructor example vs Your version), instructor `Accordion` + disabled `Select`s with transcript-aligned rationale, student `Input`/`Textarea` fields, plan structure + services `Badge` cards + whiteboard note, single trust `Alert`, compact approved snapshot + `Accordion` for full plan brief, required workflow `checklist`. Lesson config: [`features/course/lesson/content/build.ts`](features/course/lesson/content/build.ts) (`id: "3.10"`).

## 3.11 Core UX Build

Source signal:
- `3.16--core-ux-build`

**Implemented (workbench `core_ux_build`):** BYO-AI first-use onboarding—prerequisite + blocking alerts, three-item onboarding checklist with live ChatGPT connection row (Settings link + Convex status), Tabs for Strategy (copyable prompt, Open ChatGPT, “no strategy yet” accordion), Brand (named Ship starter template card + GitHub link / Mission gate + `reference_gallery` brand shots), Source (blog `url` + post-mimic `image_upload`), workflow preview badges (Ideas / Posts), Codex handoff card (one photo of five screens + brief) with brief `textarea` and handoff checklist.

Historical brainstorm (superseded):
- ~~Current build target card, QA after build, drift alert~~ → replaced by onboarding + source + handoff spec above.

## 3.12 Core UX Build 3

Source signal:
- `3.17--core-ux-build3`

**Implemented (workbench `checkout_qa_loop`):** Fresh-account checkout QA loop—goal card, Tabs (Prompt / Issues / Resources), preflight checklist, editable copyable QA prompt (QA skill + Playwright + Stripe test card), Fresh vs Existing `ToggleGroup`, status row (QA browser badge + step + last issue), transcript issue log + steer-the-agent card, README / Clerk / Stripe resource buttons, Alerts (purchase-first UX, stale pricing, not-launch scope). Lesson copy in [`features/course/lesson/content/build.ts`](features/course/lesson/content/build.ts) aligned to QA—not a generic “third UX pass.”

Historical brainstorm (superseded):
- ~~Third pass tighten / rough-better / debug-ready cards~~ → replaced by QA-loop spec above.

## 3.13 Debug and Stabilize Without Spiraling

Source signal:
- current transcript mapping is still messy, but the lesson intent is clear

Action items:
- Add a `Bug loop` card: reproduce, inspect, ask Codex, verify, commit.
- Add a `QA Browser` prompt card.
- Add a `Do not open five new fronts` alert.
- Add a `Current blocker` textarea.
- Add a `Fixed / not fixed / needs later` triage checklist.

## 3.14 Wrapping

Source signal:
- `3.18--wrapping`

Action items:
- Add a `Deployment prerequisites` checklist for `Cloudflare`, `Stripe prod keys`, `Clerk prod keys`, and `Vercel`.
- Add a `What token / key do I need right now?` card.
- Add a `Deploy with Vercel skill` prompt card.
- Add a `Production sync` reminder for Stripe products and prices.
- Add a `Also set up email` checklist item for `Resend + React Email`.

## 3.15 Create Production Instance

Source signal:
- `3.19--create-production-instance`

Action items:
- Add a tiny `Clone development instance` checklist for `Clerk` and `Stripe`.
- Add a `Production instance created` confirmation state.
- Add a warning to never assume production exists just because development works.

## 3.16 Finalize Build Handoff and Unlock Ship

Source signal:
- `3.18--wrapping`
- overall Build-to-Ship transition

Action items:
- Add a `Build handoff` summary card with:
  - current live URL
  - stack used
  - keys/providers connected
  - known rough edges
- Add a `Ship blockers left` textarea.
- Add a `Hand this to your favorite LLM` export block that summarizes the build state.
- Add a `Next up in Ship` checklist.

## Extra tool breakdown to add

- `Resend`
  - what it is: transactional email provider
  - what to show: signup link, API key location, test-send checklist, production key reminder
- `React Email`
  - what it is: component system for email templates
  - what to show: where templates live, how to preview them, when to use them with Resend
- `Cloudflare`
  - what it is: domain / DNS control
  - what to show: token permissions needed and where to create them
- `Vercel`
  - what it is: deployment target
  - what to show: project connect, redeploy flow, live URL
