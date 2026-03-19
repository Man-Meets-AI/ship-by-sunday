import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { formatArtifactValue } from "../shared/artifact-format";
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
			<Label className="text-sm font-medium">{field.label}</Label>
			<Card className="mt-2 gap-0 py-0">
				<CardContent className="px-4 py-4 text-[14px] leading-[1.68] text-foreground">
					{linkedArtifact ? (
						<div className="space-y-3">
							<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
								{linkedArtifact.artifactLabel}
							</CardTitle>
							{linkedArtifact.fields.length === 0 ? (
								<p className="text-muted-foreground">
									No artifact preview saved yet.
								</p>
							) : (
								linkedArtifact.fields.slice(0, 3).map(([key, entryValue]) => (
									<div key={key}>
										<p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											{key}
										</p>
										<p className="mt-1">{formatArtifactValue(entryValue)}</p>
									</div>
								))
							)}
						</div>
					) : (
						<p className="text-muted-foreground">
							This field will populate from an earlier saved artifact.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
