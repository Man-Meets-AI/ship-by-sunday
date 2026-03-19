"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";

import { getCoachPanelSections } from "./coach-panel-sections";
import type { CoachPanelKey, PinnedArtifact } from "./types";

const panelCardClass =
	"min-w-0 gap-0 py-0 xl:h-full xl:min-h-0 xl:overflow-y-auto";

const coachEyebrowClass =
	"font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

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
		<Card className={cn("flex min-w-0 flex-col", panelCardClass)}>
			<div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
				<CardTitle className={coachEyebrowClass}>Coach</CardTitle>
			</div>
			<Tabs
				value={tabValue}
				onValueChange={(value) => onPanelChange(value as CoachPanelKey)}
				className="flex min-h-0 flex-1 flex-col gap-0"
			>
				<TabsList
					variant="line"
					className="h-auto w-full shrink-0 flex-wrap justify-start gap-0 rounded-none border-0 bg-transparent p-0 px-1 pt-1"
				>
					{visibleSections.map((section) => (
						<TabsTrigger
							key={section.key}
							value={section.key}
							className="shrink-0 rounded-md px-2.5 py-2 text-xs"
						>
							{section.label}
						</TabsTrigger>
					))}
				</TabsList>
				<div className="min-h-0 flex-1 overflow-y-auto">
					{visibleSections.map((section) => (
						<TabsContent
							key={section.key}
							value={section.key}
							className="mt-0 px-4 py-4 focus-visible:ring-0"
						>
							{section.content}
						</TabsContent>
					))}
				</div>
			</Tabs>
		</Card>
	);
}
