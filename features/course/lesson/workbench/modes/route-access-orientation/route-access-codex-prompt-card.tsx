"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";
import { copyRouteAccessText } from "./route-access-orientation-clipboard";
import { ROUTE_ACCESS_CODEX_PROMPT_DEFAULT } from "./route-access-orientation-constants";

type Props = {
	field: WorkbenchField | undefined;
	value: unknown;
	onChange: (value: unknown) => void;
	invalid: boolean;
	pinnedArtifacts: PinnedArtifact[];
};

export function RouteAccessCodexPromptCard({
	field,
	value,
	onChange,
	invalid,
	pinnedArtifacts,
}: Props) {
	if (!field) {
		return null;
	}

	const text =
		typeof value === "string" && value.trim()
			? value
			: ROUTE_ACCESS_CODEX_PROMPT_DEFAULT;

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
				<FieldControl
					field={field}
					value={value}
					onChange={onChange}
					pinnedArtifacts={pinnedArtifacts}
					invalid={invalid}
				/>
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
