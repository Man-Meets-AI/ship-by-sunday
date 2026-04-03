import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";

export const reviewArtifacts = [
	{
		id: "design",
		title: DESIGN_PACK_LABEL,
		includedPath: "docs/design/",
		summary:
			"Agent guidance, checklist, plan, and documentation generated from the Design stage.",
		stageRoute: getBlueprintStageDefinition("design").route,
		stageLabel: getBlueprintStageDefinition("design").label,
	},
	{
		id: "marketing",
		title: MARKETING_PACK_LABEL,
		includedPath: "docs/marketing/",
		summary:
			"Offer, claims, channel, and messaging docs generated from the Marketing stage.",
		stageRoute: getBlueprintStageDefinition("marketing").route,
		stageLabel: getBlueprintStageDefinition("marketing").label,
	},
	{
		id: "build",
		title: BUILD_PACK_LABEL,
		includedPath: "docs/build/",
		summary:
			"Implementation guidance and long-horizon build docs generated from the Build Plan stage.",
		stageRoute: getBlueprintStageDefinition("build-plan").route,
		stageLabel: getBlueprintStageDefinition("build-plan").label,
	},
] as const;

export type ReviewArtifactId = (typeof reviewArtifacts)[number]["id"];
