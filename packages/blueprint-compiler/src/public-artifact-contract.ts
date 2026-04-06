export const AGENT_READY_PACKS_LABEL = "Agent-Ready Packs";
export const DESIGN_PACK_LABEL = "Design Pack";
export const MARKETING_PACK_LABEL = "Marketing Pack";
export const BUILD_PACK_LABEL = "Build Pack";
export const PROMPT_PACK_LABEL = "Prompt Pack";
export const STARTER_SNAPSHOT_LABEL = "Ship by Sunday Blueprint";

export type BlueprintArtifactStage = "design" | "marketing" | "build";

export function getStarterSnapshotArchiveFileName(repoName: string): string {
	return `${repoName}.zip`;
}
