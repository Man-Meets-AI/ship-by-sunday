/** Lesson 3.10 — persisted workbench field ids (keep in sync with content/build.ts). */
export const CORE_UX_PLAN_FIELD_IDS = {
	rawBuildIdea: "ux_plan_raw_build_idea",
	releaseDistribution: "ux_plan_release_distribution",
	localBridge: "ux_plan_local_codex_bridge",
	buyerAiPromise: "ux_plan_buyer_ai_promise",
	installDestination: "ux_plan_install_destination",
	planSlices: "ux_plan_plan_slices",
	planAffectedAreas: "ux_plan_plan_affected_areas",
	planRisks: "ux_plan_plan_risks",
	planDependencies: "ux_plan_plan_dependencies",
	workflowChecklist: "ux_plan_workflow_checklist",
} as const;

export const CORE_UX_PLAN_PLANNING_TRIGGER = "Shift+Tab";

export const CORE_UX_PLAN_FALLBACK_PROMPT =
	"Can you ask me some clarifying questions about this?";

export const CORE_UX_PLAN_WORKFLOW_CHECKLIST_OPTIONS = [
	"Trigger planning mode",
	"Read recommendation details",
	"Choose answers",
	"Generate plan",
	"Review plan",
	"Submit",
] as const;

export const CORE_UX_PLAN_STUDENT_FIELD_IDS: string[] = [
	CORE_UX_PLAN_FIELD_IDS.rawBuildIdea,
	CORE_UX_PLAN_FIELD_IDS.releaseDistribution,
	CORE_UX_PLAN_FIELD_IDS.localBridge,
	CORE_UX_PLAN_FIELD_IDS.buyerAiPromise,
	CORE_UX_PLAN_FIELD_IDS.installDestination,
];

export const CORE_UX_PLAN_BRIEF_FIELD_IDS: string[] = [
	CORE_UX_PLAN_FIELD_IDS.planSlices,
	CORE_UX_PLAN_FIELD_IDS.planAffectedAreas,
	CORE_UX_PLAN_FIELD_IDS.planRisks,
	CORE_UX_PLAN_FIELD_IDS.planDependencies,
];

export type CoreUxPlanInstructorDecision = {
	id: string;
	title: string;
	questionLine: string;
	chosenAnswer: string;
	selectOptions: string[];
	rationale: string[];
};

/** Rationale aligned with the 3.10 walkthrough (planning mode, clarifying Qs, Codex recommendations). */
export const CORE_UX_PLAN_INSTRUCTOR_DECISIONS: CoreUxPlanInstructorDecision[] =
	[
		{
			id: "distribution",
			title: "Release distribution",
			questionLine: "How will buyers get the product—web-first, store, or something else?",
			chosenAnswer: "web-led install",
			selectOptions: [
				"web-led install",
				"desktop app only",
				"mobile app store first",
				"CLI / developer-only",
			],
			rationale: [
				"Keeps purchase and onboarding on a path you control (site + email) instead of waiting on store review for every iteration.",
				"Matches a small-team v1: ship the flow, then tighten packaging once the core loop works.",
			],
		},
		{
			id: "bridge",
			title: "Local Codex bridge",
			questionLine: "Do you keep the local Codex bridge in scope for this build?",
			chosenAnswer: "keep the bridge",
			selectOptions: [
				"keep the bridge",
				"remove the bridge for v1",
				"replace with hosted agent only",
			],
			rationale: [
				"Preserves the same dev loop you have been using: agent talks to your repo without re-architecting integrations mid-sprint.",
				"Defer cutting the bridge until after the buyer-visible slice is stable.",
			],
		},
		{
			id: "ai_promise",
			title: "Buyer-facing AI promise",
			questionLine: "What do you promise buyers about AI in the product?",
			chosenAnswer: "bring your own ChatGPT",
			selectOptions: [
				"bring your own ChatGPT",
				"built-in hosted model in-app",
				"no AI in v1",
				"AI features only in admin tools",
			],
			rationale: [
				"Narrows liability and infra: you are not hosting model traffic or keys for every buyer on day one.",
				"Makes marketing honest—buyers connect their own ChatGPT (or skip) instead of implying bundled intelligence you have not shipped.",
			],
		},
		{
			id: "install_path",
			title: "After purchase, where do buyers install?",
			questionLine: "Where should buyers land to install or finish setup after they pay?",
			chosenAnswer: "send buyers to the community listing",
			selectOptions: [
				"send buyers to the community listing",
				"email-only instructions",
				"in-app download center only",
				"support call / manual onboarding",
			],
			rationale: [
				"Uses a single public place (community listing) for install steps, changelog, and FAQs so you are not duplicating instructions.",
				"Pairs with web-led distribution: Stripe (or similar) confirms pay, then the listing explains what to do next.",
			],
		},
	];
