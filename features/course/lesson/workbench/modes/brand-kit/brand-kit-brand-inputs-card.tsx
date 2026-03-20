"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { BrandKitBrandInputsImageField } from "./brand-kit-brand-inputs-image-field";

type BrandKitBrandInputsCardProps = {
	title: string;
	description?: string;
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
};

export function BrandKitBrandInputsCard({
	title,
	description,
	fields,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: BrandKitBrandInputsCardProps) {
	if (fields.length === 0) return null;

	const messages = invalidFieldMessages ?? new Map<string, string>();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{fields.map((field) => {
					const invalid = invalidFieldIds.has(field.id);
					const message =
						messages.get(field.id) ?? "Finish this before continuing.";
					const value = fieldValues[field.id];
					const help =
						field.helpText != null && field.helpText !== "" ? (
							<FieldDescription>{field.helpText}</FieldDescription>
						) : null;

					if (field.kind === "text" || field.kind === "url") {
						return (
							<div key={field.id} className="flex flex-col gap-3">
								<Field data-invalid={invalid || undefined}>
									<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
									{help}
									<FieldContent>
										<Input
											id={field.id}
											type={field.kind === "url" ? "url" : "text"}
											value={typeof value === "string" ? value : ""}
											onChange={(event) =>
												onFieldChange(field.id, event.target.value)
											}
											placeholder={field.placeholder}
											aria-invalid={invalid}
										/>
									</FieldContent>
								</Field>
								{invalid ? <FieldError>{message}</FieldError> : null}
							</div>
						);
					}

					if (field.kind === "textarea") {
						return (
							<div key={field.id} className="flex flex-col gap-3">
								<Field data-invalid={invalid || undefined}>
									<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
									{help}
									<FieldContent>
										<Textarea
											id={field.id}
											value={typeof value === "string" ? value : ""}
											onChange={(event) =>
												onFieldChange(field.id, event.target.value)
											}
											rows={field.rows ?? 5}
											placeholder={field.placeholder}
											aria-invalid={invalid}
										/>
									</FieldContent>
								</Field>
								{invalid ? <FieldError>{message}</FieldError> : null}
							</div>
						);
					}

					if (field.kind === "image_upload") {
						return (
							<div key={field.id} className="flex flex-col gap-3">
								<BrandKitBrandInputsImageField
									field={field}
									value={value}
									onChange={(next) => onFieldChange(field.id, next)}
									help={help}
								/>
								{invalid ? <FieldError>{message}</FieldError> : null}
							</div>
						);
					}

					return null;
				})}
			</CardContent>
		</Card>
	);
}
