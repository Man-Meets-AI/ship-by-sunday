import type { PacketStageId } from "./stages/stage-definitions";

export type DownloadablePacketArchiveStage = "design" | "marketing" | "build";
export type PacketArtifactStage = Extract<
	PacketStageId,
	"design" | "marketing" | "build-plan"
>;

export const AGENT_READY_PACKS_LABEL = "Agent-Ready Packs";
export const DESIGN_PACK_LABEL = "Design Pack";
export const MARKETING_PACK_LABEL = "Marketing Pack";
export const BUILD_PACK_LABEL = "Build Pack";
export const PROMPT_PACK_LABEL = "Prompt Pack";
export const STARTER_SNAPSHOT_LABEL = "Starter Snapshot";

const packetArchiveFileNames = {
	design: "design-pack.zip",
	marketing: "marketing-pack.zip",
	build: "build-pack.zip",
} as const satisfies Record<DownloadablePacketArchiveStage, string>;

export function getPublicPackLabelForStage(
	stageId: PacketArtifactStage,
): string {
	switch (stageId) {
		case "design":
			return DESIGN_PACK_LABEL;
		case "marketing":
			return MARKETING_PACK_LABEL;
		case "build-plan":
			return BUILD_PACK_LABEL;
	}
}

export function getPublicPacketArchiveFileName(
	stage: DownloadablePacketArchiveStage,
): string {
	return packetArchiveFileNames[stage];
}

export function getStarterSnapshotArchiveFileName(): string {
	return "starter-snapshot.zip";
}
