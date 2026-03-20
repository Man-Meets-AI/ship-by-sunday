import { Separator } from "@/components/ui/separator";
import type { LessonPromptResourceContent } from "@/features/course/lesson/model/contracts";
import { FieldControl } from "@/features/course/lesson/workbench/fields/field-control";
import type { WorkbenchModeProps } from "@/features/course/lesson/workbench/types";

import { CompetitorResearchExampleAccordion } from "./competitor-research-example-accordion";
import { CompetitorResearchNotesTabs } from "./competitor-research-notes-tabs";
import { CompetitorResearchPromptSection } from "./competitor-research-prompt-section";
import { CompetitorResearchTargetRecap } from "./competitor-research-target-recap";

function fieldById(
	fields: WorkbenchModeProps["fields"],
	id: string,
) {
	return fields.find((candidate) => candidate.id === id);
}

export function CompetitorResearchLightBody({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	copyPromptResource,
}: Pick<
	WorkbenchModeProps,
	| "fields"
	| "fieldValues"
	| "onFieldChange"
	| "pinnedArtifacts"
	| "invalidFieldIds"
	| "invalidFieldMessages"
> & { copyPromptResource: LessonPromptResourceContent }) {
	const known = fieldById(fields, "research_known_competitors");
	const patterns = fieldById(fields, "research_problem_patterns");
	const pricing = fieldById(fields, "research_pricing_notes");
	const messaging = fieldById(fields, "research_messaging_notes");
	const product = fieldById(fields, "research_product_notes");
	const flow = fieldById(fields, "research_flow_checklist");
	const tried = fieldById(fields, "research_things_tried");
	const takeaway = fieldById(fields, "research_directional_takeaway");

	return (
		<div className="space-y-6">
			<CompetitorResearchPromptSection
				resource={copyPromptResource}
				pinnedArtifacts={pinnedArtifacts}
			/>
			<Separator />
			<CompetitorResearchTargetRecap pinnedArtifacts={pinnedArtifacts} />
			{known ? (
				<FieldControl
					field={known}
					value={fieldValues[known.id]}
					onChange={(value) => onFieldChange(known.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(known.id)}
				/>
			) : null}
			{patterns ? (
				<FieldControl
					field={patterns}
					value={fieldValues[patterns.id]}
					onChange={(value) => onFieldChange(patterns.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(patterns.id)}
				/>
			) : null}
			{pricing && messaging && product ? (
				<CompetitorResearchNotesTabs
					pricingField={pricing}
					messagingField={messaging}
					productField={product}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			) : null}
			{flow ? (
				<FieldControl
					field={flow}
					value={fieldValues[flow.id]}
					onChange={(value) => onFieldChange(flow.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(flow.id)}
				/>
			) : null}
			<CompetitorResearchExampleAccordion />
			{tried ? (
				<FieldControl
					field={tried}
					value={fieldValues[tried.id]}
					onChange={(value) => onFieldChange(tried.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(tried.id)}
				/>
			) : null}
			{takeaway ? (
				<FieldControl
					field={takeaway}
					value={fieldValues[takeaway.id]}
					onChange={(value) => onFieldChange(takeaway.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalidFieldIds.has(takeaway.id)}
				/>
			) : null}
		</div>
	);
}
