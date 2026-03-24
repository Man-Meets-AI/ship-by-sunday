"use client";

import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { WorkbenchModeProps } from "@/features/course/lesson/workbench/types";

type CompetitorResearchNotesTabsProps = {
	pricingField: WorkbenchField;
	messagingField: WorkbenchField;
	productField: WorkbenchField;
	fieldValues: WorkbenchModeProps["fieldValues"];
	onFieldChange: WorkbenchModeProps["onFieldChange"];
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: WorkbenchModeProps["invalidFieldIds"];
	invalidFieldMessages: WorkbenchModeProps["invalidFieldMessages"];
};

export function CompetitorResearchNotesTabs({
	pricingField,
	messagingField,
	productField,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: CompetitorResearchNotesTabsProps) {
	const noteTabs = [
		{ value: "pricing", label: "Pricing", field: pricingField },
		{ value: "messaging", label: "Messaging", field: messagingField },
		{ value: "product", label: "Product", field: productField },
	] as const;

	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium text-foreground">
				Notes by bucket
			</Label>
			<Tabs defaultValue="pricing" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					{noteTabs.map(({ value, label }) => (
						<TabsTrigger key={value} value={value}>
							{label}
						</TabsTrigger>
					))}
				</TabsList>
				{noteTabs.map(({ value, field }) => {
					const invalid = invalidFieldIds.has(field.id);
					const message = invalidFieldMessages.get(field.id);
					const currentValue = fieldValues[field.id];
					const textValue =
						typeof currentValue === "string" ? currentValue : "";

					return (
						<TabsContent key={value} value={value} className="pt-3">
							<Field className="w-full" data-invalid={invalid || undefined}>
								<FieldContent>
									<Textarea
										id={field.id}
										value={textValue}
										onChange={(event) =>
											onFieldChange(field.id, event.target.value)
										}
										rows={field.rows ?? 5}
										placeholder={field.placeholder}
										aria-invalid={invalid}
									/>
								</FieldContent>
								{message ? <FieldError>{message}</FieldError> : null}
							</Field>
						</TabsContent>
					);
				})}
			</Tabs>
		</div>
	);
}
