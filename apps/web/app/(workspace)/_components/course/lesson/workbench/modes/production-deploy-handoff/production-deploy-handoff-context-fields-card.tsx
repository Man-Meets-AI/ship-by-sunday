"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

const DEFAULT_INVALID_MESSAGE = "Finish this before continuing.";

function stringField(value: unknown) {
	return typeof value === "string" ? value : "";
}

export function ProductionDeployHandoffContextFieldsCard({
	productField,
	domainField,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	productField: WorkbenchField;
	domainField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
}) {
	const productInvalid = invalidFieldIds.has(productField.id);
	const domainInvalid = invalidFieldIds.has(domainField.id);
	const productMessage =
		invalidFieldMessages.get(productField.id) ?? DEFAULT_INVALID_MESSAGE;
	const domainMessage =
		invalidFieldMessages.get(domainField.id) ?? DEFAULT_INVALID_MESSAGE;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Product & domain</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor={productField.id}>{productField.label}</Label>
					<Input
						id={productField.id}
						value={stringField(fieldValues[productField.id])}
						onChange={(e) => onFieldChange(productField.id, e.target.value)}
						placeholder={productField.placeholder}
						autoComplete="off"
					/>
					{productInvalid ? <FieldError>{productMessage}</FieldError> : null}
					{productField.helpText ? (
						<p className="max-w-[64ch] text-[13px] leading-[1.7] text-muted-foreground">
							{productField.helpText}
						</p>
					) : null}
				</div>
				<div className="space-y-2">
					<Label htmlFor={domainField.id}>{domainField.label}</Label>
					<Input
						id={domainField.id}
						value={stringField(fieldValues[domainField.id])}
						onChange={(e) => onFieldChange(domainField.id, e.target.value)}
						placeholder={domainField.placeholder}
						autoComplete="off"
					/>
					{domainInvalid ? <FieldError>{domainMessage}</FieldError> : null}
					{domainField.helpText ? (
						<p className="max-w-[64ch] text-[13px] leading-[1.7] text-muted-foreground">
							{domainField.helpText}
						</p>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
