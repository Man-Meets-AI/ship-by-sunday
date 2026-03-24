# PLANS.md

Use this file to plan new marketing AI workflows before you build them. This template is designed to match OpenAI’s use-case discovery model, six primitives, and impact/effort prioritization framework.

---

## Planning principles

1. Start with the work, not the model.
2. Prefer high-impact, low-effort quick wins first.
3. Break workflows into discrete steps and map each step to one of the six primitives.
4. Separate stable knowledge from fresh inputs.
5. Define human approval and quality checks before launch.
6. Reassess plans quarterly as the tools improve.

---

## Impact / effort rubric

Use a simple 1–5 scale.

### Impact
- **1** = little visible business value
- **3** = useful but localized improvement
- **5** = major team, revenue, speed, or quality impact

### Effort
- **1** = one person can prototype quickly
- **3** = needs shared context, files, and basic process design
- **5** = cross-functional workflow, connected systems, and sustained review

### Suggested interpretation
- **High impact / low effort** → do now
- **Low effort / lower impact** → self-service or team utility
- **High impact / high effort** → scope carefully and build deliberately
- **Low impact / high effort** → defer

---

## Master plan template

```md
# Plan: <plan-id>

## 1. Summary
- Title:
- Owner:
- Team:
- Status: ideation / discovery / scoped / piloting / active / paused / retired
- Last updated:
- Related agents:
- Related docs:

## 2. Problem statement
- What problem are we solving?
- Why does it matter now?
- What is the current manual workflow?
- What is painful, slow, expensive, or inconsistent?

## 3. Users and stakeholders
- Primary users:
- Secondary users:
- Approvers:
- Subject matter experts:
- Technical owner:

## 4. Target outcome
- Desired business result:
- Quality target:
- Time saved target:
- Adoption target:
- Risk tolerance:

## 5. Workflow map
Break the workflow into discrete steps and tag each one with the OpenAI primitive.

| Step | Description | Primitive | Current owner | Candidate AI support |
|---|---|---|---|---|
| 1 |  | content creation / research / coding / data analysis / ideation-strategy / automation |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## 6. Candidate solution shape
- One-off prompt?
- Shared Project?
- GPT / skill?
- Scheduled task?
- Agentic workflow?
- Connected-app workflow?

## 7. Inputs
### Stable knowledge
- 
- 
- 

### Fresh inputs each run
- 
- 
- 

### Systems / apps involved
- 
- 

## 8. Output contract
- Primary deliverable:
- Required format:
- Required citations:
- Required human review:
- Publication path:

## 9. Impact / effort scoring
- Impact score:
- Effort score:
- Why:
- Decision: pursue / defer / self-service / escalate

## 10. Risks and guardrails
- Current-facts risk:
- Brand risk:
- Privacy risk:
- Legal / policy risk:
- Data-quality risk:
- Prompt-injection or bad-source risk:
- Review rule:

## 11. Evaluation plan
### Baseline
- What is the current manual baseline?
- How long does it take today?
- What quality metric exists today?

### Test method
- How will we test the workflow?
- What data or prompts will we use?
- What qualifies as a pass?

### Success metrics
- 
- 
- 

## 12. Rollout plan
### Phase 1: prototype
- 
- 

### Phase 2: pilot
- 
- 

### Phase 3: production
- 
- 

## 13. Review cadence
- Weekly:
- Monthly:
- Quarterly:

## 14. Changelog
- YYYY-MM-DD:
```

---

## Fast-start plan template for quick wins

Use this when the use case is simple and clearly low effort.

```md
# Quick Win Plan: <plan-id>

- Owner:
- Problem:
- Workflow:
- Stable knowledge:
- Fresh inputs:
- Output:
- Impact score:
- Effort score:
- Approval needed:
- Evaluation method:
- Next action:
```

---

## Recommended plan types for marketing teams

### 1) Content workflow plan
Use for:
- launch emails
- blog drafts
- social variants
- localization
- message polish

