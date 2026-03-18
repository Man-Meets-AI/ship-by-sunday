import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { formatArtifactValue } from "../shared/artifact-format";
import { WorkbenchHeaderLabel } from "../shared/workbench-header-label";
import { workbenchChromeLabelClass } from "../shared/workbench-readability";
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
		<div className="block">
			<span className={fieldLabelClass}>{field.label}</span>
			<div className="mt-2 rounded-none border border-product-border/65 bg-product-surface px-4 py-4 text-[14px] leading-[1.68] text-product-text">
				{linkedArtifact ? (
					<div className="space-y-3">
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
									<p className={workbenchChromeLabelClass}>{key}</p>
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
		</div>
	);
}
