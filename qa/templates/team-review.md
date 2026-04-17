# QA Team Review

Date: {{date}}
Slug: {{slug}}
Base ref: {{base_ref}}
Local artifact: {{review_path}}
Review mode: {{review_mode}}
Environment: {{environment}}

## Request

Use this artifact for a material QA-team review of the feature diff against `{{base_ref}}`.

## Changed Files

{{changed_files}}

## Suggested QA Prompt

{{recommended_prompt}}

## Specialist Fan-out

Advisory specialists:

{{advisory_specialists}}

Execution specialists:

{{execution_specialists}}

Release summarizer:

{{release_summarizer_note}}

## Command-backed Evidence

{{command_evidence}}

## Affected Journeys

List the scenario IDs and explain why they are in scope in product language.

## Current Proof

List the tests, reports, or other QA evidence that already support the affected journeys.

## Missing Proof

List the gaps, stale evidence, or missing browser proof that still matter.

## Recommended Runs

List the smallest next validation steps worth running.

## Findings

Record real QA risks, regressions, or unclear behavior. Use severity labels when helpful.

## Release Confidence

Summarize whether this looks merge-safe, ship-safe, or blocked, and state what that judgment still depends on.
