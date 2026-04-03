export const BUILD_SLICES_FIELD_IDS = {
	planningPath: "build_slices_planning_path",
	coreUxOrPrompt: "build_slices_core_ux_or_prompt",
	referenceLink: "build_slices_reference_link",
	blueprint: "build_slices_blueprint",
	selectedSlice: "build_slices_selected_slice",
	reviewChecklist: "build_slices_review_checklist",
	userFlowSketch: "build_slices_user_flow_sketch",
} as const;

export const BUILD_SLICES_PLAN_SKILL = "plan_skill";
export const BUILD_SLICES_TRADITIONAL = "traditional_planning";

export const BUILD_SLICES_REVIEW_CHECKLIST_OPTIONS = [
	"I understand the slice",
	"This matches the UX",
	"This is the next smallest useful piece",
] as const;

export const BUILD_SLICES_EXAMPLE_PROMPT = `Problem
I'm deciding how users will discover and install my browser extension.

Current belief
Most people will find it through the Chrome Web Store if the listing is clear.

Uncertainty
I don't know whether I'll need a separate landing page for SEO or if the store listing is enough.

Supporting link
https://example.com/chrome-web-store-policy-overview`;

export const BUILD_SLICES_LOOP_STEPS = [
	"Core UX",
	"Choose planning mode",
	"Review slices",
	"Pick one slice",
	"Test in UX",
] as const;

export const BUILD_SLICES_SLICE_HELP =
	"A slice is a small, implementable chunk of work the planner returns—something you can build in one pass, then verify against your UX.";

export const BUILD_SLICES_NICHE_RESEARCH_EXAMPLE =
	"Pattern (niche example): you might ask how distribution works for a plugin—store listing vs landing page vs docs. You are not required to build a plugin; use the same structure for your own unknown.";
