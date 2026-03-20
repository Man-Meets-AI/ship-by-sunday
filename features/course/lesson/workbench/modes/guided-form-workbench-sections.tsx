import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { isFilled } from "@/features/course/lesson/model/registry";
import { cn } from "@/lib/utils";

import { FieldList } from "../fields/field-list";
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
				const statusLabel = blocked
					? "Locked"
					: (sectionState?.isComplete ?? false)
						? "Ready"
						: "In progress";

				return (
					<Card key={section.id} className={cn(blocked && "bg-muted/30")}>
						<CardHeader>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<CardTitle>{section.title}</CardTitle>
								<Badge variant="outline" className="text-xs font-normal">
									{statusLabel}
								</Badge>
							</div>
							{blocked ? (
								<CardDescription>{HANDOFF_BLOCKED_COPY}</CardDescription>
							) : null}
							{section.instruction ? (
								<CardDescription className={cn(blocked && "mt-1")}>
									{section.instruction}
								</CardDescription>
							) : null}
						</CardHeader>
						<CardContent>
							<fieldset
								disabled={blocked}
								className={blocked ? "opacity-45" : ""}
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
							</fieldset>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
