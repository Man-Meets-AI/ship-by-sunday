import type { PinnedArtifact } from "@/components/lesson-shells";
import type { WorkbenchField } from "@/lib/course/manifest";

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
		<div className={className ? `space-y-5 ${className}` : "space-y-5"}>
			{fields.map((field) => (
				<div
					key={field.id}
					className={
						invalidFieldIds.has(field.id)
							? "rounded-none border border-[#a83232] bg-[rgba(168,50,50,0.06)] p-4"
							: "p-0"
					}
				>
					<FieldControl
						field={field}
						value={fieldValues[field.id]}
						onChange={(value) => onFieldChange(field.id, value)}
						pinnedArtifacts={pinnedArtifacts}
					/>
					{field.helpText ? (
						<p className="mt-3 max-w-[64ch] text-[13px] leading-[1.7] text-product-muted">
							{field.helpText}
						</p>
					) : null}
					{invalidFieldIds.has(field.id) ? (
						<p className="mt-3 text-[12px] font-medium leading-[1.6] text-[#a83232]">
							{invalidFieldMessages.get(field.id) ??
								"Finish this before continuing."}
						</p>
					) : null}
				</div>
			))}
		</div>
	);
}
