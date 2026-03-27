import {
	BUILD_PACK_LABEL,
	DESIGN_PACK_LABEL,
	MARKETING_PACK_LABEL,
	getPacketStageDefinition,
} from "@packet-compiler";

export const reviewArtifacts = [
	{
		id: "design",
		title: DESIGN_PACK_LABEL,
		includedPath: "docs/design/",
		summary:
			"Agent guidance, checklist, plan, and documentation generated from the Design stage.",
		stageRoute: getPacketStageDefinition("design").route,
		stageLabel: getPacketStageDefinition("design").label,
	},
	{
		id: "marketing",
		title: MARKETING_PACK_LABEL,
		includedPath: "docs/marketing/",
		summary:
			"Offer, claims, channel, and messaging docs generated from the Marketing stage.",
		stageRoute: getPacketStageDefinition("marketing").route,
		stageLabel: getPacketStageDefinition("marketing").label,
	},
	{
		id: "build",
		title: BUILD_PACK_LABEL,
		includedPath: "docs/build/",
		summary:
			"Implementation guidance and long-horizon build docs generated from the Build Plan stage.",
		stageRoute: getPacketStageDefinition("build-plan").route,
		stageLabel: getPacketStageDefinition("build-plan").label,
	},
] as const;

export type ReviewArtifactId = (typeof reviewArtifacts)[number]["id"];
