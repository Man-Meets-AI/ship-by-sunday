"use client";

import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { normalizeChecklistValue } from "../../fields/value-codecs";

const DEFAULT_INVALID_MESSAGE = "Finish this before continuing.";

export function ProductionDeployHandoffChecklistCard({
	field,
	fieldValue,
	onFieldChange,
	invalid = false,
	invalidMessage = DEFAULT_INVALID_MESSAGE,
	headerTitle,
	headerDescription,
}: {
	field: WorkbenchField | undefined;
	fieldValue: unknown;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalid?: boolean;
	invalidMessage?: string;
	/** When set, overrides `field.label` in the card header. */
	headerTitle?: string;
	/** When set, overrides `field.helpText` in the card header. */
	headerDescription?: string;
}) {
	const baseId = useId();

	if (!field || field.kind !== "checklist" || !field.options?.length) {
		return null;
	}

	const items = normalizeChecklistValue(fieldValue, field.options);

	const title = headerTitle ?? field.label;
	const description = headerDescription ?? field.helpText;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">{title}</CardTitle>
				{description ? (
					<CardDescription>{description}</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
					{items.map((item, index) => {
						const rowId = `${baseId}-${field.id}-${index}`;
						return (
							<div
								key={item.label}
								className="flex items-start gap-3 px-3 py-2.5"
							>
								<Checkbox
									id={rowId}
									checked={item.checked}
									className="mt-0.5"
									onCheckedChange={(next) =>
										onFieldChange(
											field.id,
											items.map((current, i) =>
												i === index
													? { ...current, checked: Boolean(next) }
													: current,
											),
										)
									}
								/>
								<Label
									htmlFor={rowId}
									className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed font-normal"
								>
									{item.label}
								</Label>
							</div>
						);
					})}
				</div>
				{invalid ? <FieldError>{invalidMessage}</FieldError> : null}
			</CardContent>
		</Card>
	);
}
