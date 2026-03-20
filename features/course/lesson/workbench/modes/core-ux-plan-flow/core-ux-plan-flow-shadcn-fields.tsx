"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { renderCoreUxPlanFlowFieldControl } from "./core-ux-plan-flow-shadcn-field-control";

type CoreUxPlanFlowShadcnFieldsProps = {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	/** Accepted for parity with FieldList; not used by these controls. */
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
	className?: string;
};

export function CoreUxPlanFlowShadcnFields(
	props: CoreUxPlanFlowShadcnFieldsProps,
) {
	const {
		fields,
		fieldValues,
		onFieldChange,
		invalidFieldIds,
		invalidFieldMessages = new Map<string, string>(),
		className,
	} = props;

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{fields.map((field) => {
				const invalid = invalidFieldIds.has(field.id);
				const message =
					invalidFieldMessages.get(field.id) ??
					"Finish this before continuing.";

				return (
					<div key={field.id} className="flex flex-col gap-3">
						{renderCoreUxPlanFlowFieldControl(
							field,
							fieldValues[field.id],
							(value) => onFieldChange(field.id, value),
							invalid,
						)}
						{invalid ? <FieldError>{message}</FieldError> : null}
					</div>
				);
			})}
		</div>
	);
}
