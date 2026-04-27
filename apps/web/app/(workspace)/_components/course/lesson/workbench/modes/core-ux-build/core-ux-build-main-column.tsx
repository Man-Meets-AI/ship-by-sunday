import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

import { ArtifactContext } from "../../shared/artifact-context";
import { CORE_UX_BUILD_FIELD_IDS } from "@/lib/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants";
import { CoreUxBuildHandoffCard } from "./core-ux-build-handoff-card";
import { CoreUxBuildOnboardingCard } from "./core-ux-build-onboarding-card";
import { CoreUxBuildTabsPanel } from "./core-ux-build-tabs-panel";
import { CoreUxBuildWorkflowPreview } from "./core-ux-build-workflow-preview";

type Props = {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

export function CoreUxBuildMainColumn({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: Props) {
	const onboardingField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.onboardingChecklist,
	);
	const strategyField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.strategyPrompt,
	);
	const brandField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.brandReferences,
	);
	const blogField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.blogLink,
	);
	const mimicField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.postMimicImage,
	);
	const briefField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.codexBrief,
	);
	const handoffField = fields.find(
		(f) => f.id === CORE_UX_BUILD_FIELD_IDS.handoffChecklist,
	);

	const missing =
		!onboardingField ||
		!strategyField ||
		!brandField ||
		!blogField ||
		!mimicField ||
		!briefField ||
		!handoffField;

	if (missing) {
		return (
			<div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
				Core UX Build workbench fields are not configured for this lesson.
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<CoreUxBuildOnboardingCard
				checklistField={onboardingField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<CoreUxBuildTabsPanel
				strategyField={strategyField}
				brandField={brandField}
				blogField={blogField}
				mimicField={mimicField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
			/>
			<CoreUxBuildWorkflowPreview />
			<CoreUxBuildHandoffCard
				briefField={briefField}
				handoffChecklistField={handoffField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);
}
