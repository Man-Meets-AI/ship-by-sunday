import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { LessonExampleContent } from "@/features/course/lesson/model/contracts";
import { formatArtifactValue } from "@/features/course/lesson/workbench/shared/artifact-format";

import { coachEyebrowClass } from "./coach-resource-link";
import type { PinnedArtifact } from "./types";

export function CoachExamplesPanelContent({
	examples,
	pinnedArtifacts,
}: {
	examples: LessonExampleContent[];
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (examples.length > 0) {
		return (
			<div className="space-y-3">
				{examples.map((example) => (
					<Card key={example.id} className="gap-0 py-0">
						<CardContent className="px-4 py-4">
							<CardTitle className={coachEyebrowClass}>
								{example.title}
							</CardTitle>
							<p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
								{example.body}
							</p>
							{example.imageSrc ? (
								<div className="mt-2 space-y-1">
									<img
										src={example.imageSrc}
										alt={example.imageAlt ?? example.title}
										className="w-full rounded-lg border border-border bg-background object-contain"
										loading="lazy"
									/>
									{example.imageCaption ? (
										<p className="text-xs leading-6 text-muted-foreground">
											{example.imageCaption}
										</p>
									) : null}
								</div>
							) : null}
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (pinnedArtifacts.length > 0) {
		return (
			<div className="space-y-3">
				{pinnedArtifacts.slice(0, 3).map((artifact) => (
					<Card key={artifact.artifactKey} className="gap-0 py-0">
						<CardContent className="px-4 py-4">
							<CardTitle className={coachEyebrowClass}>
								{artifact.lessonTitle}
							</CardTitle>
							<p className="mt-2 text-base font-semibold leading-tight text-foreground">
								{artifact.artifactLabel}
							</p>
							<div className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
								{artifact.fields.length === 0 ? (
									<p>No preview details attached.</p>
								) : (
									artifact.fields.slice(0, 2).map(([key, value]) => (
										<div key={key}>
											<CardTitle className={coachEyebrowClass}>{key}</CardTitle>
											<p className="mt-1 text-sm leading-7 text-foreground">
												{formatArtifactValue(value)}
											</p>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<p className="text-sm leading-7 text-muted-foreground">
			Examples will show here when attached.
		</p>
	);
}
