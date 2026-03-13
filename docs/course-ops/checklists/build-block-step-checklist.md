# Build Block v2 Guide Digest and Step Checklist

Last updated: 2026-03-13  
Source doc: https://docs.google.com/document/d/1XXPU4yBSRGWnQ84IC1grPVxH8qFBgjGt1UWMYkCIEOY/edit?tab=t.0

## What this is

This is the production checklist for Build Block v2. It maps Google doc notes into the live lesson sequence:

- `3.1` Lock Build Path and Scope
- `3.2` Map the Repo and Starter
- `3.3` Install MCPs and Skills
- `3.4` Wire DB, Auth, and Payments
- `3.5` Switch to Sandbox and Boot Local
- `3.6` Read and Execute AI Plans
- `3.7` Implement the First Slice
- `3.8` Build the Core UX End-to-End
- `3.9` Debug and Stabilize Without Spiraling
- `3.10` Finalize Build Handoff and Unlock Ship

Each step has a done condition, required evidence, and curated visual references.

## Build Block Checklist

| ID | Lesson | Step | Done when | Evidence to capture | Guide visuals |
| --- | --- | --- | --- | --- | --- |
| `B-3.1-01` | `3.1` | Choose template vs custom path. | Starting path is explicit. | Saved path choice. | `image1.png` |
| `B-3.1-02` | `3.1` | Define one first slice and done condition. | Scope is narrow and measurable. | First-slice + done note. | `image20.png` |
| `B-3.2-01` | `3.2` | Identify startup scripts and package manager. | Local run command is confirmed. | Repo orientation note. | `image20.png` |
| `B-3.2-02` | `3.2` | Identify key env files and entry routes. | Team can name where config and slice entrypoint live. | File map note. | `image15.png` |
| `B-3.3-01` | `3.3` | Install Figma MCP and Playwright MCP. | Both tools are callable. | Tool check output. | `image8.png` |
| `B-3.3-02` | `3.3` | Confirm provider skills for Convex, Clerk, and Stripe. | Provider guidance is accessible for prompts. | Skill availability note. | `image22.png` |
| `B-3.4-01` | `3.4` | Set env keys for provider stack. | Required keys are configured in local env. | Env checklist. | `image1.png` |
| `B-3.4-02` | `3.4` | Configure Clerk JWT template for Convex. | Template `convex` exists with correct issuer. | Dashboard verification note. | `image22.png` |
| `B-3.4-03` | `3.4` | Create Stripe objects and webhook path. | Product/price and webhook are wired. | Integration setup note. | `image20.png` |
| `B-3.5-01` | `3.5` | Switch Stripe flow to sandbox/test mode. | No live-charge path remains in testing flow. | Sandbox confirmation note. | `image14.png` |
| `B-3.5-02` | `3.5` | Regenerate webhook values in sandbox and boot local app. | Local baseline boots cleanly. | Local run output + URL screenshot. | `image16.png`, `image21.png` |
| `B-3.6-01` | `3.6` | Distill large AI plan output into execution phases. | Practical phased plan is written. | Execution phases note. | `image3.png` |
| `B-3.6-02` | `3.6` | Define risks and stop conditions before coding. | Anti-sprawl rules are explicit. | Execution rules note. | `image19.png` |
| `B-3.7-01` | `3.7` | Implement exactly one slice from the brief. | First slice is working locally. | Slice screenshot + shipped notes. | `image21.png` |
| `B-3.7-02` | `3.7` | Add only minimum support needed for slice. | No unnecessary architecture expansion. | Support delta note. | `image12.png` |
| `B-3.8-01` | `3.8` | Expand first slice to end-to-end core UX. | Core path works from start to finish locally. | Core path walkthrough evidence. | `image12.png` |
| `B-3.8-02` | `3.8` | Defer polish and non-critical extras. | Deferred list is explicit. | Deferred items note. | `image18.png` |
| `B-3.9-01` | `3.9` | Log blockers with reproducible evidence. | Each blocker has one reproducible entry. | Blocker log with evidence links. | `image10.png`, `image2.png` |
| `B-3.9-02` | `3.9` | Run blocker loop: plan -> implement -> browser test. | Blockers resolved or deferred with rationale. | Updated blocker statuses. | `image4.png`, `image5.png` |
| `B-3.10-01` | `3.10` | Assemble factual handoff for Ship. | Build summary reflects current truth. | `build_summary` artifact. | `image3.png` |
| `B-3.10-02` | `3.10` | List unresolved constraints before Ship unlock. | Deferred scope and risk are explicit. | Handoff constraints section. | `image19.png` |

## Troubleshooting Fast Path

| Issue | Immediate action | Evidence | Visual |
| --- | --- | --- | --- |
| Stale app/session | Stop services, restart services, rerun baseline route. | Fresh run log and timestamped rerun. | `image7.png` |
| Paid access not unlocking | Re-check webhook delivery, entitlement mapping, and provider linkage. | Before/after event trail. | `image17.png`, `image6.png` |
| Login still failing | Re-check auth config, issuer, and environment key alignment. | Auth error before/after fix. | `image13.png` |

## Image Inventory (Build Section)

Runtime image source:

- `public/course/build-guide-images/image1.png` through `public/course/build-guide-images/image22.png`

Canonical archive source:

- `assets/course/build-guide-images/image1.png` through `assets/course/build-guide-images/image22.png`
