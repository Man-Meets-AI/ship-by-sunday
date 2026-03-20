import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { CoreUxBuildBrandPanel } from "./core-ux-build-brand-panel";
import { CoreUxBuildSourcePanel } from "./core-ux-build-source-panel";
import { CoreUxBuildStrategyPanel } from "./core-ux-build-strategy-panel";

type Props = {
	strategyField: WorkbenchField;
	brandField: WorkbenchField;
	blogField: WorkbenchField;
	mimicField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CoreUxBuildTabsPanel(props: Props) {
	const {
		strategyField,
		brandField,
		blogField,
		mimicField,
		fieldValues,
		onFieldChange,
		pinnedArtifacts,
		invalidFieldIds,
	} = props;

	return (
		<Tabs defaultValue="strategy" className="w-full">
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="strategy">Strategy</TabsTrigger>
				<TabsTrigger value="brand">Brand</TabsTrigger>
				<TabsTrigger value="source">Source</TabsTrigger>
			</TabsList>
			<TabsContent value="strategy" className="mt-4">
				<CoreUxBuildStrategyPanel
					strategyField={strategyField}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			</TabsContent>
			<TabsContent value="brand" className="mt-4">
				<CoreUxBuildBrandPanel
					brandField={brandField}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			</TabsContent>
			<TabsContent value="source" className="mt-4">
				<CoreUxBuildSourcePanel
					blogField={blogField}
					mimicField={mimicField}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
				/>
			</TabsContent>
		</Tabs>
	);
}
