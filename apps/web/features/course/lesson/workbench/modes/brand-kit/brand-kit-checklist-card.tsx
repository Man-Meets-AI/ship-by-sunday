"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import { ChecklistFieldRows } from "../../fields/checklist-field-rows";

type BrandKitChecklistCardProps = {
	field: WorkbenchField | undefined;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
};

export function BrandKitChecklistCard({
	field,
	fieldValues,
	onFieldChange,
	pinnedArtifacts: _pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: BrandKitChecklistCardProps) {
	if (!field || field.kind !== "checklist") return null;

	const invalid = invalidFieldIds.has(field.id);
	const message =
		invalidFieldMessages?.get(field.id) ?? "Finish this before continuing.";

	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">
					Artifact checklist
				</CardTitle>
				<CardDescription className="text-sm">
					Check each line when the file or setting is actually done—not when you
					only watched the step.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<Field className="block w-full">
					<FieldContent className="gap-3">
						<ChecklistFieldRows
							field={field}
							value={fieldValues[field.id]}
							className="overflow-hidden rounded-lg border border-border"
							separator="separator"
							onChange={(nextItems) => onFieldChange(field.id, nextItems)}
						/>
						{invalid ? <FieldError>{message}</FieldError> : null}
						{field.helpText ? (
							<p className="max-w-[64ch] text-[13px] leading-[1.7] text-muted-foreground">
								{field.helpText}
							</p>
						) : null}
					</FieldContent>
				</Field>
			</CardContent>
		</Card>
	);
}
