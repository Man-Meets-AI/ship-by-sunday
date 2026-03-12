import type { PinnedArtifact } from "@/components/lesson-shells";
import type { WorkbenchField } from "@/lib/course/manifest";

import { formatArtifactValue } from "../shared/artifact-format";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import { fieldLabelClass } from "./field-styles";

export function ReadonlyFieldControl({
	field,
	pinnedArtifacts,
}: {
	field: WorkbenchField;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const linkedArtifact = field.linkedArtifactKey
		? pinnedArtifacts.find(
				(artifact) => artifact.artifactKey === field.linkedArtifactKey,
			)
		: null;

	return (
		<label className="block">
			<span className={fieldLabelClass}>{field.label}</span>
			<div className="mt-1.5 rounded-none border border-product-border/80 bg-product-surface px-3 py-3 text-xs font-medium text-product-text">
				{linkedArtifact ? (
					<div className="space-y-1.5">
						<WorkbenchHeaderLabel as="p">
							{linkedArtifact.artifactLabel}
						</WorkbenchHeaderLabel>
						{linkedArtifact.fields.length === 0 ? (
							<p className="text-product-muted">
								No artifact preview saved yet.
							</p>
						) : (
							linkedArtifact.fields.slice(0, 3).map(([key, entryValue]) => (
								<div key={key}>
									<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
										{key}
									</p>
									<p className="mt-1">{formatArtifactValue(entryValue)}</p>
								</div>
							))
						)}
					</div>
				) : (
					<p className="text-product-muted">
						This field will populate from an earlier saved artifact.
					</p>
				)}
			</div>
		</label>
	);
}
