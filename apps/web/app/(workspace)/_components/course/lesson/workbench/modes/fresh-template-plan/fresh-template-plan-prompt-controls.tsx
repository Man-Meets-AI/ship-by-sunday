"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { buildFreshTemplatePlanPrompt } from "./build-fresh-template-plan-prompt";
import { FreshTemplatePlanCodexOutput } from "./fresh-template-plan-codex-output";
import {
	FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT,
	FRESH_TEMPLATE_PLAN_FIELD_IDS,
	parseFreshTemplatePlanReasoning,
} from "@/lib/course/lesson/workbench/modes/fresh-template-plan/fresh-template-plan-constants";
import { readBool, readString } from "./fresh-template-plan-field-utils";
import { FreshTemplatePlanReasoningField } from "./fresh-template-plan-reasoning-field";
import { FreshTemplatePlanStackAndPath } from "./fresh-template-plan-stack-and-path";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Planning prompt copied");
	} catch {
		toast.error("Could not copy—try selecting the text manually");
	}
}

type FreshTemplatePlanPromptControlsProps = {
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function FreshTemplatePlanPromptControls({
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: FreshTemplatePlanPromptControlsProps) {
	const ids = FRESH_TEMPLATE_PLAN_FIELD_IDS;
	const rawManual = fieldValues[ids.manualPrompt];
	const manual =
		rawManual === undefined || rawManual === null
			? FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT
			: typeof rawManual === "string"
				? rawManual
				: FRESH_TEMPLATE_PLAN_DEFAULT_MANUAL_PROMPT;
	const reasoning = parseFreshTemplatePlanReasoning(fieldValues[ids.reasoning]);
	const referencePath = readString(fieldValues[ids.referencePath]);
	const includeConvex = readBool(fieldValues[ids.includeConvex]);
	const includeNextjs = readBool(fieldValues[ids.includeNextjs]);
	const includeClerk = readBool(fieldValues[ids.includeClerk]);
	const includeStripe = readBool(fieldValues[ids.includeStripe]);
	const stackOther = readString(fieldValues[ids.stackOther]);
	const codexOutput = readString(fieldValues[ids.codexOutput]);

	const assembled = buildFreshTemplatePlanPrompt({
		manualBody: manual,
		reasoning,
		referencePath,
		includeConvex,
		includeNextjs,
		includeClerk,
		includeStripe,
		stackOther,
	});

	const manualInvalid = invalidFieldIds.has(ids.manualPrompt);
	const reasoningInvalid = invalidFieldIds.has(ids.reasoning);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-base">Planning prompt</CardTitle>
					<CardDescription>
						Reasoning depth and stack flags are appended when you copy—keep the
						body in your own words if you want.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<FreshTemplatePlanReasoningField
						reasoning={reasoning}
						invalid={reasoningInvalid}
						onReasoningChange={(v) => onFieldChange(ids.reasoning, v)}
					/>
					<FreshTemplatePlanStackAndPath
						referencePath={referencePath}
						stackOther={stackOther}
						includeConvex={includeConvex}
						includeNextjs={includeNextjs}
						includeClerk={includeClerk}
						includeStripe={includeStripe}
						onFieldChange={onFieldChange}
					/>
					<Field data-invalid={manualInvalid ? true : undefined}>
						<FieldLabel htmlFor={ids.manualPrompt}>
							Manual planning prompt
						</FieldLabel>
						<FieldContent>
							<Textarea
								id={ids.manualPrompt}
								className="min-h-[120px] resize-y text-sm"
								value={manual}
								onChange={(e) =>
									onFieldChange(ids.manualPrompt, e.target.value)
								}
								aria-invalid={manualInvalid}
							/>
						</FieldContent>
					</Field>
					<Button
						type="button"
						variant="secondary"
						className="w-full sm:w-auto"
						onClick={() => writeClipboard(assembled)}
					>
						Copy planning prompt
					</Button>
				</CardContent>
			</Card>

			<FreshTemplatePlanCodexOutput
				codexOutput={codexOutput}
				onFieldChange={onFieldChange}
			/>
		</div>
	);
}
