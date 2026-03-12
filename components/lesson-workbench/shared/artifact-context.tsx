import type { PinnedArtifact } from "@/components/lesson-shells";

import { formatArtifactValue } from "./artifact-format";
import { WorkbenchCard } from "./workbench-card";

function getArtifactContextTitle(artifact: PinnedArtifact) {
	return artifact.contextTitle ?? artifact.artifactLabel;
}

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
					title={getArtifactContextTitle(artifact)}
					eyebrow={artifact.lessonTitle}
				>
					<div className="space-y-1 text-xs font-medium text-product-muted">
						{artifact.fields.length === 0 ? (
							<p>No saved preview yet.</p>
						) : (
							artifact.fields.slice(0, 3).map(([key, value]) => (
								<div key={key}>
									<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
										{key}
									</p>
									<p className="mt-1 text-product-text">
										{formatArtifactValue(value)}
									</p>
								</div>
							))
						)}
					</div>
				</WorkbenchCard>
			))}
		</div>
	);
}
