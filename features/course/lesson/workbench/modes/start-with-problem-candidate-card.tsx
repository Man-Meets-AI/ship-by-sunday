"use client";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { StartWithProblemSignal } from "@/features/course/lesson/workbench/lib/start-with-problem-support";
import { inputWidthClass } from "@/features/course/lesson/workbench/fields/field-styles";
import { cn } from "@/lib/utils";

export function startWithProblemSignalReadyCount(
	signals: StartWithProblemSignal[],
) {
	return signals.filter((signal) => signal.ok).length;
}

function fieldById(fields: WorkbenchField[], id: string) {
	return fields.find((f) => f.id === id);
}

function compareInputId(fieldId: string) {
	return `swp-compare-${fieldId}`;
}

export function StartWithProblemCandidateBody({
	index,
	signals,
	fields,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: {
	index: 1 | 2 | 3;
	signals: StartWithProblemSignal[];
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
}) {
	const whoId = `problem_${index}_who`;
	const painId = `problem_${index}_pain`;
	const whoField = fieldById(fields, whoId);
	const painField = fieldById(fields, painId);

	const whoValue =
		typeof fieldValues[whoId] === "string" ? fieldValues[whoId] : "";
	const painValue =
		typeof fieldValues[painId] === "string" ? fieldValues[painId] : "";

	const whoLabel = whoField?.label ?? "Who has this problem?";
	const whoPlaceholder =
		whoField?.placeholder ??
		"A real person or group, not a broad market label.";
	const painLabel =
		painField?.label ?? "What recurring pain do they keep running into?";
	const painPlaceholder =
		painField?.placeholder ??
		"Describe the moment that keeps going wrong in their life or work.";
	const painRows = painField?.kind === "textarea" ? (painField.rows ?? 4) : 4;

	const whoHelp = whoField?.helpText ? (
		<FieldDescription>{whoField.helpText}</FieldDescription>
	) : null;
	const painHelp = painField?.helpText ? (
		<FieldDescription>{painField.helpText}</FieldDescription>
	) : null;

	const whoInvalid = invalidFieldIds.has(whoId);
	const painInvalid = invalidFieldIds.has(painId);
	const whoWidth = whoField ? inputWidthClass(whoField) : "max-w-none";
	const painWidth = painField ? inputWidthClass(painField) : "max-w-none";

	return (
		<div className="space-y-4">
			<Field className={whoWidth} data-invalid={whoInvalid || undefined}>
				<FieldLabel htmlFor={compareInputId(whoId)}>{whoLabel}</FieldLabel>
				{whoHelp}
				<FieldContent>
					<Input
						id={compareInputId(whoId)}
						value={whoValue as string}
						onChange={(e) => onFieldChange(whoId, e.target.value)}
						placeholder={whoPlaceholder}
						aria-invalid={whoInvalid}
					/>
				</FieldContent>
			</Field>
			<Field className={painWidth} data-invalid={painInvalid || undefined}>
				<FieldLabel htmlFor={compareInputId(painId)}>{painLabel}</FieldLabel>
				{painHelp}
				<FieldContent>
					<Textarea
						id={compareInputId(painId)}
						value={painValue as string}
						onChange={(e) => onFieldChange(painId, e.target.value)}
						placeholder={painPlaceholder}
						rows={painRows}
						aria-invalid={painInvalid}
					/>
				</FieldContent>
			</Field>
			<Separator />
			<div className="space-y-4">
				{signals.map((signal) => (
					<div key={signal.label} className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground">
							{signal.label}
						</Label>
						<p
							className={cn(
								"text-sm leading-relaxed",
								signal.ok ? "text-foreground" : "text-muted-foreground",
							)}
						>
							{signal.help}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
