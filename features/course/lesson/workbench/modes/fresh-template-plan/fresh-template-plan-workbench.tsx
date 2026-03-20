"use client";

import { useEffect, useRef } from "react";

import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import {
	FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT,
	FRESH_TEMPLATE_PLAN_FIELD_IDS,
} from "./fresh-template-plan-constants";
import { FreshTemplatePlanGoalAndBadges } from "./fresh-template-plan-goal-and-badges";
import { FreshTemplatePlanMacPathAccordion } from "./fresh-template-plan-mac-path-accordion";
import { FreshTemplatePlanPlanFirstAlert } from "./fresh-template-plan-plan-first-alert";
import { FreshTemplatePlanPromptControls } from "./fresh-template-plan-prompt-controls";
import { FreshTemplatePlanTabsPanel } from "./fresh-template-plan-tabs-panel";

export function FreshTemplatePlanWorkbench({
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
		const manual = fieldValues[FRESH_TEMPLATE_PLAN_FIELD_IDS.manualPrompt];
		if (
			manual === undefined ||
			manual === null ||
			(typeof manual === "string" && !manual.trim())
		) {
			onFieldChange(
				FRESH_TEMPLATE_PLAN_FIELD_IDS.manualPrompt,
				FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT,
			);
		}
		const reasoning = fieldValues[FRESH_TEMPLATE_PLAN_FIELD_IDS.reasoning];
		if (
			reasoning === undefined ||
			reasoning === null ||
			(typeof reasoning === "string" && !String(reasoning).trim())
		) {
			onFieldChange(FRESH_TEMPLATE_PLAN_FIELD_IDS.reasoning, "medium");
		}
	}, [fieldValuesReady, fieldValues, onFieldChange]);

	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<FreshTemplatePlanGoalAndBadges />
			<FreshTemplatePlanPlanFirstAlert />
			<FreshTemplatePlanTabsPanel />
			<FreshTemplatePlanPromptControls
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
			<FreshTemplatePlanMacPathAccordion />
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					{mainColumn}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{mainColumn}
				</>
			) : (
				mainColumn
			)}
		</WorkbenchContainer>
	);
}
