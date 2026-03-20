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

type BrandKitBrandInputsCardProps = {
	title: string;
	description?: string;
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
};

export function BrandKitBrandInputsCard({
	title,
	description,
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: BrandKitBrandInputsCardProps) {
	if (fields.length === 0) return null;

	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">{title}</CardTitle>
				{description ? (
					<CardDescription className="text-sm">{description}</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="pt-0">
				<FieldList
					fields={fields}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
					className="gap-5"
				/>
			</CardContent>
		</Card>
	);
}