**Questions to answer**
- What brand constraints matter?
- What source material is approved?
- What must be human-reviewed?
- How do we measure “good” beyond speed?

---

### 2) Research workflow plan
Use for:
- competitor teardowns
- trend scans
- buyer research
- vendor evaluation
- market sizing support

**Questions to answer**
- What counts as an approved source?
- Do we need citations?
- What current-fact verification rule applies?
- How will we separate claims from evidence?

---

### 3) Analytics workflow plan
Use for:
- weekly channel summaries
- survey synthesis
- budget optimization
- lead forecasting
- churn review

**Questions to answer**
- Where do the fresh files come from?
- What metric definitions are stable?
- What chart/table format is expected?
- What data-quality checks must happen first?

---

### 4) Shared workspace / Project plan
Use for:
- major launches
- ongoing brand programs
- cross-functional GTM coordination
- recurring research streams

**Questions to answer**
- What files belong in the Project?
- What instructions should be project-wide?
- Who owns updates?
- What must stay outside the Project as fresh input?

---

### 5) Agentic workflow plan
Use for:
- recurring research scans
- meeting briefs and recaps
- internal Q&A grounded in approved docs
- lead-response support
- multi-step report generation

**Questions to answer**
- What actions can the agent take?
- What needs confirmation?
- What should recur on a schedule?
- What is the fallback when evidence is weak?

---

## Example plan starters

### A. Weekly multi-channel performance digest

```md
# Quick Win Plan: weekly-multi-channel-performance-digest

- Owner: Growth operations
- Problem: Too much analyst time is spent stitching weekly metrics into a narrative.
- Workflow: ingest fresh exports → check data quality → summarize key moves → create charts → recommend next actions
- Stable knowledge: KPI definitions, expected report template, alert thresholds
- Fresh inputs: current week exports, comparison window
- Output: 1-page summary + chart pack + action list
- Impact score: 4
- Effort score: 2
- Approval needed: manager review before distribution
- Evaluation method: compare prep time and usefulness vs current weekly report
- Next action: pilot on the next two reporting cycles
```

### B. Competitive teardown researcher

```md
# Quick Win Plan: competitive-teardown-researcher

- Owner: Product marketing
- Problem: Competitive analysis is slow, inconsistent, and poorly cited.
- Workflow: gather approved competitor set → run deep research → separate claims from evidence → summarize positioning gaps → produce source appendix
- Stable knowledge: comparison framework, current positioning, output template
- Fresh inputs: current competitors, date range, geography, launch question
- Output: cited teardown memo
- Impact score: 5
- Effort score: 3
- Approval needed: PMM lead review before broader sharing
- Evaluation method: compare completeness, citation quality, and time vs manual teardown
- Next action: test on one competitor cluster
```

---

## Prioritization queue section

Keep a living list here or move it to a spreadsheet later.

| Priority | Plan ID | Workflow | Impact | Effort | Owner | Status | Notes |
|---|---|---:|---:|---:|---|---|---|
| 1 | brand-voice-polish | Content polish | 4 | 1 |  |  |  |
| 2 | campaign-brief-generator | Planning | 4 | 2 |  |  |  |
| 3 | competitor-content-analysis | Research | 4 | 2 |  |  |  |
| 4 | weekly-performance-digest | Analytics | 4 | 2 |  |  |  |
| 5 | shared-launch-project | Collaboration | 5 | 3 |  |  |  |
| 6 | customer-insight-synthesizer | Research | 5 | 3 |  |  |  |
| 7 | inbound-response-assistant | GTM / sales assist | 5 | 4 |  |  |  |
| 8 | meeting-brief-recap | GTM coordination | 4 | 3 |  |  |  |

---

## Definition of “ready to build”

A plan is ready to move into implementation only when:

- the problem statement is concrete
- a human owner exists
- approved source inputs are named
- stable knowledge vs fresh inputs are separated
- output format is defined
- approval gates are defined
- evaluation criteria exist
- impact and effort were scored
