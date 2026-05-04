import type { CanonicalProjectFactKey } from "./canonical-project-definition/project-definition";
import type { CanonicalProjectFactsDraft } from "./canonical-project-definition/project-definition";
import { deriveCodebaseFacts } from "./canonical-project-definition/derived-codebase-facts";
import type {
	CodebaseStageDefinition,
	CodebaseStepDefinition,
} from "./stages/stage-definitions";

const legacyProblemSeverityMap = {
	low: "3",
	medium: "5",
	high: "8",
} as const;

const problemUrgencyValues = [
	"Can schedule",
	"Needs attention soon",
	"Needs action now",
] as const;

const arrayFieldKeys = new Set<CanonicalProjectFactKey>([
	"core_flow",
	"screen_sequence",
	"must_have_capabilities",
	"scope_in",
	"scope_out",
	"non_goals",
	"design_references",
	"brand_assets",
	"objections",
	"marketing_goals",
	"channel_scope",
	"campaign_types",
	"approved_claims",
	"do_not_say_rules",
	"workflow_map",
	"research_scope",
	"research_needs",
	"content_workflows",
	"analytics_needs",
	"proof_sources",
	"constraints",
	"deliverables",
	"acceptance_criteria",
	"validation_plan",
	"risks",
	"dependencies",
	"open_questions",
]);

const longTextFieldKeys = new Set<CanonicalProjectFactKey>([
	"product_summary",
	"problem_statement",
	"outcome_statement",
	"success_looks_like",
	"user_benefit",
	"evidence_summary",
	"why_this_matters",
	"core_flow_summary",
	"v1_rationale",
	"visual_thesis",
	"content_plan",
	"interaction_thesis",
	"design_tokens",
	"brand_voice_summary",
	"creative_spec",
	"objective",
	"user_visible_outcome",
	"done_when",
	"demo_flow",
	"selected_next_slice",
]);

const numberFieldKeys = new Set<CanonicalProjectFactKey>([
	"price_usd_cents",
	"pricing",
]);

export const problemSeverityScaleValues = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;

export type CodebaseFieldPromptKind =
	| "text"
	| "number"
	| "list"
	| "long_text"
	| "scale";

export type CodebaseStepDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type CodebaseStepSavePayload = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type CodebaseFieldDraftValues = CodebaseStepDraftValues;
export type CodebaseFieldSavePayload = CodebaseStepSavePayload;

export function isCodebaseArrayField(fieldKey: CanonicalProjectFactKey) {
	return arrayFieldKeys.has(fieldKey);
}

export function isCodebaseLongTextField(fieldKey: CanonicalProjectFactKey) {
	return longTextFieldKeys.has(fieldKey);
}

export function isCodebaseNumericField(fieldKey: CanonicalProjectFactKey) {
	return numberFieldKeys.has(fieldKey);
}

const scaleFieldKeys = new Set<CanonicalProjectFactKey>([
	"problem_severity",
	"problem_urgency",
	"pricing_model",
]);

export function codebaseFieldPromptKind(
	fieldKey: CanonicalProjectFactKey,
): CodebaseFieldPromptKind {
	if (scaleFieldKeys.has(fieldKey)) {
		return "scale";
	}
	if (isCodebaseNumericField(fieldKey)) {
		return "number";
	}
	if (isCodebaseArrayField(fieldKey)) {
		return "list";
	}
	if (isCodebaseLongTextField(fieldKey)) {
		return "long_text";
	}
	return "text";
}

export function normalizeProblemSeverityValue(value: string | undefined) {
	if (!value) {
		return "";
	}

	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return "";
	}

	if (
		problemSeverityScaleValues.includes(
			trimmedValue as (typeof problemSeverityScaleValues)[number],
		)
	) {
		return trimmedValue;
	}

	const normalizedValue = trimmedValue.toLowerCase();
	if (normalizedValue in legacyProblemSeverityMap) {
		return legacyProblemSeverityMap[
			normalizedValue as keyof typeof legacyProblemSeverityMap
		];
	}

	const parsedScaleNumber = normalizedValue.match(/\b10\b|\b[1-9]\b/)?.[0];
	if (
		parsedScaleNumber &&
		problemSeverityScaleValues.includes(
			parsedScaleNumber as (typeof problemSeverityScaleValues)[number],
		)
	) {
		return parsedScaleNumber;
	}

	return "";
}

