"use client";

import { Separator } from "@/components/ui/separator";
import { FieldControl } from "../../fields/field-control";
import { FieldList } from "../../fields/field-list";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";
import { CompetitorResearchExampleAccordion } from "./competitor-research-example-accordion";
import { CompetitorResearchNotesTabs } from "./competitor-research-notes-tabs";
import { CompetitorResearchPromptSection } from "./competitor-research-prompt-section";
import { CompetitorResearchTargetRecap } from "./competitor-research-target-recap";

function pickField(props: WorkbenchModeProps, id: string) {
	return props.fields.find((field) => field.id === id) ?? null;
}

export function CompetitorResearchLightWorkbench(props: WorkbenchModeProps) {
	const {
		lesson,
		lessonContent,
		fieldValues,
		onFieldChange,
		pinnedArtifacts,
		invalidFieldIds,
		invalidFieldMessages,
		layoutMode,
	} = props;

	const copyResource = lessonContent.coach.resources?.find(
		(resource) => resource.kind === "copy_prompt",
	);
	const showSplitMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const knownField = pickField(props, "research_known_competitors");
	const patternsField = pickField(props, "research_problem_patterns");
	const pricingField = pickField(props, "research_pricing_notes");
	const messagingField = pickField(props, "research_messaging_notes");
	const productField = pickField(props, "research_product_notes");
	const flowField = pickField(props, "research_flow_checklist");
	const triedField = pickField(props, "research_things_tried");
	const takeawayField = pickField(props, "research_directional_takeaway");

	const tailFields = [flowField, triedField, takeawayField].filter(
		(field): field is NonNullable<typeof field> => field != null,
	);

	const formBody = (
		<div className="space-y-6">
			<CompetitorResearchTargetRecap pinnedArtifacts={pinnedArtifacts} />
			{copyResource && copyResource.kind === "copy_prompt" ? (
				<CompetitorResearchPromptSection
					resource={copyResource}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : null}
			<CompetitorResearchExampleAccordion />
			{knownField ? (
				<FieldControl
					field={knownField}
					value={fieldValues[knownField.id]}
					onChange={(value) => onFieldChange(knownField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(knownField.id)}
				/>
			) : null}
			{patternsField ? (
				<FieldControl
					field={patternsField}
					value={fieldValues[patternsField.id]}
					onChange={(value) => onFieldChange(patternsField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(patternsField.id)}
				/>
			) : null}
			{pricingField && messagingField && productField ? (
				<CompetitorResearchNotesTabs
					pricingField={pricingField}
					messagingField={messagingField}
					productField={productField}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			) : null}
			{tailFields.length > 0 ? (
				<FieldList
					fields={tailFields}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
					className="space-y-6"
				/>
			) : null}
		</div>
	);

	const inlineVideo = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitMedia ? (
				<WorkbenchMediaLayout media={inlineVideo}>
					{formBody}
				</WorkbenchMediaLayout>
			) : (
				<>
					{inlineVideo}
					{formBody}
				</>
			)}
		</WorkbenchContainer>
	);
}
