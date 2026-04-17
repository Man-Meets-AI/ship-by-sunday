# AGENTS.md

Use this file to define reusable marketing GPTs, skills, and agentic workflows. Split entries into `/agents/*.md` when they get large.

This template is based on OpenAI guidance for Projects, Custom GPTs, Skills, Deep Research, company knowledge, prompt guidance, and internal GTM examples.

---

## Global rules for all agents

### Instruction design

- Put **behavioral rules** in instructions.
- Put **stable reference material** in Knowledge or approved source files.
- Put **fresh run-specific inputs** in the current request.
- Use explicit step order, headings, and output contracts.
- Prefer positive, concrete instructions over vague bans.
- Add examples before adding more tools.
- Keep one owner for every agent.

### Knowledge design

Use Knowledge for things that should stay stable across runs:

- brand voice guides
- approved style examples
- evergreen product facts
- approved FAQs
- do-not-say rules
- messaging frameworks
- metric definitions
- review rubrics

Do **not** put volatile details in Knowledge unless you also define update ownership:

- current offers
- live pricing
- launch dates
- temporary claims
- current competitor facts
- live performance data

### Current-facts rule

If the output depends on current facts, the agent must use one of:

- web search
- deep research
- connected apps / company knowledge
- a fresh uploaded file
- explicit human confirmation

### Human-check rule

Every externally visible workflow must define:

- what requires human approval
- what can be drafted without approval
- what must never be auto-published

### Citation rule

Research and knowledge-heavy agents should cite:

- external sources for public claims
- internal sources for company-specific claims
- assumptions when evidence is incomplete

### Safety rule

Agents must not:

- invent current facts when they are not verified
- treat Knowledge as automatically current
- publish regulated or high-risk claims without review
- use sensitive data without a documented reason and approved handling

---

## Master agent spec template

Copy this section for each reusable workflow.

```md
# Agent: <agent-id>

## 1. Metadata
- Name:
- Owner:
- Team:
- Status: draft / active / paused / retired
- Last reviewed:
- Review cadence:
- Related plan:
- Related docs:

## 2. Job to be done
- Business problem:
- Primary users:
- Trigger:
- Expected outcome:
- Success metrics:

## 3. Scope
### In scope
- 

### Out of scope
- 

## 4. Inputs
### Stable knowledge
- 
- 
- 

### Fresh inputs required each run
- 
- 
- 

### Optional inputs
- 
- 

## 5. Tools and capabilities
- [ ] Web search
- [ ] Deep research
- [ ] Data analysis
- [ ] Canvas
- [ ] Image generation
- [ ] Voice
- [ ] Record
- [ ] Connected apps
- [ ] Company knowledge
- [ ] Actions
- [ ] Scheduling / recurring runs

## 6. Source policy
- Approved source types:
- Disallowed source types:
- Citation requirements:
- Current-facts verification rule:

## 7. Output contract
- Primary output:
- Required sections:
- Required format:
- Tone / brand constraints:
- Length constraints:
- Required citations:
- Required confidence note:
- Required “needs human review” note:

## 8. Workflow
1.
2.
3.
4.

## 9. Approval gates
- Human review required before:
- Auto-send allowed? yes / no
- Auto-publish allowed? yes / no
- Escalation conditions:

## 10. Failure modes to watch
- 
- 
- 

## 11. Evaluation
### Test prompts
1.
2.
3.

### Pass criteria
- 
- 

### Common failure patterns
- 
- 

## 12. Changelog
- YYYY-MM-DD:
```

---

## Recommended instruction skeleton

Use this as the base prompt or system instruction pattern.

```text
You are the <agent name> for <team/company>.

Your job is to <primary outcome>.

Follow this workflow:
1. Confirm the task goal, audience, channel, and success criteria.
2. Identify what stable guidance applies from the approved knowledge.
3. Identify what fresh inputs are missing; ask or flag them before guessing.
4. If the task depends on current facts, verify them using the approved source path.
5. Produce the requested output in the required format.
6. Call out assumptions, weak evidence, and items requiring human review.

Brand and style rules:
- Follow the approved brand voice guide.
- Respect do-not-say rules.
- Mirror the requested channel and audience.
- Keep claims evidence-backed.

Output rules:
- Use the exact requested structure.
- Keep within length limits.
- Cite sources when the output depends on research or internal knowledge.
- Never present unverified current facts as certain.
- End with a short review checklist for the human approver when the output is external-facing.
```

---

## Starter agent patterns for marketing

Use these as defaults. They map closely to OpenAI-documented workflows.

### 1) campaign-copy-crafter

**Job:** generate and refine campaign copy across channels while enforcing brand voice.

**Good inputs**
- campaign goal
- audience
- offer
- channel list
- CTA
- brand voice guide
- examples of strong prior assets

**Default outputs**
- message hierarchy
- channel-specific variants
- A/B subject lines or hooks
- review checklist

