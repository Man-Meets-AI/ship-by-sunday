import {
	packetFieldPromptKind,
	type CanonicalProjectFactsDraft,
	type CanonicalProjectFactKey,
	type PacketStageId,
} from "@manmeetsai/packet-compiler";

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

export type PacketFieldInputKind = "input" | "number" | "textarea";

type PacketFieldPresentation = {
	label: string | ((facts: CanonicalProjectFactsDraft) => string);
	helperText?: string | ((facts: CanonicalProjectFactsDraft) => string);
};

const problemSeverityScaleValues = [
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

const problemUrgencyValues = [
	"Can schedule",
	"Needs attention soon",
	"Needs action now",
] as const;

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
		helperText: "Enter the public-facing product name.",
	},
	product_summary: {
		label: "What's the one-liner?",
		helperText: "Describe the offer in one clear sentence.",
	},
	primary_user: {
		label: "Who wants this? Who benefits from this?",
		helperText: "Identify the person who most wants the outcome.",
	},
	why_this_matters: {
		label: "Why does this person want this?",
		helperText: "Explain why this outcome matters to that person.",
	},
	problem_statement: {
		label: (facts) =>
			facts.product_name?.trim()
				? `What does ${facts.product_name.trim()} solve?`
				: "What does this solve?",
		helperText: "Describe the problem in plain, specific language.",
	},
	problem_context_when: {
		label: "When does this problem show up?",
	},
	problem_context_where: {
		label: "Where does this problem show up?",
		helperText: "Describe the environment, workflow, or context.",
	},
	problem_trigger: {
		label: "What is happening when this problem hits?",
		helperText:
			"Describe what is happening immediately before the problem appears.",
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
		helperText: "List the steps in order, one per line.",
	},
	scope_in: {
		label: "What absolutely has to get built?",
		helperText: "List the capabilities required for a useful v1. One per line.",
	},
	scope_out: {
		label: "What can we cut if we had to?",
		helperText:
			"List what can wait until later without breaking the core outcome. One per line.",
	},
	non_goals: {
		label: "What are we explicitly not building?",
	},
	v1_rationale: {
		label: "Why is this enough for the user to win?",
	},
	screen_sequence: {
		label: "What screens would people see, in order?",
		helperText: "List the screens in order, one per line.",
	},
	must_have_capabilities: {
		label: "What capabilities have to exist on those screens?",
		helperText: "List the essential capabilities, one per line.",
	},
	surface_type: {
		label: "What are you building on?",
	},
	design_references: {
		label: "What should this feel like?",
		helperText: "Add links or references, one per line.",
	},
	brand_assets: {
		label: "What brand assets do you already have?",
		helperText: "List the files, links, or brand assets to use.",
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
		helperText: "List the buyer objections to address, one per line.",
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

export function getPacketFieldScaleDefinition(
	fieldKey: CanonicalProjectFactKey,
) {
	return packetFieldScaleDefinitions[fieldKey] ?? null;
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
