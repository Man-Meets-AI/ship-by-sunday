# Launch Message Kit Example

- **Doc type:** custom marketing-blueprint example
- **Workflow:** homepage and launch-message support
- **Status:** example
- **Baseline source:** `docs/openai/openai-marketing-kit/`

## Goal

Turn stable product facts into a reviewable launch message kit for the homepage, launch email, and supporting social posts without inventing claims or drifting from the product.

## Inputs

### Stable knowledge

- `product_name`
- `product_summary`
- `primary_user`
- `problem_statement`
- `outcome_statement`
- `brand_voice_summary`
- `approved_claims`
- `do_not_say_rules`
- `buyer_ai_promise`

### Fresh inputs

- current launch timing
- current price or offer status
- channel-specific constraints

## In scope

- homepage narrative support
- launch email outline
- social message variations
- internal review notes for marketing outputs

## Out of scope

- unverified claims about customer results
- auto-publishing external content
- adding new positioning not supported by blueprint facts
- changing product scope through messaging

## Output contract

- one homepage message hierarchy
- one launch email outline
- 3-5 social variants
- review notes naming claims used and claims withheld

## Review rules

- all external-facing copy requires human review
- any current fact must be re-verified before publish
- anything outside `approved_claims` is treated as out of scope
