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
		downloadHref: "/api/download/packet/design",
		stageRoute: getPacketStageDefinition("design").route,
		stageLabel: getPacketStageDefinition("design").label,
	},
	{
		id: "marketing",
		title: MARKETING_PACK_LABEL,
		downloadHref: "/api/download/packet/marketing",
		stageRoute: getPacketStageDefinition("marketing").route,
		stageLabel: getPacketStageDefinition("marketing").label,
	},
	{
		id: "build",
		title: BUILD_PACK_LABEL,
		downloadHref: "/api/download/packet/build",
		stageRoute: getPacketStageDefinition("build-plan").route,
		stageLabel: getPacketStageDefinition("build-plan").label,
	},
] as const;

export type ReviewArtifactId = (typeof reviewArtifacts)[number]["id"];
