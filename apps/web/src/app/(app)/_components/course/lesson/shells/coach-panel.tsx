"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";

import { CoachPanelMotion } from "./coach-panel-motion";
import { getCoachPanelSections } from "./coach-panel-sections";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export function CoachPanel({
	lesson,
	coachContent,
	activePanel,
	onPanelChange,
	pinnedArtifacts,
}: {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	activePanel: CoachPanelKey;
	onPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const emptyVideoState =
		lesson.id === "1.3"
			? {
					eyebrow: "No lesson video yet",
					title: "Use the guided path",
					body: "This lesson is still fully usable. Lean on the inline examples, the guided prompts, and the compare-your-three recap while you draft grounded candidate problems.",
				}
			: undefined;
	const visibleSections = getCoachPanelSections({
		coachContent,
		emptyVideoState,
		hideWatch: lesson.coachVideoPlacement === "workbench",
		pinnedArtifacts,
	});

	const firstKey = visibleSections[0]?.key;
	const tabValue = visibleSections.some((s) => s.key === activePanel)
		? activePanel
		: (firstKey ?? "transcript");

	return (
		<Card className="flex min-w-0 flex-col gap-0 py-0 xl:h-full xl:min-h-0">
			<CardHeader className="border-b border-border">
				<CardTitle>Coach</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
				<Tabs
					value={tabValue}
					onValueChange={(value) => onPanelChange(value as CoachPanelKey)}
					className="flex min-h-0 flex-1 flex-col gap-2"
				>
					<div className="shrink-0 px-4 pt-4">
						<TabsList className="h-auto w-full flex-wrap justify-start">
							{visibleSections.map((section) => (
								<TabsTrigger key={section.key} value={section.key}>
									{section.label}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					<ScrollArea className="min-h-0 min-w-0 flex-1 px-4 pb-4">
						{visibleSections.map((section) => (
							<TabsContent
								key={section.key}
								value={section.key}
								className="mt-0 py-4 focus-visible:ring-0"
							>
								<CoachPanelMotion>{section.content}</CoachPanelMotion>
							</TabsContent>
						))}
					</ScrollArea>
				</Tabs>
			</CardContent>
		</Card>
	);
}
