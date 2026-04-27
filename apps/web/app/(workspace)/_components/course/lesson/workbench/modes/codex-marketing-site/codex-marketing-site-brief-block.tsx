import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CODEX_MARKETING_BRIEF_FIELD_ORDER } from "@/lib/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";
import { CodexMarketingSiteMarketingField } from "./codex-marketing-site-marketing-field";

type CodexMarketingSiteBriefBlockProps = {
	fieldsById: Map<string, WorkbenchField>;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function CodexMarketingSiteBriefBlock({
	fieldsById,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: CodexMarketingSiteBriefBlockProps) {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Offer brief</CardTitle>
				<CardDescription>
					One structured pass—pull from your pinned artifacts so you are not
					re-typing the same frame in different words.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 sm:grid-cols-2">
				{CODEX_MARKETING_BRIEF_FIELD_ORDER.map((fieldId) => {
					const field = fieldsById.get(fieldId);
					if (!field) {
						return null;
					}
					const spanTwo = field.kind === "textarea";
					return (
						<div
							key={fieldId}
							className={spanTwo ? "sm:col-span-2" : undefined}
						>
							<CodexMarketingSiteMarketingField
								field={field}
								value={fieldValues[fieldId]}
								onChange={(v) => onFieldChange(fieldId, v)}
								invalid={invalidFieldIds.has(fieldId)}
							/>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
