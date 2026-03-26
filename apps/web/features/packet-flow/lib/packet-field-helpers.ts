import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
	PacketStageDefinition,
	PacketStepDefinition,
} from "@manmeetsai/packet-compiler";

const arrayFieldKeys = new Set<CanonicalProjectFactKey>([
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

const numberFieldKeys = new Set<CanonicalProjectFactKey>(["price_usd_cents"]);

export type PacketFieldInputKind = "input" | "number" | "textarea";

export function packetFieldLabel(fieldKey: string) {
	return fieldKey
		.split("_")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

export function packetFieldInputKind(
	fieldKey: CanonicalProjectFactKey,
): PacketFieldInputKind {
	if (numberFieldKeys.has(fieldKey)) {
		return "number";
	}
	if (arrayFieldKeys.has(fieldKey) || longTextFieldKeys.has(fieldKey)) {
		return "textarea";
	}
	return "input";
}

export function formatPacketFactValue(
	facts: CanonicalProjectFactsDraft,
	fieldKey: CanonicalProjectFactKey,
) {
	const value =
		fieldKey === "surface_type"
			? (facts.surface_type ?? "web_app")
			: facts[fieldKey];

	if (Array.isArray(value)) {
		return value.join("\n");
	}
	if (typeof value === "number") {
		return String(value);
	}
	return value ?? "";
}

export function buildStepDraftValues(
	facts: CanonicalProjectFactsDraft,
	step: PacketStepDefinition,
) {
	return Object.fromEntries(
		step.fieldKeys.map((fieldKey) => [
			fieldKey,
			formatPacketFactValue(facts, fieldKey),
		]),
	) as Record<CanonicalProjectFactKey, string>;
}

export function buildStageDraftValues(
	facts: CanonicalProjectFactsDraft,
	stage: PacketStageDefinition,
) {
	return Object.fromEntries(
		stage.steps.map((step) => [step.id, buildStepDraftValues(facts, step)]),
	) as Record<string, Record<CanonicalProjectFactKey, string>>;
}

export function buildSavePayload(
	step: PacketStepDefinition,
	draftValues: Record<string, string>,
) {
	const factsPatch: Record<string, string | number | string[]> = {};
	const clearedFieldKeys: string[] = [];

	for (const fieldKey of step.fieldKeys) {
		const rawValue = (draftValues[fieldKey] ?? "").trim();
		if (!rawValue) {
			clearedFieldKeys.push(fieldKey);
			continue;
		}

		if (numberFieldKeys.has(fieldKey)) {
			factsPatch[fieldKey] = Number(rawValue);
			continue;
		}

		if (arrayFieldKeys.has(fieldKey)) {
			factsPatch[fieldKey] = rawValue
				.split("\n")
				.map((value) => value.trim())
				.filter(Boolean);
			continue;
		}

		factsPatch[fieldKey] = rawValue;
	}

	return {
		clearedFieldKeys,
		factsPatch,
	};
}
