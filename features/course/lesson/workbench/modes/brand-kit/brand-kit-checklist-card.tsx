"use client";

import { Fragment, type ReactNode, useId } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { assert } from "@/features/course/lesson/lib/assert";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { normalizeChecklistValue } from "../../fields/value-codecs";

function renderChecklistLabelText(label: string): ReactNode {
	const parts = label.split("`");
	if (parts.length === 1) {
		return label;
	}

	return parts.map((part, index) =>
		index % 2 === 0 ? (
			<Fragment key={index}>{part}</Fragment>
		) : (
			<code
				key={index}
				className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground"
			>
				{part}
			</code>
		),
	);
}

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
	const baseId = useId();

	if (!field) return null;

	assert(
		field.kind === "checklist",
		`Expected checklist field, got "${field.kind}"`,
	);
	assert(field.options, `Checklist field "${field.id}" is missing options.`);

	const checklistItems = normalizeChecklistValue(
		fieldValues[field.id],
		field.options,
	);
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
						<div className="overflow-hidden rounded-lg border border-border">
							{checklistItems.map((item, index) => {
								const rowId = `${baseId}-${field.id}-${index}`;
								return (
									<Fragment key={`${field.id}-${index}`}>
										{index > 0 ? <Separator /> : null}
										<div className="flex items-start gap-3 px-3 py-2.5">
											<Checkbox
												id={rowId}
												checked={item.checked}
												className="mt-0.5"
												onCheckedChange={(nextChecked) => {
													const nextItems = checklistItems.map(
														(current, currentIndex) =>
															currentIndex === index
																? { ...current, checked: Boolean(nextChecked) }
																: current,
													);
													onFieldChange(field.id, nextItems);
												}}
											/>
											<Label
												htmlFor={rowId}
												className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed font-normal text-foreground"
											>
												{renderChecklistLabelText(item.label)}
											</Label>
										</div>
									</Fragment>
								);
							})}
						</div>
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
