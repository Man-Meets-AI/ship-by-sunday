import type { ReactNode } from "react";

import { LessonVideoSurface } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-surface";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";

import { CoachExamplesPanelContent } from "./coach-examples-panel-content";
import { CoachResourceLink } from "./coach-resource-link";
import { CopyPromptResourceCard } from "./copy-prompt-resource-card";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export type CoachPanelSection = {
	key: CoachPanelKey;
	label: string;
	content: ReactNode;
};

export function getCoachPanelSections({
	coachContent,
	pinnedArtifacts,
	emptyVideoState,
	hideWatch,
}: {
	coachContent: LessonContent["coach"];
	pinnedArtifacts: PinnedArtifact[];
	emptyVideoState?: {
		eyebrow?: string;
		title?: string;
		body: string;
	};
	hideWatch: boolean;
}): CoachPanelSection[] {
	const examples = (coachContent?.examples ?? []).filter(
		(example) =>
			example.id !== "avoid-this" &&
			example.title.trim().toLowerCase() !== "avoid this",
	);
	const resources = coachContent?.resources ?? [];

	const sections: CoachPanelSection[] = [
		{
			key: "watch",
			label: "Watch",
			content: (
				<LessonVideoSurface
					coachContent={coachContent}
					emptyState={emptyVideoState}
					playerFrame="bare"
				/>
			),
		},
		{
			key: "transcript",
			label: "Transcript",
			content:
				coachContent?.transcript?.status === "ready" &&
				coachContent.transcript.body ? (
					<p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
						{coachContent.transcript.body}
					</p>
				) : (
					<p className="text-sm leading-7 text-muted-foreground">
						Transcript will appear here when attached.
					</p>
				),
		},
		{
			key: "examples",
			label: "Examples",
			content: (
				<CoachExamplesPanelContent
					examples={examples}
					pinnedArtifacts={pinnedArtifacts}
				/>
			),
		},
		{
			key: "resources",
			label: "Resources",
			content:
				resources.length > 0 ? (
					<div className="space-y-3">
						{resources.map((resource) =>
							resource.kind === "copy_prompt" ? (
								<CopyPromptResourceCard
									key={resource.id}
									resource={resource}
									pinnedArtifacts={pinnedArtifacts}
								/>
							) : (
								<CoachResourceLink key={resource.id} resource={resource} />
							),
						)}
					</div>
				) : (
					<p className="text-sm leading-7 text-muted-foreground">
						Resources will show here when assigned.
					</p>
				),
		},
	];

	return hideWatch
		? sections.filter((section) => section.key !== "watch")
		: sections;
}
