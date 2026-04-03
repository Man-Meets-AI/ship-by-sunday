# documentation.md

Use this template for each shipped marketing workflow, GPT, Project, or agent. The goal is to make every implementation understandable, reviewable, and reusable.

---

## Full documentation template

```md
---
doc_id:
title:
owner:
team:
status: draft / active / paused / retired
created:
last_reviewed:
review_cadence:
related_plan:
related_agent:
tags: []
---

# <title>

## 1. Summary
What this workflow does, for whom, and why it exists.

## 2. Business context
- Problem being solved:
- Current workflow:
- Why AI is useful here:
- Expected business value:

## 3. Source basis
List the official OpenAI sources that informed this workflow.

- 
- 
- 

## 4. Users
- Primary user:
- Secondary users:
- Approver:
- SME:
- Technical owner:

## 5. Workflow type
- [ ] One-off prompt
- [ ] Shared Project
- [ ] GPT
- [ ] Skill
- [ ] Scheduled task
- [ ] Agent
- [ ] Connected-app workflow
- [ ] Data-analysis workflow
- [ ] Research workflow
- [ ] Content workflow

## 6. Inputs
### Stable knowledge
- 
- 
- 

### Fresh inputs per run
- 
- 
- 

### Connected systems / approved sources
- 
- 

## 7. Instructions / prompt contract
Paste the production prompt, system instruction, or workflow rules here.

```text
```

## 8. Output contract
- Primary output:
- Required sections:
- Formatting rules:
- Brand rules:
- Citation rules:
- Confidence / caveat rules:
- Human review note required? yes / no

## 9. Approval and publishing
- Who reviews:
- What requires review:
- What is allowed without review:
- Publish path:
- Rollback path:

## 10. Evaluation
### Test cases
1.
2.
3.

### Pass criteria
- 
- 

### Known failure patterns
- 
- 

## 11. Metrics
- Speed metric:
- Quality metric:
- Adoption metric:
- Business metric:

## 12. Risks and safeguards
- Current-facts risk:
- Brand risk:
- Data/privacy risk:
- Legal/policy risk:
- Prompt-injection / source-quality risk:
- Mitigations:

## 13. Example runs
### Input example
```text
```

### Output example
```text
```

## 14. Maintenance
- Update owner:
- How stable knowledge is refreshed:
- How often examples are re-baselined:
- Sunset criteria:

## 15. Changelog
- YYYY-MM-DD:
```

---

## Compact documentation template

Use this when the workflow is small.

```md
# <title>

- Owner:
- Status:
- Problem:
- Users:
- Stable knowledge:
- Fresh inputs:
- Output:
- Review required:
- Success metric:
- Risks:
- Sources:
- Last reviewed:
```

---

## Required minimum fields for every shipped workflow

Do not merge a workflow doc into the repo until these exist:

- owner
- problem statement
- stable knowledge
- fresh inputs
- output contract
- review rule
- source basis
- success metric
- last reviewed date

---

## Suggested folder structure for real implementations

```text
/docs/
  brand-voice-polish.md
  campaign-brief-generator.md
  competitor-content-analysis.md
  weekly-multi-channel-performance-digest.md
  shared-launch-project.md
  customer-insight-synthesizer.md
  inbound-response-assistant.md
```

---

## Suggested naming convention

Use clear, boring names over clever names.

Preferred pattern:

`<team>-<workflow>-<artifact>`

Examples:

- `marketing-brand-voice-polish-gpt`
- `growth-weekly-performance-digest`
- `pmm-competitive-teardown-research`
- `gtm-launch-brief-project`
- `sales-inbound-response-assistant`

---

## Review checklist for maintainers

- [ ] Is the workflow still needed?
- [ ] Are the approved sources still correct?
- [ ] Is brand guidance still current?
- [ ] Are current-fact steps explicit enough?
- [ ] Are evaluation prompts realistic?
- [ ] Are failure modes documented?
- [ ] Is the review owner still accurate?
- [ ] Is the changelog current?
