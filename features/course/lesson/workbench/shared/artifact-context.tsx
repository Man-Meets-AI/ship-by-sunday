import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { ArtifactPreviewContent } from "./artifact-preview-content";
import { WorkbenchCard } from "./workbench-card";

export function ArtifactContext({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<WorkbenchCard
					key={artifact.artifactKey}
					label={artifact.contextTitle ?? artifact.artifactLabel}
				>
					<ArtifactPreviewContent artifact={artifact} />
				</WorkbenchCard>
			))}
		</div>
	);
}
