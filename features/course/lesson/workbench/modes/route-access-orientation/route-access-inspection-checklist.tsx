import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";

type Props = {
	field: WorkbenchField | undefined;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid: boolean;
	pinnedArtifacts: PinnedArtifact[];
};

export function RouteAccessInspectionChecklist({
	field,
	value,
	onChange,
	invalid,
	pinnedArtifacts,
}: Props) {
	if (!field) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-base font-semibold">
					Inspection workflow
				</CardTitle>
				<CardDescription>
					Check each step when you’ve done it in the repo and in Codex.
				</CardDescription>
			</CardHeader>
			<div className="px-6 pb-6">
				<FieldControl
					field={field}
					value={value}
					onChange={onChange}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalid}
				/>
			</div>
		</Card>
	);
}
