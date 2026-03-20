export const CODEX_MARKETING_SITE_FIELD_IDS = {
	savedPrompt: "codex_marketing_saved_prompt",
	product: "codex_marketing_product",
	audience: "codex_marketing_audience",
	problem: "codex_marketing_problem",
	pain: "codex_marketing_pain",
	frequency: "codex_marketing_frequency",
	whyMatters: "codex_marketing_why_matters",
	outcome: "codex_marketing_outcome",
	capability: "codex_marketing_capability",
	copyEyebrow: "codex_marketing_copy_eyebrow",
	copySubheader: "codex_marketing_copy_subheader",
	copyPrimaryCta: "codex_marketing_copy_primary_cta",
	copySecondaryCta: "codex_marketing_copy_secondary_cta",
	copyPromise: "codex_marketing_copy_promise",
	copyHighlights: "codex_marketing_copy_highlights",
	copyFaq: "codex_marketing_copy_faq",
	styleReferenceUrl: "codex_marketing_style_reference_url",
	workflow: "codex_marketing_workflow",
} as const;

export const CODEX_MARKETING_BRIEF_FIELD_ORDER = [
	CODEX_MARKETING_SITE_FIELD_IDS.savedPrompt,
	CODEX_MARKETING_SITE_FIELD_IDS.product,
	CODEX_MARKETING_SITE_FIELD_IDS.audience,
	CODEX_MARKETING_SITE_FIELD_IDS.problem,
	CODEX_MARKETING_SITE_FIELD_IDS.pain,
	CODEX_MARKETING_SITE_FIELD_IDS.frequency,
	CODEX_MARKETING_SITE_FIELD_IDS.whyMatters,
	CODEX_MARKETING_SITE_FIELD_IDS.outcome,
	CODEX_MARKETING_SITE_FIELD_IDS.capability,
] as const;

export const CODEX_MARKETING_COPY_TAB_CONFIG = [
	{
		tabValue: "eyebrow",
		label: "Eyebrow",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copyEyebrow,
	},
	{
		tabValue: "subheader",
		label: "Subheader",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copySubheader,
	},
	{
		tabValue: "primary-cta",
		label: "Primary CTA",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copyPrimaryCta,
	},
	{
		tabValue: "secondary-cta",
		label: "Secondary CTA",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copySecondaryCta,
	},
	{
		tabValue: "promise",
		label: "Promise line",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copyPromise,
	},
	{
		tabValue: "highlights",
		label: "Highlights",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copyHighlights,
	},
	{
		tabValue: "faq",
		label: "FAQ / comparison",
		fieldId: CODEX_MARKETING_SITE_FIELD_IDS.copyFaq,
	},
] as const;

export const CODEX_MARKETING_WORKFLOW_CHECKLIST_OPTIONS = [
	"Pasted offer brief + prompt into ChatGPT (or your agent)",
	"Asked for a copy pass only—no plan mode, no automatic file edits",
	"Reviewed the pass and refined copy conversationally",
	"Made style tweaks (optional: used a reference site for fonts/colors)",
	"Committed marketing site changes locally",
	"Pushed changes to the remote",
] as const;

export const CODEX_MARKETING_COMMAND_SNIPPETS = [
	{
		id: "pass_only",
		label: "Ask for a pass",
		text: "don't write the changes, just come back with a pass",
	},
	{
		id: "commit",
		label: "Commit",
		text: "commit your changes",
	},
	{
		id: "push",
		label: "Push",
		text: "push your changes up",
	},
] as const;

/** Instructor template: copy into ChatGPT, then tailor with the student’s brief below. */
export const MARKETING_SITE_PROMPT_TEMPLATE = `You are a conversion-focused landing page copywriter for a solo builder shipping a v1.

I will paste a structured offer brief (product, audience, problem, pain, frequency, why it matters, outcome, product capability). Use it exactly—do not invent a different audience or problem.

Task:
1) Draft homepage-style copy for a marketing site (hero + supporting sections implied by the fields below).
2) Keep language concrete and specific to my product. No generic SaaS filler.
3) Output ONLY the following sections, with these exact headings:

## Eyebrow
## Subheader
## Primary CTA
## Secondary CTA
## Promise line
## Highlights
(bullets, max 5)
## FAQ / comparison notes
(short Q&A or “vs. alternatives” bullets—whatever fits my product)

Rules:
- Primary CTA should be one clear action (e.g. install, join waitlist, start trial).
- Secondary CTA should be lower commitment (e.g. view demo, read docs).
- Highlights should map to real capabilities from the brief, not buzzwords.

Wait for my brief in the next message.`;
