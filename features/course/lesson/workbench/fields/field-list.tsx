import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { FieldControl } from "./field-control";

export function FieldList({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages = new Map<string, string>(),
	className,
}: {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{fields.map((field) => {
				const invalid = invalidFieldIds.has(field.id);
				const message =
					invalidFieldMessages.get(field.id) ??
					"Finish this before continuing.";

				return (
					<div key={field.id} className="flex flex-col gap-3">
						<FieldControl
							field={field}
							value={fieldValues[field.id]}
							onChange={(value) => onFieldChange(field.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							invalid={invalid}
						/>
						{invalid ? <FieldError>{message}</FieldError> : null}
						{field.helpText ? (
							<p className="max-w-[64ch] text-[13px] leading-[1.7] text-muted-foreground">
								{field.helpText}
							</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
