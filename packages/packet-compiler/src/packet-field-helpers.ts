import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "./canonical-project-definition/project-definition";
import type {
	PacketStageDefinition,
	PacketStageId,
	PacketStepDefinition,
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

export type PacketFieldPromptKind =
	| "text"
	| "number"
	| "list"
	| "long_text"
	| "scale";

export type PacketFieldScaleOption = {
	value: string;
	label: string;
	ariaLabel: string;
};

export type PacketFieldScaleDefinition = {
	leftLabel: string;
	centerLabel?: string;
	rightLabel: string;
	options: readonly PacketFieldScaleOption[];
};

type PacketFieldPresentation = {
	label: string | ((facts: CanonicalProjectFactsDraft) => string);
	helperText?: string | ((facts: CanonicalProjectFactsDraft) => string);
};

export type PacketFieldInputKind = "input" | "number" | "textarea";

export type PacketStepDraftValues = Partial<
	Record<CanonicalProjectFactKey, string>
>;

export type PacketStepSavePayload = {
	clearedFieldKeys: string[];
	factsPatch: Record<string, string | number | string[]>;
};

export type PacketFieldDraftValues = PacketStepDraftValues;
export type PacketFieldSavePayload = PacketStepSavePayload;

export function isPacketArrayField(fieldKey: CanonicalProjectFactKey) {
	return arrayFieldKeys.has(fieldKey);
}

export function isPacketLongTextField(fieldKey: CanonicalProjectFactKey) {
	return longTextFieldKeys.has(fieldKey);
}

export function isPacketNumericField(fieldKey: CanonicalProjectFactKey) {
	return numberFieldKeys.has(fieldKey);
}

const packetFieldScaleDefinitions: Partial<
	Record<CanonicalProjectFactKey, PacketFieldScaleDefinition>
> = {
	problem_severity: {
		leftLabel: "Minor annoyance",
		centerLabel: "Real friction",
		rightLabel: "Critical blocker",
		options: problemSeverityScaleValues.map((value) => ({
			value,
			label: value,
			ariaLabel: `Pain ${value} out of 10`,
		})),
	},
	problem_urgency: {
		leftLabel: "Can wait",
		centerLabel: "Needs planning",
		rightLabel: "Immediate",
		options: [
			{
				value: problemUrgencyValues[0],
				label: "Can schedule",
				ariaLabel: "Urgency can schedule",
			},
			{
				value: problemUrgencyValues[1],
				label: "Needs attention soon",
				ariaLabel: "Urgency needs attention soon",
			},
			{
				value: problemUrgencyValues[2],
				label: "Needs action now",
				ariaLabel: "Urgency needs action now",
			},
		],
	},
};

const packetFieldPresentations: Partial<
	Record<CanonicalProjectFactKey, PacketFieldPresentation>
> = {
	product_name: {
		label: "What's the name?",
		helperText: "Use the name you'd actually call this in public.",
	},
	product_summary: {
		label: "What's the one-liner?",
		helperText: "Describe the thing in one sentence.",
	},
	primary_user: {
		label: "Who wants this? Who benefits from this?",
		helperText: "Name the person who most wants the outcome.",
	},
	why_this_matters: {
		label: "Why does this person want this?",
		helperText: "What makes this worth solving for them?",
	},
	problem_statement: {
		label: (facts) =>
			facts.product_name?.trim()
				? `What does ${facts.product_name.trim()} solve?`
				: "What does this solve?",
		helperText: "Name the problem in plain language.",
	},
	problem_context_when: {
		label: "When does this problem show up?",
	},
	problem_context_where: {
		label: "Where does this problem show up?",
		helperText: "Be detailed about the environment, workflow, or situation.",
	},
	problem_trigger: {
		label: "What is happening when this problem hits?",
		helperText:
			"Describe where this person is and what is happening when they run into the problem you want to solve.",
	},
	problem_severity: {
		label: "How bad is this problem?",
	},
	problem_urgency: {
		label: "How urgent is this problem?",
	},
	outcome_statement: {
		label: "What is the ideal outcome for the person buying this?",
	},
	success_looks_like: {
		label: "What does winning look like for the person who wants your thing?",
	},
	user_benefit: {
		label: "What's the biggest benefit of someone buying your thing?",
	},
	evidence_summary: {
		label: "What would people point to to say your thing helped them win?",
	},
	core_flow_summary: {
		label: "What are the steps they take with your thing to win?",
		helperText: "List the steps in order.",
	},
	scope_in: {
		label: "What absolutely has to get built?",
		helperText:
			"List the features or pieces that must exist for the user to get the win. One per line.",
	},
	scope_out: {
		label: "What can we cut if we had to?",
		helperText:
			"What could we remove and still help the user win? One per line.",
	},
	non_goals: {
		label: "What are we explicitly not building?",
	},
	v1_rationale: {
		label: "Why is this enough for the user to win?",
	},
	screen_sequence: {
		label: "What screens would people see, in order?",
		helperText: "Number the screens in sequence.",
	},
	must_have_capabilities: {
		label: "What capabilities have to exist on those screens?",
		helperText: "One per line.",
	},
	surface_type: {
		label: "What are you building on?",
	},
	design_references: {
		label: "What should this feel like?",
		helperText: "Drop links or references, one per line.",
	},
	brand_assets: {
		label: "What brand assets do you already have?",
		helperText: "List files, links, or assets you want used.",
	},
	existing_system_mode: {
		label: "Are we starting fresh or extending something?",
	},
	visual_thesis: {
		label: "What should this look and feel like?",
	},
	content_plan: {
		label: "What content needs to show up?",
	},
	interaction_thesis: {
		label: "How should it behave?",
	},
	hero_goal: {
		label: "What should the hero do?",
	},
	primary_cta: {
		label: "What is the primary CTA?",
	},
	proof_strategy: {
		label: "How will we prove this is real?",
	},
	objections: {
		label: "What objections do we need to answer?",
		helperText: "One per line.",
	},
	section_narrative: {
		label: "What story should the page tell, section by section?",
	},
	copy_tone: {
		label: "What tone should the copy have?",
	},
	design_tokens: {
		label: "What visual rules should guide the UI?",
	},
	typography_direction: {
		label: "What should the type feel like?",
	},
	imagery_direction: {
		label: "What should the imagery feel like?",
	},
	layout_direction: {
		label: "How should the layout feel?",
	},
	marketing_goals: {
		label: "What does marketing need to achieve?",
	},
	channel_scope: {
		label: "Which channels matter right now?",
	},
	campaign_types: {
		label: "What kinds of campaigns are we running?",
	},
	brand_voice_summary: {
		label: "How should this sound?",
	},
	approved_claims: {
		label: "What are we allowed to say?",
	},
	do_not_say_rules: {
		label: "What should we never say?",
	},
	proof_sources: {
		label: "What proof can we use?",
	},
	workflow_map: {
		label: "What recurring marketing workflows do we need?",
	},
	research_scope: {
		label: "What do we need to research?",
	},
	research_needs: {
		label: "What inputs do we need for that research?",
	},
	content_workflows: {
		label: "What content workflows need to exist?",
	},
	analytics_needs: {
		label: "What do we need to measure?",
	},
	creative_spec: {
		label: "What should the creative include?",
	},
	objective: {
		label: "What are we actually building?",
	},
	user_visible_outcome: {
		label: "What outcome will the user see?",
	},
	distribution_model: {
		label: "How is this delivered?",
	},
	install_destination: {
		label: "Where does it get installed or used?",
	},
	buyer_ai_promise: {
		label: "What AI promise are we making to the buyer?",
	},
	pricing_model: {
		label: "How are we pricing this?",
	},
	price_usd_cents: {
		label: "What is the actual numeric price?",
	},
	price_display: {
		label: "How should the price appear to the buyer?",
	},
	currency: {
		label: "What currency is this in?",
	},
	domain: {
		label: "What domain should this live on?",
	},
	support_email: {
		label: "What support email should people use?",
	},
	constraints: {
		label: "What constraints do we have to work within?",
	},
	deliverables: {
		label: "What needs to ship?",
	},
	risks: {
		label: "What could go wrong?",
	},
	dependencies: {
		label: "What do we depend on?",
	},
	open_questions: {
		label: "What don't we know yet?",
	},
	selected_next_slice: {
		label: "What's the next slice to build?",
	},
	done_when: {
		label: "When is this done?",
	},
	acceptance_criteria: {
		label: "What has to be true for this to count as done?",
	},
	validation_plan: {
		label: "How will we validate it?",
	},
	demo_flow: {
		label: "What demo flow proves it works?",
	},
};

const packetStepLabelOverrides: Partial<
	Record<`${PacketStageId}/${string}`, string>
> = {
	"product/scope": "What absolutely has to get built",
};

export function getPacketFieldScaleDefinition(
	fieldKey: CanonicalProjectFactKey,
) {
	return packetFieldScaleDefinitions[fieldKey] ?? null;
}

function resolvePacketPresentationCopy(
	value:
		| PacketFieldPresentation["label"]
		| PacketFieldPresentation["helperText"],
	facts: CanonicalProjectFactsDraft,
) {
	if (!value) {
		return null;
	}
	return typeof value === "function" ? value(facts) : value;
}

export function getPacketStepLabel(stageId: PacketStageId, stepId: string) {
	return packetStepLabelOverrides[`${stageId}/${stepId}`] ?? null;
}

export function packetFieldLabel(
	fieldKey: CanonicalProjectFactKey | string,
	facts: CanonicalProjectFactsDraft = {},
) {
	if (fieldKey in packetFieldPresentations) {
		const presentation =
			packetFieldPresentations[fieldKey as CanonicalProjectFactKey];
		const label = resolvePacketPresentationCopy(presentation?.label, facts);
		if (label) {
			return label;
		}
	}

	return fieldKey
		.split("_")
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

export function packetFieldHelperText(
	fieldKey: CanonicalProjectFactKey,
	facts: CanonicalProjectFactsDraft = {},
) {
	const presentation = packetFieldPresentations[fieldKey];
	return resolvePacketPresentationCopy(presentation?.helperText, facts);
}

export function packetFieldPromptKind(
	fieldKey: CanonicalProjectFactKey,
): PacketFieldPromptKind {
	if (getPacketFieldScaleDefinition(fieldKey)) {
		return "scale";
	}
	if (isPacketNumericField(fieldKey)) {
		return "number";
	}
	if (isPacketArrayField(fieldKey)) {
		return "list";
	}
	if (isPacketLongTextField(fieldKey)) {
		return "long_text";
	}
	return "text";
}

export function packetFieldInputKind(
	fieldKey: CanonicalProjectFactKey,
): PacketFieldInputKind {
	const promptKind = packetFieldPromptKind(fieldKey);

	if (promptKind === "number") {
		return "number";
	}
	if (promptKind === "list" || promptKind === "long_text") {
		return "textarea";
	}
	return "input";
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
): PacketStepSavePayload {
	const factsPatch: Record<string, string | number | string[]> = {};
	const clearedFieldKeys: string[] = [];

	for (const fieldKey of step.fieldKeys) {
		const rawValue = (draftValues[fieldKey] ?? "").trim();
		if (!rawValue) {
			clearedFieldKeys.push(fieldKey);
			continue;
		}

		if (isPacketNumericField(fieldKey)) {
			factsPatch[fieldKey] = Number(rawValue);
			continue;
		}

		if (isPacketArrayField(fieldKey)) {
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
