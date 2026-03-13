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
		<div className={className}>
			{fields.map((field) => (
				<div
					key={field.id}
					className={
						invalidFieldIds.has(field.id)
							? "rounded-none border border-[#a83232] bg-[rgba(168,50,50,0.06)] p-3"
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
						<p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-product-muted">
							{field.helpText}
						</p>
					) : null}
					{invalidFieldIds.has(field.id) ? (
						<p className="mt-2 text-[11px] font-medium leading-snug text-[#a83232]">
							{invalidFieldMessages.get(field.id) ??
								"Finish this before continuing."}
						</p>
					) : null}
				</div>
			))}
		</div>
	);
}
