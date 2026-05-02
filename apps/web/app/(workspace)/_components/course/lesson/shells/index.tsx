"use client";

import { Card, CardTitle } from "@/components/ui/card";
import type {
	LessonConfig,
	LessonContent,
} from "@/lib/course/lesson/model/manifest";
import type { ObjectiveTask } from "@/lib/course/lesson/model/registry";

import { CoachPanel } from "./coach-panel";
import { ObjectivePanel } from "./objective-panel";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export type { CoachPanelKey, PinnedArtifact } from "./types";
export { LessonShellWatch } from "./lesson-shell-watch";

const shellEyebrowClass =
	"font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80";

const shellPanelCardClass = "min-w-0 gap-0 py-0 xl:flex xl:min-h-0 xl:flex-col";

type BaseLessonShellProps = {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	children: React.ReactNode;
	footer: React.ReactNode;
};

type SplitLessonShellProps = BaseLessonShellProps & {
	objectiveTasks: ObjectiveTask[];
	onObjectiveTaskToggle: (taskId: string, checked: boolean) => void;
	activeCoachPanel: CoachPanelKey;
	onCoachPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
};

export function LessonShellSplit({
	lesson,
	objectiveTasks,
	onObjectiveTaskToggle,
	activeCoachPanel,
	onCoachPanelChange,
	pinnedArtifacts,
	coachContent,
	children,
	footer,
}: SplitLessonShellProps) {
	return (
		<div className="grid gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]">
			<div className="order-3 flex min-w-0 flex-col xl:order-none xl:h-full xl:min-h-0">
				<ObjectivePanel
					lesson={lesson}
					objectiveTasks={objectiveTasks}
					onObjectiveTaskToggle={onObjectiveTaskToggle}
				/>
			</div>
			<div className="order-1 flex min-w-0 flex-col xl:order-none xl:h-full xl:min-h-0">
				<WorkbenchPanel footer={footer}>{children}</WorkbenchPanel>
			</div>
			<div className="order-2 flex min-w-0 flex-col xl:order-none xl:h-full xl:min-h-0">
				<CoachPanel
					lesson={lesson}
					coachContent={coachContent}
					activePanel={activeCoachPanel}
					onPanelChange={onCoachPanelChange}
					pinnedArtifacts={pinnedArtifacts}
				/>
			</div>
		</div>
	);
}

export function LessonShellFocus({ children, footer }: BaseLessonShellProps) {
	return <WorkbenchPanel footer={footer}>{children}</WorkbenchPanel>;
}

function WorkbenchPanel({
	children,
	footer,
}: {
	children: React.ReactNode;
	footer: React.ReactNode;
}) {
	return (
		<Card className={shellPanelCardClass}>
			<div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
				<CardTitle className={shellEyebrowClass}>Workbench</CardTitle>
			</div>
			<div className="min-w-0 px-4 py-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto sm:px-5">
				{children}
			</div>
			<div className="shrink-0 border-t border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
				{footer}
			</div>
		</Card>
	);
}
