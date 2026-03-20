import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CODEX_MARKETING_SITE_FIELD_IDS } from "./codex-marketing-site-constants";
import { FieldControl } from "../../fields/field-control";

type CodexMarketingSiteStyleWorkflowProps = {
	styleField: WorkbenchField | undefined;
	workflowField: WorkbenchField | undefined;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CodexMarketingSiteStyleWorkflow({
	styleField,
	workflowField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: CodexMarketingSiteStyleWorkflowProps) {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Style reference + workflow</CardTitle>
				<CardDescription>
					Optional URL for visual direction, then tick through the ship loop.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{styleField ? (
					<div className="space-y-2">
						<FieldControl
							field={styleField}
							value={fieldValues[CODEX_MARKETING_SITE_FIELD_IDS.styleReferenceUrl]}
							onChange={(v) =>
								onFieldChange(CODEX_MARKETING_SITE_FIELD_IDS.styleReferenceUrl, v)
							}
							pinnedArtifacts={pinnedArtifacts}
							invalid={invalidFieldIds.has(styleField.id)}
						/>
						<p className="text-xs text-muted-foreground">
							Use any marketing site you like—note fonts, spacing, and color
							relationships, then apply your own brand.
						</p>
					</div>
				) : null}
				{styleField && workflowField ? <Separator /> : null}
				{workflowField ? (
					<FieldControl
						field={workflowField}
						value={fieldValues[CODEX_MARKETING_SITE_FIELD_IDS.workflow]}
						onChange={(v) =>
							onFieldChange(CODEX_MARKETING_SITE_FIELD_IDS.workflow, v)
						}
						pinnedArtifacts={pinnedArtifacts}
						invalid={invalidFieldIds.has(workflowField.id)}
					/>
				) : null}
			</CardContent>
		</Card>
	);
}
