"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { BUILD_PRODUCT_ITERATION_FIELD_IDS } from "./build-product-iteration-constants";
import { BuildProductIterationOutputsTab } from "./build-product-iteration-outputs-tab";
import { BuildProductIterationSetupTab } from "./build-product-iteration-setup-tab";
import { BuildProductIterationWorkflowTab } from "./build-product-iteration-workflow-tab";

type BuildProductIterationTabsProps = {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

export function BuildProductIterationTabs({
	fields,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: BuildProductIterationTabsProps) {
	const checklistField = fields.find(
		(f) => f.id === BUILD_PRODUCT_ITERATION_FIELD_IDS.setupChecklist,
	);
	const fieldsById = new Map(fields.map((f) => [f.id, f]));

	return (
		<Tabs defaultValue="setup" className="w-full gap-4">
			<TabsList
				variant="line"
				className="h-auto w-full flex-wrap justify-start gap-1"
			>
				<TabsTrigger value="setup">Setup</TabsTrigger>
				<TabsTrigger value="workflow">Iteration workflow</TabsTrigger>
				<TabsTrigger value="outputs">Outputs</TabsTrigger>
			</TabsList>
			<Separator className="bg-border" />
			<TabsContent value="setup" className="space-y-4">
				{checklistField ? (
					<BuildProductIterationSetupTab
						checklistField={checklistField}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						invalidFieldIds={invalidFieldIds}
						invalidFieldMessages={invalidFieldMessages}
					/>
				) : null}
			</TabsContent>
			<TabsContent value="workflow">
				<BuildProductIterationWorkflowTab />
			</TabsContent>
			<TabsContent value="outputs">
				<BuildProductIterationOutputsTab
					fieldsById={fieldsById}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			</TabsContent>
		</Tabs>
	);
}
