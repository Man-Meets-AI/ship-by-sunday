# Build Screen Value Audit

## Current product constraint

- Build lessons are currently authored as watch-only lessons via [`createVideoLesson`](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/video-lesson-factory.ts), which hardcodes `shell: "watch"` and `workbench: "external_workspace"`.
- Watch lessons do not render the workbench at all. The page only shows the video, transcript, copy-prompt cards, and resource links in [`LessonShellWatch`](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/shells/index.tsx).
- Some processed filenames no longer line up 1:1 with current lesson-page titles or media mappings, so this audit uses the processed video stem whenever the page mapping is still ambiguous.
- That means Build pages can only gain value today through:
  - better transcript attachments
  - better resource links
  - better copy-prompt cards
  - richer watch-shell sections
- If we want real inputs, progress capture, or builder outputs on Build pages, we need either:
  - a richer watch-shell layout, or
  - Build lessons moved off `shell: "watch"` onto an actual workbench surface

## Shadcn-only component palette available now

- `Card`
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Tabs`
- `Accordion`
- `Alert`
- `Badge`
- `Separator`
- `ToggleGroup`

## Recommended implementation path

### Phase 1: improve value without changing lesson shell type

Use the existing watch shell and add:

- promoted setup cards above the transcript
- lesson-specific resource blocks instead of one generic resources dump
- copy-prompt cards wherever the transcript clearly implies “paste this into Codex / Cursor / your LLM”
- short checklists and warnings inline in the main lesson body

This is the fastest path and can ship incrementally.

This path is also compatible with the current lesson factory:

- richer `coachResources`
- stronger `checklist`
- stronger `actionCard`
- stronger `intro`
- transcript attachments per lesson

### Phase 2: move the core Build lessons onto a real workbench

For the highest-value Build lessons, switch off `shell: "watch"` so the page can collect outputs instead of acting like a passive video page.

Best candidates:

- `3.0` Build Kickoff
- the repo/setup lessons
- the provider/env lessons
- the Codex / plan-mode lessons
- the slice-planning lesson
- the final handoff lesson

That unlocks:

- `Input` and `Textarea` fields
- completion-state tracking
- exportable outputs the student can feed back into an LLM
- better “job now / come back with” behavior than a passive watch page can support

## Global rules already visible from the transcripts

- If the speaker says “the links are somewhere around here,” that content should not live in a generic collapsed resources list. Promote it into the main lesson body.
- If the speaker names files, folders, services, or commands, give the student a compact on-screen cheat sheet so they do not need to scrub the transcript.
- If the speaker is teaching the student how to talk to AI, the page should end with a reusable prompt, instruction draft, or structured output field.
- If the lesson is primarily orientation, keep the UI lightweight. One focused glossary or checklist is better than a giant panel dump.
- Build lessons should produce small artifacts that can be pasted into Codex / Cursor / ChatGPT, not just passive completion states.

## Existing assets we should surface harder

- Starter repo URL already exists in [`config/product.ts`](/Users/parkerrex/Projects/manmeetsai-workspace/config/product.ts).
- Core templates PDF already exists in [`config/product.ts`](/Users/parkerrex/Projects/manmeetsai-workspace/config/product.ts).
- Student packet PDF already exists in [`config/product.ts`](/Users/parkerrex/Projects/manmeetsai-workspace/config/product.ts).
- The existing Build kickoff prompt infrastructure already exists in [`research-prompt.ts`](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/research-prompt.ts).

Implication:

- A good portion of the missing Build-screen value is not blocked on inventing new systems. It is blocked on surfacing existing assets at the moment the transcript says they matter.

## First changes to make

1. Upgrade `3.0` from a passive watch page into a real kickoff surface with account readiness, template/manual path selection, and a first AI instruction output.
2. Add a compact repo anatomy guide to the page currently backed by `3.2--build-vs-code-overview`.
3. Add a plan-request builder to the page currently backed by `3.6--plan-mode`.
4. Promote starter repo / guide / provider links into the primary lesson body instead of leaving them implied by transcript copy.
5. Stop using generic watch-page copy for Build lessons once we know the concrete support each transcript is asking for.

## Lesson notes

### 3.0 Build Kickoff

Transcript file:
- [`3.0--build-overview.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.0--build-overview/3.0--build-overview.txt)

What the video actually mentions:
- The builder needs an IDE, explicitly `Visual Studio Code` or `Cursor`.
- The builder needs `Codex`.
- The builder needs accounts for `Clerk`, `Convex`, and `Stripe`.
- There are supposed to be links “somewhere around here.”
- There is a starter template.
- There is also a “30 page guide” for doing the setup manually.
- The user mainly needs enough orientation so they know what to tell the AI.

