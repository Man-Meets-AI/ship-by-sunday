import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldList } from "../../fields/field-list";

type BrandKitChecklistCardProps = {
	field: WorkbenchField | undefined;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
};

export function BrandKitChecklistCard({
	field,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: BrandKitChecklistCardProps) {
	if (!field) return null;

	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">
					Artifact checklist
				</CardTitle>
				<CardDescription className="text-sm">
					Check each line when the file or setting is actually done—not when you
					only watched the step.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<FieldList
					fields={[field]}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			</CardContent>
		</Card>
	);
}
