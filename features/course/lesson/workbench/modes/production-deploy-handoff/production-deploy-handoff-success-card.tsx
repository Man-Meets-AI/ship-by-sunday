"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldList } from "../../fields/field-list";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

export function ProductionDeployHandoffSuccessCard({
	field,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	field: WorkbenchField | undefined;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
}) {
	if (!field) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Success checks</CardTitle>
				<CardDescription>
					Optional tracking—tick these when you have verified each item.
				</CardDescription>
			</CardHeader>
			<CardContent>
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