What to add to the screen:
- `Card` + `Checkbox` account readiness block for `VS Code/Cursor`, `Codex`, `Clerk`, `Convex`, and `Stripe`.
- `Tabs` for `Template path` vs `Manual path`.
- `Button` links for starter repo, Clerk, Convex, Stripe, and the manual guide PDF.
- `Accordion` for the “12 things to know” orientation concept from the transcript.
- `Textarea` labeled `What I need the AI to do first` so the student leaves with a usable kickoff prompt or plain-language instruction.
- `Alert` for the rule that the user should know enough of the lay of the land to keep AI from fumbling.

What to remove or compress:
- Remove the generic “watch and keep moving” framing from the page once the above structure exists.
- Do not bury critical setup links in the generic resources section. They need to be promoted into the main lesson body.

Output the student should leave with:
- IDE selected
- required accounts confirmed
- chosen path (`template` or `manual`)
- first AI instruction drafted

### 3.2 build-vs-code-overview

Transcript file:
- [`3.2--build-vs-code-overview.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.2--build-vs-code-overview/3.2--build-vs-code-overview.txt)

What the video actually mentions:
- The builder needs a GitHub account.
- The lesson explains the file explorer and how the codebase is laid out.
- It explicitly calls out `app`, `api`, `components`, `convex`, `.env`, `AGENTS.md`, and `package.json`.
- The speaker says you do not need to memorize everything, but it helps to know the names and rough jobs of these files and folders.

What to add to the screen:
- `Accordion` titled `Know these 7 things` with one item each for `app`, `api`, `components`, `convex`, `.env`, `AGENTS.md`, and `package.json`.
- `Card` with a one-screen repo map so the student can orient without scrubbing the video.
- `Button` link for GitHub account creation / verification if the student has not done it yet.
- `Alert` explaining that `.env` is where service secrets live and should never be pasted into random chats or committed.
- `Card` called `Command hub` that pulls the most relevant package commands into human language.
- `Textarea` called `What I think each folder does` only if we want lightweight comprehension capture.

What to remove or compress:
- Do not make the student read a full transcript just to recover the repo anatomy.
- Do not over-explain every folder in the app shell. Keep the repo map to the folders and files explicitly named in the transcript.

Output the student should leave with:
- GitHub account confirmed
- a clear mental model of the repo surface area
- enough context to tell Codex where to look

### 3.6 plan-mode

Transcript file:
- [`3.6--plan-mode.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.6--plan-mode/3.6--plan-mode.txt)

What the video actually mentions:
- The student can ask Codex for a plan before coding.
- There is a useful distinction between full plan mode and a manual back-and-forth plan.
- A strong pattern is: `don't start coding yet, just come up with a plan; once we discuss and I like it, we can move forward`.
- The instructor explicitly uses reasoning levels (`medium`, `high`, `extra high`) depending on speed vs correctness.
- The student can reference another codebase by copying its path on their computer and asking Codex to analyze it.
- Prompt formatting perfection is not the point.

What to add to the screen:
- `Tabs` for `Plan mode` vs `Manual plan`.
- `Textarea` prefilled with a build-plan prompt template the student can copy and edit.
- `ToggleGroup` for `Medium`, `High`, and `Extra high` with one-line guidance for when to use each.
- `Input` for `Reference codebase path` so the student leaves with the exact value they intend to attach to the next prompt.
- `Alert` that says: ask for a plan first, approve it second, code third.
- `Card` showing one concrete example prompt instead of generic advice.

What to remove or compress:
- Remove any implication that prompts need precious formatting work.
- Do not make this page a passive motivational video. It should end with a usable plan request.

Output the student should leave with:
- a plan request prompt
- chosen reasoning level
- optional reference codebase path
- a decision on whether to use plan mode or manual back-and-forth

### 3.3 build-codex

Transcript file:
- [`3.3--build-codex.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.3--build-codex/3.3--build-codex.txt)

What the video actually mentions:
- The real build move is a sharp one-shot grounded in prior research, scope, and design work.
- The instructor references the user, problem, pain, frequency, in/out scope, research links, and prior breakthrough moments as the real ingredients.
- The student should read Codex output enough to sharpen later prompts.
- If Codex asks the student to do something, the student should first ask whether Codex can do it itself.
- Screenshots are used as inputs when asking for polish.
- “Use the skill” is treated like hiring a specialized teammate.
- The explicit CTA is: stop watching and go do it now.

What to add to the screen:
- `Textarea` for the one-shot build request.
- `Card` summarizing the minimum ingredients before prompting: user, problem, in-scope slice, out-of-scope guardrails, and any research links.
- `Alert` with the rule: if AI asks you to do something, ask if it can do it itself first.
- `Textarea` or `Input` for research/reference links mentioned in the prompt.
- `Textarea` for `What still feels off after the first pass?` so the student can write the next targeted follow-up prompt.
- `Card` for `Polish loop` explaining the screenshot -> critique -> apply loop.
- `Accordion` or `Tabs` for common skill types like design critique and polish.

What to remove or compress:
- Remove any vague “just trust the process” copy. This lesson needs an actionable prompting surface.
- Do not let the page end without a strong CTA to pause and prompt.

Output the student should leave with:
- a first build prompt
- any reference links they want Codex to consider
- a follow-up polish request
- screenshots or notes for the next iteration loop

### 3.4 build-day-2-overview

Transcript file:
- [`3.4--build-day-2-overview.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.4--build-day-2-overview/3.4--build-day-2-overview.txt)

