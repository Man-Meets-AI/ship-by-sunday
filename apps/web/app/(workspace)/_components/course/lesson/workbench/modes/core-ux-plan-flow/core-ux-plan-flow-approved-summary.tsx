"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { WorkbenchModeProps } from "../../types";

import {
	CORE_UX_PLAN_FIELD_IDS,
	CORE_UX_PLAN_BRIEF_FIELD_IDS,
} from "@/lib/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";
import { CoreUxPlanFlowShadcnFields } from "./core-ux-plan-flow-shadcn-fields";

function str(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function pickBriefFields(props: WorkbenchModeProps) {
	const set = new Set(CORE_UX_PLAN_BRIEF_FIELD_IDS);
	return props.fields.filter((f) => set.has(f.id));
}

function buildCompactSummary(values: Record<string, unknown>) {
	const slices = str(values[CORE_UX_PLAN_FIELD_IDS.planSlices]);
	const install = str(values[CORE_UX_PLAN_FIELD_IDS.installDestination]);
	const firstSliceLine = slices
		.split("\n")
		.map((l) => l.trim())
		.find(Boolean);
	const parts = [
		firstSliceLine ? `Slices: ${firstSliceLine}` : null,
		install ? `Install path: ${install}` : null,
	].filter(Boolean);
	return parts.length > 0
		? parts.join(" · ")
		: "Fill your plan brief below to see a compact snapshot here.";
}

export function CoreUxPlanFlowApprovedSummary(props: WorkbenchModeProps) {
	const briefFields = pickBriefFields(props);
	const summary = buildCompactSummary(props.fieldValues);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Approved v1 plan snapshot</CardTitle>
				<CardDescription>
					Compact view first—expand for the full brief you will hand to
					implementation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<AlertDescription className="text-sm leading-relaxed text-foreground">
						{summary}
					</AlertDescription>
				</Alert>
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="full-plan">
						<AccordionTrigger className="text-sm">
							Full plan brief (slices, areas, risks, dependencies)
						</AccordionTrigger>
						<AccordionContent>
							{briefFields.length > 0 ? (
								<CoreUxPlanFlowShadcnFields
									fields={briefFields}
									fieldValues={props.fieldValues}
									onFieldChange={props.onFieldChange}
									pinnedArtifacts={props.pinnedArtifacts}
									invalidFieldIds={props.invalidFieldIds}
									invalidFieldMessages={props.invalidFieldMessages}
								/>
							) : (
								<p className="text-sm text-muted-foreground">
									Plan fields are not configured for this lesson.
								</p>
							)}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
