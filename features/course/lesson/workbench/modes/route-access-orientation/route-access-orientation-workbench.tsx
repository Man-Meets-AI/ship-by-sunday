"use client";

import { useEffect, useMemo, useRef } from "react";

import { Separator } from "@/components/ui/separator";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";
import { RouteAccessLightweightAlert } from "./route-access-alerts";
import { RouteAccessAppTree } from "./route-access-app-tree";
import { RouteAccessCodexPromptCard } from "./route-access-codex-prompt-card";
import { RouteAccessFramingCard } from "./route-access-framing-card";
import { RouteAccessGlossary } from "./route-access-glossary";
import { RouteAccessInspectionChecklist } from "./route-access-inspection-checklist";
import {
	ROUTE_ACCESS_CODEX_PROMPT_DEFAULT,
	ROUTE_ACCESS_FIELD_IDS,
} from "./route-access-orientation-constants";
import { RouteAccessPagesTabs } from "./route-access-pages-tabs";
import { RouteAccessStudentFields } from "./route-access-student-fields";
import { RouteAccessToolBadges } from "./route-access-tool-badges";

export function RouteAccessOrientationWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	layoutMode,
	invalidFieldIds = new Set<string>(),
	fieldValuesReady = true,
}: WorkbenchModeProps) {
	const seededRef = useRef(false);

	useEffect(() => {
		if (!fieldValuesReady || seededRef.current) {
			return;
		}
		seededRef.current = true;
		const current = fieldValues[ROUTE_ACCESS_FIELD_IDS.codexPrompt];
		if (
			current === undefined ||
			current === null ||
			(typeof current === "string" && !current.trim())
		) {
			onFieldChange(
				ROUTE_ACCESS_FIELD_IDS.codexPrompt,
				ROUTE_ACCESS_CODEX_PROMPT_DEFAULT,
			);
		}
	}, [fieldValuesReady, fieldValues, onFieldChange]);

	const fieldsById = useMemo(() => {
		const map = new Map<string, WorkbenchField>();
		for (const field of lesson.workbenchFields ?? []) {
			map.set(field.id, field);
		}
		return map;
	}, [lesson.workbenchFields]);

	const codexField = fieldsById.get(ROUTE_ACCESS_FIELD_IDS.codexPrompt);
	const checklistField = fieldsById.get(
		ROUTE_ACCESS_FIELD_IDS.inspectionChecklist,
	);

	const showSplitWorkbenchMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const referenceColumn = (
		<div className="space-y-5">
			<RouteAccessFramingCard />
			<RouteAccessLightweightAlert />
			<RouteAccessAppTree />
			<RouteAccessPagesTabs />
			<RouteAccessToolBadges />
			<RouteAccessGlossary />
		</div>
	);

	const actionColumn = (
		<div className="space-y-5">
			<RouteAccessCodexPromptCard
				field={codexField}
				value={fieldValues[ROUTE_ACCESS_FIELD_IDS.codexPrompt]}
				onChange={(v) => onFieldChange(ROUTE_ACCESS_FIELD_IDS.codexPrompt, v)}
				invalid={invalidFieldIds.has(ROUTE_ACCESS_FIELD_IDS.codexPrompt)}
				pinnedArtifacts={pinnedArtifacts}
			/>
			<RouteAccessInspectionChecklist
				field={checklistField}
				value={fieldValues[ROUTE_ACCESS_FIELD_IDS.inspectionChecklist]}
				onChange={(v) =>
					onFieldChange(ROUTE_ACCESS_FIELD_IDS.inspectionChecklist, v)
				}
				invalid={invalidFieldIds.has(
					ROUTE_ACCESS_FIELD_IDS.inspectionChecklist,
				)}
				pinnedArtifacts={pinnedArtifacts}
			/>
			<RouteAccessStudentFields
				fieldsById={fieldsById}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
				pinnedArtifacts={pinnedArtifacts}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					<div className="space-y-8">
						{referenceColumn}
						<Separator className="bg-border" />
						{actionColumn}
					</div>
				</WorkbenchMediaLayout>
			) : (
				<>
					{lesson.coachVideoPlacement === "workbench" ? inlineVideoCard : null}
					<div className="space-y-8">
						{referenceColumn}
						<Separator className="bg-border" />
						{actionColumn}
					</div>
				</>
			)}
		</WorkbenchContainer>
	);
}
