# Ship by Sunday Build Rules

## Canonical rules

- Build work must trace back to stable codebase facts.
- `scope_in`, `scope_out`, and `non_goals` are mandatory for non-trivial work.
- Review-route and starter-snapshot impact must be explicit.
- Validation is part of the product output, not optional cleanup.
- Workflow state is not canonical product truth.

## Exception policy

- Any scope expansion must be recorded in the plan before implementation continues.
- If a milestone needs to violate a default rule, explain why the rule would block the correct outcome.
- If a validation step cannot run, log the reason in `docs/documentation.md`.

## Dated decisions

- **2026-03-27:** The Ship by Sunday build pack extends the vanilla long-horizon baseline and is the custom build codebase for this repo.
