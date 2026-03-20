"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
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
import { copyRouteAccessText } from "./route-access-orientation-clipboard";
import { ROUTE_ACCESS_CODEX_PROMPT_DEFAULT } from "./route-access-orientation-constants";

type Props = {
	field: WorkbenchField | undefined;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid: boolean;
};

export function RouteAccessCodexPromptCard({
	field,
	value,
	onChange,
	invalid,
}: Props) {
	if (!field || field.kind !== "textarea") {
		return null;
	}

	const text =
		typeof value === "string" && value.trim()
			? value
			: ROUTE_ACCESS_CODEX_PROMPT_DEFAULT;

	const help = field.helpText ? (
		<FieldDescription>{field.helpText}</FieldDescription>
	) : null;

	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-base font-semibold">
					Codex prompt (copy into a new thread)
				</CardTitle>
				<CardDescription>
					Paste this, read the answer, then follow the checklist to rename and
					pin the thread.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Field
					className={inputWidthClass(field)}
					data-invalid={invalid || undefined}
				>
					<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
					{help}
					<FieldContent>
						<Textarea
							id={field.id}
							value={typeof value === "string" ? value : ""}
							onChange={(event) => onChange(event.target.value)}
							rows={field.rows ?? 5}
							placeholder={field.placeholder}
							aria-invalid={invalid}
						/>
					</FieldContent>
				</Field>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => copyRouteAccessText("Prompt copied", text)}
				>
					Copy prompt
				</Button>
			</CardContent>
		</Card>
	);
}