What the video actually mentions:
- This is an overview of what remains in Build and what comes next in Ship.
- It previews marketing site work, protected pages, Stripe, Convex, Clerk, docs/tools, logo, open graph, SEO, Vercel, domain, email support, logs, and sending to friends.
- It explicitly says some things are out of scope, like iOS apps and complex APIs.

What to add to the screen:
- `Accordion` or grouped `Card` roadmap for `Still to do in Build` and `Coming in Ship`.
- `Checkbox` checklist for the concrete services: Stripe, Convex, Clerk, Vercel, domain, support email, logs.
- `Alert` for `Out of scope` so the student stops worrying about iOS apps and complex API work.
- `Card` explaining `protected pages` in plain language.
- `Button` links for Convex, Clerk, Stripe, and Vercel.
- `Textarea` for `What is still blocking me before Ship?`

What to remove or compress:
- This page should not pretend to be a hands-on build lesson.
- Compress the transcript into a roadmap/checklist format instead of leaving it as a long explanatory watch page.

Output the student should leave with:
- a clear build remainder checklist
- a clear ship-prep checklist
- an explicit list of what is not being built

### 3.5 how-clerk-works

Transcript file:
- [`3.5--how-clerk-works.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.5--how-clerk-works/3.5--how-clerk-works.txt)

What the video actually mentions:
- The lesson explains the difference between the marketing site and protected product pages.
- It teaches authentication vs authorization in plain language.
- It explains how routes/pages map to folders and `page.tsx` files in the `app` directory.
- It shows how to ask Codex simple questions about the codebase instead of manually tracing everything.
- It shows renaming and pinning useful Codex threads so the student can come back to them later.

What to add to the screen:
- `Tabs` for `Marketing site` vs `Protected pages`.
- `Card` that explains authentication vs authorization in one clean example.
- `Accordion` showing the named route folders from the transcript.
- `Textarea` prefilled with a codebase-explainer prompt like `Explain how protected pages work in simple terms`.
- `Alert` that says the student does not need to read every file manually; they can ask Codex targeted questions.
- `Card` for `Good thread hygiene` with rename/pin guidance.

What to remove or compress:
- Do not frame this as only a Clerk lesson. The actual value is route protection, page structure, and how to interrogate the codebase.
- Compress the page/folder explanation into a visual route map instead of a long transcript block.

Output the student should leave with:
- a clear mental model of public vs protected pages
- one reusable codebase-explainer prompt
- a named/pinned Codex thread they can return to later

### 3.9 github

Transcript file:
- [`3.9--github.txt`](/Volumes/2TB%20SSD%20Video/Movies/Ship%20by%20Sunday%20Raw%20Footage/Transcripts/Processed/3.9--github/3.9--github.txt)

What the video actually mentions:
- `Command + J` opens the terminal inside Codex.
- The student can check for Git with `git --version` or ask the agent whether Git is installed.
- The student can clone the starter template by copying the repository URL from GitHub.
- After cloning, the student should ask the agent to start a fresh repository from the template.
- The lesson explains repository history, commits, and why this later connects to Vercel.
- The explicit guidance is: do not do command-line setup manually if the AI can do it.

What to add to the screen:
- `Card` called `Terminal basics` with `Command + J`, `git --version`, and one-line plain-English definitions.
- `Input` for `Starter repo URL`.
- `Textarea` or copy-prompt card for `Clone this repository into my current folder and reset it as my own repo`.
- `Alert` that says: if the command line step can be done by the agent, ask the agent first.
- `Accordion` glossary for `terminal`, `repository`, `commit`, and `version history`.
- `Card` showing the `GitHub -> local repo -> Vercel` relationship.

What to remove or compress:
- Do not force the student to infer the setup flow from transcript text.
- Keep the Git explanation lightweight; only the pieces that unblock cloning and ownership matter here.

Output the student should leave with:
- starter repo URL copied
- local clone completed or ready to run
- a clean repo-reset prompt
- confidence around the tiny bit of Git they actually need
