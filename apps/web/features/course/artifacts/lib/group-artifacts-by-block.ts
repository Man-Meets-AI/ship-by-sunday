import { getLessonByKey } from "@/features/course/lesson/model/manifest";
import type { BlockGroup } from "@/features/course/artifacts/types";
import {
	getOrderedBlocks,
	type ArtifactPreview,
} from "@/features/course/lesson/model/registry";

export function groupArtifactsByBlock(
	artifacts: ArtifactPreview[],
): BlockGroup[] {
	const orderedBlocks = getOrderedBlocks();
	const buckets = new Map<string, ArtifactPreview[]>();

	for (const artifact of artifacts) {
		const lesson = getLessonByKey(artifact.lessonKey);
		const blockId = lesson?.block ?? "CEO";
		const list = buckets.get(blockId) ?? [];
		list.push(artifact);
		buckets.set(blockId, list);
	}

	return orderedBlocks
		.filter((block) => buckets.has(block.id))
		.map((block) => ({
			block,
			artifacts: buckets.get(block.id)!,
		}));
}
