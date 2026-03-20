"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { FRESH_TEMPLATE_PLAN_FIELD_IDS } from "./fresh-template-plan-constants";

type FreshTemplatePlanCodexOutputCardProps = {
	codexOutput: string;
	onFieldChange: (fieldId: string, value: unknown) => void;
};

export function FreshTemplatePlanCodexOutputCard({
	codexOutput,
	onFieldChange,
}: FreshTemplatePlanCodexOutputCardProps) {
	const ids = FRESH_TEMPLATE_PLAN_FIELD_IDS;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Codex plan (optional)</CardTitle>
				<CardDescription>
					Paste the plan Codex returns so you have it on this lesson.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Textarea
					id={ids.codexOutput}
					className="min-h-[140px] resize-y text-sm"
					placeholder="Paste the implementation plan here after Codex responds…"
					value={codexOutput}
					onChange={(e) => onFieldChange(ids.codexOutput, e.target.value)}
				/>
			</CardContent>
		</Card>
	);
}
