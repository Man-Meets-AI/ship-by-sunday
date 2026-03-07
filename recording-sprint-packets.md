# Ship by Sunday Recording Sprint Packets

Last updated: 2026-03-07

## Goal

Turn the existing recording guide into a practical recording sprint the founder can execute without overthinking.

This document is for first-pass recording only. The priority is forward motion, clean lesson coverage, visible artifacts, and a manageable pickup list. Do not optimize for polish during the first pass.

## Source Materials

- `assets/ship_by_sunday_recording_guide_detailed.pdf`
- `assets/ship_by_sunday_curriculum_and_sherpa_scripts_printable.pdf`
- `assets/ship_by_sunday_instructor_packet_v2.pdf`
- `assets/ship_by_sunday_student_packet_v2.pdf`
- `assets/ship_by_sunday_worksheets.pdf`

## Recording Rules

- Every lesson must follow the same rhythm: frame it, show it, command it, pause it, return.
- Every lesson must end in an action and a visible artifact.
- Stay calm, direct, and slightly demanding.
- Keep philosophy short. Show the rep on screen.
- Ugly is acceptable. Empty is not.
- If a lesson gets muddy, go back to the worksheet or artifact.
- Do not stop the sprint for minor perfection issues. Log them for pickups.

## Default Teaching Stack

Use the same default stack across Build and Ship so the student experience stays coherent:

- Frontend: `Next.js + Tailwind`
- Data/auth: `Supabase` or hardcoded data if needed to keep momentum
- Deployment: `Vercel`
- Design: `Figma`
- Prompting method: brief-driven, one screen at a time

## Sprint Shape

Recommended format: 4 recording sessions plus 1 pickup pass.

- Session 0: prep and file setup
- Session 1: Overview + CEO Block
- Session 2: Design Block
- Session 3: Build Block
- Session 4: Ship Block + final close
- Session 5: pickups only

This keeps founder energy focused and prevents Build from swallowing the whole sprint.

## Lesson Order

### Overview

- `0.1` Welcome to Ship by Sunday
- `0.2` How the Sprint Works

### CEO Block

- `1.1` Start With the Problem
- `1.2` Pick One User
- `1.3` Define the Outcome
- `1.4` Light Research, Not a Thesis
- `1.5` Map the Core Flow
- `1.6` Kill Scope
- `1.7` CEO Block Wrap-Up

### Design Block

- `2.1` Find References First
- `2.2` Sketch Before Software
- `2.3` Storyboard the Journey
- `2.4` Figma Basics for Speed
- `2.5` Turn Sketches Into Rough Screens
- `2.6` Choose a Visual Direction
- `2.7` Design Block Wrap-Up

### Build Block

- `3.1` Build From the Brief
- `3.2` Set Up the Environment
- `3.3` Brief the Agent Correctly
- `3.4` Build the Core Flow
- `3.5` Debug Without Spiraling
- `3.6` Build Block Wrap-Up

### Ship Block

- `4.1` Ship the Core, Not the Fantasy
- `4.2` Deploy the App
- `4.3` Record a Simple Demo
- `4.4` Send It to Real Humans
- `4.5` Capture Feedback and Plan Version Two
- `4.6` Final Wrap

## Session 0: Prep Packet

### Recording objective

Remove all preventable friction before the founder sits down to teach.

### Tasks

- Create the recording folder structure
- Prepare all worksheets and templates on disk
- Open the canonical example files for demos
- Confirm on-camera setup, mic, screen share, and lighting
- Prepare the visual assets used in Overview

### Needed assets

- Staircase graphic / 4-block roadmap
- All four worksheets plus Friday Prep Sheet
- Quick preview files for the four final artifacts
- Demo app or canonical example build
- Recording scene preset

### Folder structure

```text
ship-by-sunday-recordings/
  00-overview/
  01-ceo-block/
  02-design-block/
  03-build-block/
  04-ship-block/
  99-pickups/
```

### Prep checklist

