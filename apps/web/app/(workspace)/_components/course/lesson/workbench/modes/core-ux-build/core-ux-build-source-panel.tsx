import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";

type Props = {
	blogField: WorkbenchField;
	mimicField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CoreUxBuildSourcePanel({
	blogField,
	mimicField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: Props) {
	return (
		<div className="space-y-4">
			<Card className="border-dashed">
				<CardHeader className="space-y-1 py-3">
					<CardTitle className="text-sm font-medium">
						Feeds the next step
					</CardTitle>
					<CardDescription className="text-xs">
						This lesson ends with setup artifacts—not final post drafts. Ideas
						and generated posts come after inputs are in place.
					</CardDescription>
				</CardHeader>
			</Card>
			<FieldControl
				field={blogField}
				value={fieldValues[blogField.id]}
				onChange={(value) => onFieldChange(blogField.id, value)}
				pinnedArtifacts={pinnedArtifacts}
				invalid={invalidFieldIds.has(blogField.id)}
			/>
			<FieldControl
				field={mimicField}
				value={fieldValues[mimicField.id]}
				onChange={(value) => onFieldChange(mimicField.id, value)}
				pinnedArtifacts={pinnedArtifacts}
				invalid={invalidFieldIds.has(mimicField.id)}
			/>
		</div>
	);
}
