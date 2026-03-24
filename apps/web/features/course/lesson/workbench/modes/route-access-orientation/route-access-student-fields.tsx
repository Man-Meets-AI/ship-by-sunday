"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { inputWidthClass } from "../../fields/field-styles";
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
};

export function RouteAccessStudentFields({
	fieldsById,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
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
					if (!field || field.kind !== "textarea") {
						return null;
					}
					const invalid = invalidFieldIds.has(id);
					const help = field.helpText ? (
						<FieldDescription>{field.helpText}</FieldDescription>
					) : null;
					return (
						<Field
							key={id}
							className={inputWidthClass(field)}
							data-invalid={invalid || undefined}
						>
							<FieldLabel htmlFor={id}>{field.label}</FieldLabel>
							{help}
							<FieldContent>
								<Textarea
									id={id}
									value={
										typeof fieldValues[id] === "string"
											? fieldValues[id]
											: ""
									}
									onChange={(event) => onFieldChange(id, event.target.value)}
									rows={field.rows ?? 5}
									placeholder={field.placeholder}
									aria-invalid={invalid}
								/>
							</FieldContent>
						</Field>
					);
				})}
			</div>
		</Card>
	);
}
