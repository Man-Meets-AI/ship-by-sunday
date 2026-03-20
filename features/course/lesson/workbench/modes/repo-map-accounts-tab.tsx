import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldList } from "../fields/field-list";

import { REPO_ACCOUNTS_FIELD_ID } from "./repo-map-constants";

export function RepoMapAccountsTab({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages?: Map<string, string>;
}) {
	const accountsFields = fields.filter((f) => f.id === REPO_ACCOUNTS_FIELD_ID);

	return (
		<div className="space-y-3">
			<p className="text-sm leading-relaxed text-muted-foreground">
				GitHub is a prerequisite for the starter flow. Check each service when you
				can sign in and complete the basics you will need this weekend.
			</p>
			<FieldList
				fields={accountsFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
		</div>
	);
}
