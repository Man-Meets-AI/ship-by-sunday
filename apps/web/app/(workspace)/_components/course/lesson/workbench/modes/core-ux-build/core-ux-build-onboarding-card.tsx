import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";
import { CoreUxBuildAlerts } from "./core-ux-build-alerts";
import { CoreUxBuildConnectRow } from "./core-ux-build-connect-row";

type Props = {
	checklistField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

export function CoreUxBuildOnboardingCard({
	checklistField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: Props) {
	const invalid = invalidFieldIds.has(checklistField.id);
	const message =
		invalidFieldMessages.get(checklistField.id) ??
		"Complete all three onboarding lines when each is true.";

	return (
		<Card>
			<CardHeader className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base">Onboarding</CardTitle>
					<Badge variant="secondary">Required</Badge>
				</div>
				<CardDescription>
					The checklist is the source of truth—connection status above is a hint
					when you return from Settings.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<CoreUxBuildAlerts />
				<CoreUxBuildConnectRow />
				<FieldControl
					field={checklistField}
					value={fieldValues[checklistField.id]}
					onChange={(value) => onFieldChange(checklistField.id, value)}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalid}
				/>
				{invalid ? <p className="text-sm text-destructive">{message}</p> : null}
			</CardContent>
		</Card>
	);
}
