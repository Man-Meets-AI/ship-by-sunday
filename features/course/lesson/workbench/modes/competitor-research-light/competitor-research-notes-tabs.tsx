"use client";

import { FieldControl } from "@/features/course/lesson/workbench/fields/field-control";
import type { WorkbenchModeProps } from "@/features/course/lesson/workbench/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

export function CompetitorResearchNotesTabs({
	pricingField,
	messagingField,
	productField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	pricingField: WorkbenchField;
	messagingField: WorkbenchField;
	productField: WorkbenchField;
	fieldValues: WorkbenchModeProps["fieldValues"];
	onFieldChange: WorkbenchModeProps["onFieldChange"];
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: WorkbenchModeProps["invalidFieldIds"];
	invalidFieldMessages: WorkbenchModeProps["invalidFieldMessages"];
}) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-foreground">
				Notes by bucket
			</p>
			<Tabs defaultValue="pricing" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="pricing">Pricing</TabsTrigger>
					<TabsTrigger value="messaging">Messaging</TabsTrigger>
					<TabsTrigger value="product">Product</TabsTrigger>
				</TabsList>
				<TabsContent value="pricing" className="pt-3">
					<FieldControl
						field={pricingField}
						value={fieldValues[pricingField.id]}
						onChange={(value) => onFieldChange(pricingField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
						invalid={invalidFieldIds.has(pricingField.id)}
					/>
					{invalidFieldMessages.get(pricingField.id) ? (
						<p className="mt-1 text-sm text-destructive">
							{invalidFieldMessages.get(pricingField.id)}
						</p>
					) : null}
				</TabsContent>
				<TabsContent value="messaging" className="pt-3">
					<FieldControl
						field={messagingField}
						value={fieldValues[messagingField.id]}
						onChange={(value) => onFieldChange(messagingField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
						invalid={invalidFieldIds.has(messagingField.id)}
					/>
					{invalidFieldMessages.get(messagingField.id) ? (
						<p className="mt-1 text-sm text-destructive">
							{invalidFieldMessages.get(messagingField.id)}
						</p>
					) : null}
				</TabsContent>
				<TabsContent value="product" className="pt-3">
					<FieldControl
						field={productField}
						value={fieldValues[productField.id]}
						onChange={(value) => onFieldChange(productField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
						invalid={invalidFieldIds.has(productField.id)}
					/>
					{invalidFieldMessages.get(productField.id) ? (
						<p className="mt-1 text-sm text-destructive">
							{invalidFieldMessages.get(productField.id)}
						</p>
					) : null}
				</TabsContent>
			</Tabs>
		</div>
	);
}
