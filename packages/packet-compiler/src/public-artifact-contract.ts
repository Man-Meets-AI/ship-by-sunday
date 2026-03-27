import type { PacketStageId } from "./stages/stage-definitions";

export const AGENT_READY_PACKS_LABEL = "Agent-Ready Packs";
export const DESIGN_PACK_LABEL = "Design Pack";
export const MARKETING_PACK_LABEL = "Marketing Pack";
export const BUILD_PACK_LABEL = "Build Pack";
export const PROMPT_PACK_LABEL = "Prompt Pack";
export const STARTER_SNAPSHOT_LABEL = "Starter Snapshot";

export type PacketArtifactStage = Extract<
	PacketStageId,
	"design" | "marketing" | "build-plan"
>;

export function getStarterSnapshotArchiveFileName(): string {
	return "starter-snapshot.zip";
}
