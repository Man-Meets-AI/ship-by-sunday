import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatArtifactValue } from "@/app/(workspace)/_components/course/lesson/workbench/shared/artifact-format";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

export function BuildProductIterationWorkbenchPinnedArtifacts({
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
				<Card key={artifact.artifactKey} className="gap-0 py-0">
					<CardHeader className="border-b border-border/60 pb-4">
						<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{artifact.contextTitle ?? artifact.artifactLabel}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 py-4">
						{artifact.fields.map(([fieldLabel, value], index) => (
							<div
								key={`${artifact.artifactKey}-${index}-${fieldLabel}`}
								className="space-y-1"
							>
								<Label className="text-muted-foreground">{fieldLabel}</Label>
								<p className="whitespace-pre-wrap text-sm text-foreground">
									{formatArtifactValue(value)}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
