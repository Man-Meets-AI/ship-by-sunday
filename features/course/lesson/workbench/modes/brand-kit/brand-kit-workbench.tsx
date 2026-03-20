"use client";

import { Separator } from "@/components/ui/separator";

import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { BrandKitAlerts } from "./brand-kit-alerts";
import { BrandKitBrandInputsCard } from "./brand-kit-brand-inputs-card";
import { BrandKitChecklistCard } from "./brand-kit-checklist-card";
import {
	BRAND_KIT_ACCENT_HEX_FIELD_ID,
	BRAND_KIT_APP_NAME_FIELD_ID,
	BRAND_KIT_ARTIFACT_CHECKLIST_FIELD_ID,
	BRAND_KIT_DOMAIN_FIELD_ID,
	BRAND_KIT_ICON_UPLOAD_FIELD_ID,
	BRAND_KIT_INITIALS_FIELD_ID,
	BRAND_KIT_NAMING_FIELD_ID,
	BRAND_KIT_PRIMARY_HEX_FIELD_ID,
	BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
} from "./brand-kit-constants";
import { BrandKitPreviewCard } from "./brand-kit-preview-card";
import { BrandKitReferenceAccordion } from "./brand-kit-reference-accordion";
import { BrandKitRequiredOutputsCard } from "./brand-kit-required-outputs-card";
import { BrandKitResourcesCard } from "./brand-kit-resources-card";

function pickFields(fields: WorkbenchModeProps["fields"], ids: string[]) {
	const map = new Map(fields.map((f) => [f.id, f]));
	return ids.map((id) => map.get(id)).filter(Boolean) as typeof fields;
}

export function BrandKitWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	layoutMode,
}: WorkbenchModeProps) {
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const brandInputIds = [
		BRAND_KIT_APP_NAME_FIELD_ID,
		BRAND_KIT_INITIALS_FIELD_ID,
		BRAND_KIT_DOMAIN_FIELD_ID,
		BRAND_KIT_PRIMARY_HEX_FIELD_ID,
		BRAND_KIT_ACCENT_HEX_FIELD_ID,
	];
	const uploadIds = [
		BRAND_KIT_ICON_UPLOAD_FIELD_ID,
		BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
	];

	const checklistField = fields.find(
		(f) => f.id === BRAND_KIT_ARTIFACT_CHECKLIST_FIELD_ID,
	);

	const mainColumn = (
		<div className="space-y-5">
			<BrandKitResourcesCard />
			<Separator className="bg-border" />
			<BrandKitAlerts />
			<BrandKitBrandInputsCard
				title="Brand inputs"
				description="Capture what you will reuse in Stripe, DNS, and the repo."
				fields={pickFields(fields, brandInputIds)}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<BrandKitBrandInputsCard
				title="Naming exercise"
				description="List candidate words and phrases, then lock a working name."
				fields={pickFields(fields, [BRAND_KIT_NAMING_FIELD_ID])}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<BrandKitPreviewCard fieldValues={fieldValues} />
			<BrandKitBrandInputsCard
				title="Preview uploads (optional)"
				description="Add your exported icon and wordmark to sanity-check how they read together."
				fields={pickFields(fields, uploadIds)}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<BrandKitChecklistCard
				field={checklistField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<BrandKitRequiredOutputsCard />
			<BrandKitReferenceAccordion />
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
