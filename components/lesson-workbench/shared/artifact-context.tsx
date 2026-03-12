import type { PinnedArtifact } from "@/components/lesson-shells";

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
		<div className="grid gap-2 md:grid-cols-2">
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