- [ ] mic tested
- [ ] camera framed
- [ ] screen share clean
- [ ] notifications off
- [ ] worksheets open
- [ ] example files open
- [ ] browser tabs prepared
- [ ] Figma file prepared
- [ ] starter repo prepared
- [ ] deployment account ready

## Session 1: Overview + CEO Block

### Recording objective

Install the behavior of the sprint, then lock problem, user, outcome, and scope.

### Lessons to record today

- `0.1` Welcome to Ship by Sunday
- `0.2` How the Sprint Works
- `1.1` Start With the Problem
- `1.2` Pick One User
- `1.3` Define the Outcome
- `1.4` Light Research, Not a Thesis
- `1.5` Map the Core Flow
- `1.6` Kill Scope
- `1.7` CEO Block Wrap-Up

### Estimated teaching runtime

`~50-63 min` plus resets and retakes

Plan for a `90-120 min` recording block.

### Needed assets

- 4-block staircase / roadmap visual
- Friday Prep Sheet
- Worksheet 01: One-Page Product Brief
- Weak idea vs strong problem examples
- User statement examples
- Outcome statement examples
- Quick research note grid
- Core flow map example
- Scope-cut / Sunday Test example

### Talking points

- This is not passive content. It only works if the student does the reps.
- One user beats a broad market.
- Strong products start with pain, not novelty.
- If the flow cannot be explained in 5 to 7 steps, the idea is still muddy.
- Scope protection is the point of this block.

### Screen-share plan

- Show the full sprint path and all worksheets in `0.1` and `0.2`
- Fill Worksheet 01 live during CEO lessons
- Demonstrate one weak problem rewritten into a stronger one
- Demonstrate one blurry user statement tightened into one actual user
- Show one feature-heavy promise rewritten into an outcome
- Show a fast research pass on 2 to 3 references
- Draw one simple flow map live
- Cut at least three features live during scope reduction

### Pickup risks

- Intro runs too long or becomes backstory
- User examples stay too abstract
- Research lesson drifts into strategy lecture
- Scope-cut lesson feels vague instead of concrete

## Session 2: Design Block

### Recording objective

Turn the brief into enough structure and visual direction to build cleanly.

### Lessons to record today

- `2.1` Find References First
- `2.2` Sketch Before Software
- `2.3` Storyboard the Journey
- `2.4` Figma Basics for Speed
- `2.5` Turn Sketches Into Rough Screens
- `2.6` Choose a Visual Direction
- `2.7` Design Block Wrap-Up

### Estimated teaching runtime

`~45-59 min`

Plan for a `75-105 min` recording block.

### Needed assets

- Worksheet 02: Build-Ready Design Spec
- 2 to 3 references for the canonical example app
- Paper sketch or tablet sketch setup
- Storyboard example
- Figma file with starter frame
- Hotkey notes for the exact moves taught
- Rough screen example before and after cleanup
- Simple visual direction examples

### Talking points

- Do not start from a blank screen in code.
- Borrow patterns users already understand.
- The goal is not beautiful design. The goal is buildable direction.
- Reduce ambiguity before code starts.
- One main flow matters more than lots of optional flows.

### Screen-share plan

- Show quick reference gathering and pattern capture
- Sketch one short flow on paper or tablet
- Convert the sketch into a storyboard
- Demonstrate only the Figma moves needed for this sprint
- Turn rough sketches into rough screens live
- Pick one visual direction without spiraling on aesthetics
- Fill Worksheet 02 on screen as decisions are made

### Pickup risks

- Figma lesson becomes a tool tour instead of a sprint lesson
- Visual direction section gets too taste-based
- Storyboard lesson does not stay tied to the core flow

## Session 3: Build Block

### Recording objective

Show the student how to move from brief to local working app without chaos.

### Lessons to record today

- `3.1` Build From the Brief
- `3.2` Set Up the Environment
- `3.3` Brief the Agent Correctly
- `3.4` Build the Core Flow
- `3.5` Debug Without Spiraling
- `3.6` Build Block Wrap-Up

### Estimated teaching runtime

`~44-57 min`

Plan for a `90-120 min` recording block.

### Needed assets

