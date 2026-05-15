import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";

const CODEBASE_FIELD_CHARACTER_BUDGETS: Partial<
	Record<CanonicalProjectFactKey, number>
> = {
	product_summary: 140,
	problem_statement: 280,
	outcome_statement: 280,
	success_looks_like: 240,
	core_flow_summary: 320,
	section_narrative: 600,
	creative_spec: 320,
	done_when: 200,
	visual_thesis: 280,
	interaction_thesis: 280,
};

export function getCodebaseFieldCharacterBudget(
	fieldKey: CanonicalProjectFactKey,
): number | null {
	return CODEBASE_FIELD_CHARACTER_BUDGETS[fieldKey] ?? null;
}
