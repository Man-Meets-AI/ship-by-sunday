import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";
import { ROUTE_ACCESS_FIELD_IDS } from "./route-access-orientation-constants";

const ORDER: (keyof typeof ROUTE_ACCESS_FIELD_IDS)[] = [
	"pagesPublic",
	"pagesPaywall",
	"routeMap",
	"accessStackNote",
	"routesToChange",
];

type Props = {
	fieldsById: Map<string, WorkbenchField>;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	pinnedArtifacts: PinnedArtifact[];
};

export function RouteAccessStudentFields({
	fieldsById,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	pinnedArtifacts,
}: Props) {
	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-base font-semibold">
					Your route-access notes
				</CardTitle>
				<CardDescription>
					Lightweight outputs: what stays public, what sits behind the paywall,
					how the template gates access, and what you might change later.
				</CardDescription>
			</CardHeader>
			<div className="space-y-5 px-6 pb-6">
				{ORDER.map((key) => {
					const id = ROUTE_ACCESS_FIELD_IDS[key];
					const field = fieldsById.get(id);
					if (!field) {
						return null;
					}
					return (
						<FieldControl
							key={id}
							field={field}
							value={fieldValues[id]}
							onChange={(next) => onFieldChange(id, next)}
							pinnedArtifacts={pinnedArtifacts}
							invalid={invalidFieldIds.has(id)}
						/>
					);
				})}
			</div>
		</Card>
	);
}
