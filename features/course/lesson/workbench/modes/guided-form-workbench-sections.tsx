import { isFilled } from "@/features/course/lesson/model/registry";
import { FieldList } from "../fields/field-list";
import { SectionCard } from "../shared/section-card";
import type { WorkbenchModeProps } from "../types";

const HANDOFF_BLOCKED_COPY =
	"First, pick the problem to carry forward above to unlock this section.";

export function GuidedFormWorkbenchSections({
	workbenchSections,
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	sectionStates,
}: Pick<
	WorkbenchModeProps,
	| "workbenchSections"
	| "fields"
	| "fieldValues"
	| "onFieldChange"
	| "pinnedArtifacts"
	| "invalidFieldIds"
	| "invalidFieldMessages"
	| "sectionStates"
>) {
	return (
		<div className="flex flex-col gap-8">
			{workbenchSections.map((section) => {
				const sectionFields = fields.filter((field) =>
					section.fieldIds.includes(field.id),
				);
				const sectionState = sectionStates.find(
					(state) => state.id === section.id,
				);
				const blocked = (section.blockedByFieldIds ?? []).some(
					(fieldId) => !isFilled(fieldValues[fieldId]),
				);
				const layoutClass =
					section.layout === "split"
						? "grid gap-6 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)]"
						: section.layout === "compact"
							? "grid gap-6 md:grid-cols-2"
							: undefined;

				return (
					<SectionCard
						key={section.id}
						section={section}
						isComplete={sectionState?.isComplete ?? false}
						blocked={blocked}
						blockedMessage={blocked ? HANDOFF_BLOCKED_COPY : undefined}
					>
						<FieldList
							fields={sectionFields}
							fieldValues={fieldValues}
							onFieldChange={onFieldChange}
							pinnedArtifacts={pinnedArtifacts}
							invalidFieldIds={invalidFieldIds}
							invalidFieldMessages={invalidFieldMessages}
							className={layoutClass}
						/>
					</SectionCard>
				);
			})}
		</div>
	);
}