export function normalizeProblemUrgencyValue(value: string | undefined) {
	if (!value) {
		return "";
	}

	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return "";
	}

	if (
		problemUrgencyValues.includes(
			trimmedValue as (typeof problemUrgencyValues)[number],
		)
	) {
		return trimmedValue;
	}

	const normalizedValue = trimmedValue.toLowerCase();
	if (
		normalizedValue.includes("urgent") ||
		normalizedValue.includes("today") ||
		normalizedValue.includes("now") ||
		normalizedValue.includes("asap") ||
		normalizedValue.includes("block")
	) {
		return "Needs action now";
	}

	if (
		normalizedValue.includes("week") ||
		normalizedValue.includes("soon") ||
		normalizedValue.includes("month") ||
		normalizedValue.includes("plan")
	) {
		return "Needs attention soon";
	}

	return "Can schedule";
}

export function formatCodebaseFactValue(
	facts: CanonicalProjectFactsDraft,
	fieldKey: CanonicalProjectFactKey,
) {
	const normalizedFacts = deriveCodebaseFacts(facts);
	const value =
		fieldKey === "surface_type"
			? (normalizedFacts.surface_type ?? "web_app")
			: normalizedFacts[fieldKey];

	if (Array.isArray(value)) {
		return value.join("\n");
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (fieldKey === "problem_severity") {
		return normalizeProblemSeverityValue(value);
	}
	if (fieldKey === "problem_urgency") {
		return normalizeProblemUrgencyValue(value);
	}
	return value ?? "";
}

export function buildStepDraftValues(
	facts: CanonicalProjectFactsDraft,
	step: CodebaseStepDefinition,
) {
	return Object.fromEntries(
		step.fieldKeys.map((fieldKey) => [
			fieldKey,
			formatCodebaseFactValue(facts, fieldKey),
		]),
	) as Record<CanonicalProjectFactKey, string>;
}

export function buildStageDraftValues(
	facts: CanonicalProjectFactsDraft,
	stage: CodebaseStageDefinition,
) {
	return Object.fromEntries(
		stage.steps.map((step) => [step.id, buildStepDraftValues(facts, step)]),
	) as Record<string, Record<CanonicalProjectFactKey, string>>;
}

export function buildSavePayload(
	step: CodebaseStepDefinition,
	draftValues: Record<string, string>,
): CodebaseStepSavePayload {
	const factsPatch: Record<string, string | number | string[]> = {};
	const clearedFieldKeys: string[] = [];

	for (const fieldKey of step.fieldKeys) {
		const rawValue = (draftValues[fieldKey] ?? "").trim();
		if (!rawValue) {
			clearedFieldKeys.push(fieldKey);
			continue;
		}

		if (isCodebaseNumericField(fieldKey)) {
			factsPatch[fieldKey] = Number(rawValue);
			continue;
		}

		if (isCodebaseArrayField(fieldKey)) {
			factsPatch[fieldKey] = rawValue
				.split("\n")
				.map((value) => value.trim())
				.filter(Boolean);
			continue;
		}

		if (fieldKey === "problem_severity") {
			factsPatch[fieldKey] = normalizeProblemSeverityValue(rawValue);
			continue;
		}
		if (fieldKey === "problem_urgency") {
			factsPatch[fieldKey] = normalizeProblemUrgencyValue(rawValue);
			continue;
		}

		factsPatch[fieldKey] = rawValue;
	}

	return {
		clearedFieldKeys,
		factsPatch,
	};
}