- Worksheet 03: Build Plan + Agent Brief
- Canonical example build brief
- Starter repo
- Local environment already tested
- Agent brief template
- One-screen-at-a-time build checklist
- Debugging examples with one broken state and one fix path

### Talking points

- Build from the brief, not from vibes.
- One screen. One step. One definition of done.
- Standardization is a feature.
- Prompting quality is downstream from brief quality.
- Debugging should protect momentum, not trigger a rewrite spiral.

### Screen-share plan

- Show the brief and how it drives the build order
- Walk through environment setup cleanly
- Build the agent brief live from Worksheet 03
- Demonstrate one screen at a time, not the whole app in one jump
- Show one bug-fix loop with a clear stop condition
- Show a local app demo before closing the block

### Pickup risks

- Environment setup breaks on screen
- Agent brief is too generic
- Core-flow build demo gets too ambitious
- Debugging section becomes a rabbit hole

## Session 4: Ship Block

### Recording objective

Get the app live, get the demo recorded, and make the first sends feel normal instead of dramatic.

### Lessons to record today

- `4.1` Ship the Core, Not the Fantasy
- `4.2` Deploy the App
- `4.3` Record a Simple Demo
- `4.4` Send It to Real Humans
- `4.5` Capture Feedback and Plan Version Two
- `4.6` Final Wrap

### Estimated teaching runtime

`~33-44 min`

Plan for a `60-90 min` recording block.

### Needed assets

- Worksheet 04: Launch Plan + Feedback Tracker
- Deployment account and tested project
- Simple demo script
- First-send script for early feedback
- Feedback tracker template
- Live URL from the canonical example

### Talking points

- Shipping the core is the win condition, not finishing the full fantasy.
- The URL is the milestone.
- Students do not need a perfect launch. They need one real rep.
- Fear of sending is normal. Reduce it with a small target and exact script.
- Closing the loop matters more than polishing forever.

### Screen-share plan

- Show a scope cut before deployment if needed
- Walk through deployment to a live URL
- Record a simple demo clip or walkthrough
- Show the exact first-send message
- Fill the feedback tracker live with example entries
- Close on identity: they are now people who can ship

### Pickup risks

- Deployment friction causes dead air
- Demo section feels vague instead of repeatable
- First-send lesson sounds motivational instead of practical
- Final wrap turns into generic congratulations

## Session 5: Pickups Packet

### Objective

Resolve only the issues that materially improve clarity, actionability, or trust.

### Do pickups for

- Broken explanation
- Missing artifact instruction
- Missing or unclear pause prompt
- Broken screen-share sequence
- Audio issue on a critical lesson
- A demo that materially fails to illustrate the lesson

### Do not do pickups for

- Minor wording preference
- Cosmetic polish only
- Small pacing irritation unless it hurts understanding
- Tiny on-camera imperfections

### Pickup tracker

| Lesson | Problem | Severity | Fix needed | Owner | Done |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

## Daily Progress Tracker

| Session | Scope | Planned runtime | Actual runtime | Status | Pickup count |
| --- | --- | --- | --- | --- | --- |
| 0 | Prep | 45-60 min |  | Not started |  |
| 1 | Overview + CEO | 90-120 min |  | Not started |  |
| 2 | Design | 75-105 min |  | Not started |  |
| 3 | Build | 90-120 min |  | Not started |  |
| 4 | Ship | 60-90 min |  | Not started |  |
| 5 | Pickups | 45-90 min |  | Not started |  |

## Founder Notes To Reuse On Camera

- `Do not just watch this. Pause it and do it.`
- `Ugly and finished beats elegant and imaginary.`
- `Do not be clever. Follow the sequence.`
- `One user beats a blurry market.`
- `The URL is the milestone.`
- `You are not trying to master everything here. You are trying to finish one full rep.`

## Immediate Next Step

Before recording starts, convert each session above into a literal production checklist with:

- recording date
- lesson filenames
- tabs/files to open before pressing record
- worksheet file to display
- example app state required

That is the final pre-recording artifact the founder should use live.
