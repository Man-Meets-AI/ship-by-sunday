import type { BlockConfig } from "@/lib/course/lesson/model/manifest";
import type { ArtifactPreview } from "@/lib/course/lesson/model/registry";

export type BlockGroup = {
	block: BlockConfig;
	artifacts: ArtifactPreview[];
};
