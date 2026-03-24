import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import type { LessonExampleContent } from "@/features/course/lesson/model/contracts";
import { formatArtifactValue } from "@/features/course/lesson/workbench/shared/artifact-format";

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
			<div className="space-y-4">
				{examples.map((example) => (
					<Card key={example.id}>
						<CardHeader>
							<CardTitle>{example.title}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="whitespace-pre-wrap leading-7">{example.body}</p>
							{example.imageSrc ? (
								<div className="space-y-2">
									<AspectRatio ratio={16 / 9}>
										<img
											src={example.imageSrc}
											alt={example.imageAlt ?? example.title}
											className="h-full w-full rounded-lg border border-border bg-background object-contain"
											loading="lazy"
										/>
									</AspectRatio>
									{example.imageCaption ? (
										<CardDescription>{example.imageCaption}</CardDescription>
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
			<div className="space-y-4">
				{pinnedArtifacts.slice(0, 3).map((artifact) => (
					<Card key={artifact.artifactKey}>
						<CardHeader>
							<CardDescription>{artifact.lessonTitle}</CardDescription>
							<CardTitle>{artifact.artifactLabel}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{artifact.fields.length === 0 ? (
								<CardDescription>No preview details attached.</CardDescription>
							) : (
								artifact.fields.slice(0, 2).map(([key, value]) => (
									<div key={key} className="space-y-1">
										<CardDescription>{key}</CardDescription>
										<p className="leading-7">{formatArtifactValue(value)}</p>
									</div>
								))
							)}
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<Empty className="min-h-0 flex-none items-start justify-start border-0 bg-transparent p-0 text-left">
			<EmptyDescription>
				Examples will show here when attached.
			</EmptyDescription>
		</Empty>
	);
}
