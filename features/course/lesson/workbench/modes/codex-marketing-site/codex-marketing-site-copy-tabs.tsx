import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CODEX_MARKETING_COPY_TAB_CONFIG } from "./codex-marketing-site-constants";
import { CodexMarketingSiteMarketingField } from "./codex-marketing-site-marketing-field";

type CodexMarketingSiteCopyTabsProps = {
	fieldsById: Map<string, WorkbenchField>;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function CodexMarketingSiteCopyTabs({
	fieldsById,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: CodexMarketingSiteCopyTabsProps) {
	const defaultTab = CODEX_MARKETING_COPY_TAB_CONFIG[0]?.tabValue ?? "eyebrow";

	return (
		<Tabs defaultValue={defaultTab} className="w-full gap-4">
			<TabsList className="h-auto w-full flex-wrap justify-start gap-1">
				{CODEX_MARKETING_COPY_TAB_CONFIG.map((tab) => (
					<TabsTrigger key={tab.tabValue} value={tab.tabValue}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			<Separator className="bg-border" />
			{CODEX_MARKETING_COPY_TAB_CONFIG.map((tab) => {
				const field = fieldsById.get(tab.fieldId);
				if (!field) {
					return null;
				}
				return (
					<TabsContent key={tab.tabValue} value={tab.tabValue} className="pt-1">
						<CodexMarketingSiteMarketingField
							field={field}
							value={fieldValues[tab.fieldId]}
							onChange={(v) => onFieldChange(tab.fieldId, v)}
							invalid={invalidFieldIds.has(tab.fieldId)}
						/>
					</TabsContent>
				);
			})}
		</Tabs>
	);
}
