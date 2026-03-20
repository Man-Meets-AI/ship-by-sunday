"use client";

import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { BuildShipRoadmapConceptsAccordion } from "./build-ship-roadmap-concepts-accordion";
import { BuildShipRoadmapOrientation } from "./build-ship-roadmap-orientation";
import { BuildShipRoadmapOutOfScopeAlert } from "./build-ship-roadmap-out-of-scope-alert";
import { BuildShipRoadmapOutputs } from "./build-ship-roadmap-outputs";
import { BuildShipRoadmapTabsPanel } from "./build-ship-roadmap-tabs-panel";

export function BuildShipRoadmapWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	layoutMode,
	invalidFieldIds = new Set<string>(),
	fields,
}: WorkbenchModeProps) {
	const showSplitMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideo = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<BuildShipRoadmapOrientation />
			<BuildShipRoadmapOutOfScopeAlert />
			<BuildShipRoadmapTabsPanel
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
			<Separator className="bg-border" />
			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Quick definitions
				</p>
				<BuildShipRoadmapConceptsAccordion />
			</div>
			<Separator className="bg-border" />
			<div className="space-y-2">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Save your outputs
				</p>
				<BuildShipRoadmapOutputs
					fields={fields}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			</div>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitMedia ? (
				<WorkbenchMediaLayout media={inlineVideo}>
					{mainColumn}
				</WorkbenchMediaLayout>
			) : lesson.coachVideoPlacement === "workbench" ? (
				<>
					{inlineVideo}
					{mainColumn}
				</>
			) : (
				mainColumn
			)}
		</WorkbenchContainer>
	);
}