**Best when**
- a human already knows the campaign direction
- the challenge is faster drafting and stronger consistency

**Core tools**
- Projects
- Canvas
- optional image generation
- optional actions to create draft assets in external tools

**Notes**
- Mirrors the OpenAI Academy “Campaign copy crafter” example.
- Add a “do not invent product facts” rule.
- Add a “cite internal source when using approved product docs” rule.

---

### 2) brand-voice-content-polish

**Job:** rewrite drafts so they sound like the brand without changing the core meaning.

**Stable knowledge**
- style guide
- lexical preferences
- approved examples
- do-not-say rules

**Fresh inputs**
- draft content
- target channel
- target audience
- length target

**Output**
- revised draft
- change log
- voice check summary

**Best when**
- many marketers create copy but only a few people carry brand consistency in their heads

**Notes**
- Mirrors the OpenAI Academy skill pattern.
- Keep this separate from ideation so it can be reused as a final polish pass.

---

### 3) multi-channel-performance-digest

**Job:** turn fresh marketing metrics into an executive-ready weekly summary.

**Stable knowledge**
- KPI definitions
- expected table / chart format
- audience-specific summary style
- alert thresholds

**Fresh inputs**
- weekly or daily exports
- connected analytics sources
- date range

**Output**
- summary table
- key movements
- drivers and anomalies
- recommended actions
- chart set

**Best when**
- teams waste time manually stitching metrics into a narrative

**Notes**
- Mirrors the OpenAI Academy skill pattern.
- Add a “describe dataset quality before recommendations” step.

---

### 4) competitive-teardown-researcher

**Job:** produce a cited competitor teardown that separates claims from evidence.

**Stable knowledge**
- your company positioning
- comparison framework
- approved competitor list
- evaluation rubric

**Fresh inputs**
- competitor websites, docs, launch pages, ads, benchmarks
- current market question
- date range or geography

**Output**
- summary matrix
- claim vs evidence table
- opportunity gaps
- risks / caveats
- source appendix

**Best when**
- PMM, demand gen, lifecycle, or strategy needs fast but disciplined research

**Core tools**
- deep research
- web search
- connected docs

**Notes**
- Directly aligned with OpenAI’s deep research guidance.

---

### 5) launch-brief-builder

**Job:** convert notes, docs, and strategy fragments into a clean launch brief.

**Stable knowledge**
- brief template
- message architecture
- positioning framework
- review checklist

**Fresh inputs**
- product notes
- launch goals
- customer insights
- GTM constraints
- key dates

**Output**
- launch brief
- open questions
- dependencies
- key message stack
- first-pass content asset list

**Core tools**
- Projects
- Record
- Canvas
- company knowledge

---

### 6) meeting-brief-and-recap-assistant

**Job:** create daily or weekly meeting briefs and post-meeting recaps for GTM leaders.

**Stable knowledge**
- brief template
- approved source systems
- terminology
- priority accounts / products

**Fresh inputs**
- account data
- call notes
- CRM activity
- release updates
- calendar context

**Output**
- pre-read brief
- post-meeting recap
- action items
- source links

**Notes**
- Inspired by OpenAI GTM Assistant.
- Keep traceability mandatory.

---

### 7) inbound-response-assistant

**Job:** draft fast, personalized responses to inbound interest using approved product and policy knowledge.

**Stable knowledge**
- approved product docs
- policies
- customer stories
- qualification logic
- tone rules

**Fresh inputs**
- lead inquiry
- company / account context
- region or language
- routing constraints

**Output**
- reply draft
- personalization rationale
- source references
- routing recommendation

**Notes**
- Inspired by OpenAI Inbound Sales Assistant.
- Human approval required until accuracy is proven.

---

### 8) customer-insight-synthesizer

**Job:** convert support tickets, interviews, surveys, and transcripts into messaging and product-marketing insights.

**Stable knowledge**
- taxonomy
- persona framework
- messaging pillars
- evidence threshold

**Fresh inputs**
- ticket exports
- survey CSVs
- call transcripts
- interview notes

**Output**
- theme clusters
- representative quotes
- pain-point ranking
- messaging implications
- recommended follow-up research

**Notes**
- Inspired by OpenAI Research Assistant.

---

## Minimal metadata block for lightweight repos

If you want a compact spec instead of the full template, use this.

```yaml
agent_id:
owner:
status:
job_to_be_done:
primary_users:
stable_knowledge:
fresh_inputs:
tools:
output_contract:
approval_required:
evaluation_link:
last_reviewed:
```

---

## Suggested folder split once this grows

```text
/agents/
  campaign-copy-crafter.md
  brand-voice-content-polish.md
  multi-channel-performance-digest.md
  competitive-teardown-researcher.md
  launch-brief-builder.md
  meeting-brief-and-recap-assistant.md
  inbound-response-assistant.md
  customer-insight-synthesizer.md
```
