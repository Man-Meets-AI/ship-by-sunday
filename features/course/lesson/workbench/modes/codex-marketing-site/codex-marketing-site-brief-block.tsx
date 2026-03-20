import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CODEX_MARKETING_BRIEF_FIELD_ORDER } from "./codex-marketing-site-constants";
import { FieldControl } from "../../fields/field-control";

type CodexMarketingSiteBriefBlockProps = {
	fieldsById: Map<string, WorkbenchField>;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CodexMarketingSiteBriefBlock({
	fieldsById,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
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
							<FieldControl
								field={field}
								value={fieldValues[fieldId]}
								onChange={(v) => onFieldChange(fieldId, v)}
								pinnedArtifacts={pinnedArtifacts}
								invalid={invalidFieldIds.has(fieldId)}
							/>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
