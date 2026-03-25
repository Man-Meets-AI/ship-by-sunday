import type { BlockConfig } from "@/features/course/lesson/model/manifest";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";

export type BlockGroup = {
	block: BlockConfig;
	artifacts: ArtifactPreview[];
};
