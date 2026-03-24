"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { FieldControl } from "../../fields/field-control";
import type { WorkbenchModeProps } from "../../types";

import {
	BUILD_SHIP_ROADMAP_FIELD_IDS,
	SERVICE_ACCOUNT_CHECKLIST_OPTIONS,
	SCOPE_CHECKLIST_OPTIONS,
} from "./build-ship-roadmap-constants";
import { BuildShipRoadmapChecklistCard } from "./build-ship-roadmap-checklist-card";

function pickField(fields: WorkbenchField[], id: string) {
	return fields.find((f) => f.id === id) ?? null;
}

const SERVICE_ACCOUNT_BADGES = Object.fromEntries(
	SERVICE_ACCOUNT_CHECKLIST_OPTIONS.map((label) => [
		label,
		"required" as const,
	]),
);

const SCOPE_BADGES = Object.fromEntries(
	SCOPE_CHECKLIST_OPTIONS.map((label) => [label, "required" as const]),
);

export function BuildShipRoadmapOutputs({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: Pick<
	WorkbenchModeProps,
	| "fields"
	| "fieldValues"
	| "onFieldChange"
	| "pinnedArtifacts"
	| "invalidFieldIds"
>) {
	const renderField = (field: WorkbenchField | null) =>
		field ? (
			<FieldControl
				key={field.id}
				field={field}
				value={fieldValues[field.id]}
				onChange={(value) => onFieldChange(field.id, value)}
				pinnedArtifacts={pinnedArtifacts}
				invalid={invalidFieldIds.has(field.id)}
			/>
		) : null;

	return (
		<div className="space-y-4">
			<BuildShipRoadmapChecklistCard
				title="Account readiness"
				description="Create accounts in each dashboard—do not store passwords here."
				options={SERVICE_ACCOUNT_CHECKLIST_OPTIONS}
				badges={SERVICE_ACCOUNT_BADGES}
				value={
					fieldValues[BUILD_SHIP_ROADMAP_FIELD_IDS.serviceAccountsChecklist]
				}
				onChange={(next) =>
					onFieldChange(
						BUILD_SHIP_ROADMAP_FIELD_IDS.serviceAccountsChecklist,
						next,
					)
				}
				invalid={invalidFieldIds.has(
					BUILD_SHIP_ROADMAP_FIELD_IDS.serviceAccountsChecklist,
				)}
			/>
			<BuildShipRoadmapChecklistCard
				title="Scope decision"
				description="Confirm what you are shipping this week."
				options={SCOPE_CHECKLIST_OPTIONS}
				badges={SCOPE_BADGES}
				value={fieldValues[BUILD_SHIP_ROADMAP_FIELD_IDS.scopeChecklist]}
				onChange={(next) =>
					onFieldChange(BUILD_SHIP_ROADMAP_FIELD_IDS.scopeChecklist, next)
				}
				invalid={invalidFieldIds.has(
					BUILD_SHIP_ROADMAP_FIELD_IDS.scopeChecklist,
				)}
			/>
			{renderField(
				pickField(fields, BUILD_SHIP_ROADMAP_FIELD_IDS.marketingBrief),
			)}
			{renderField(
				pickField(fields, BUILD_SHIP_ROADMAP_FIELD_IDS.preferredDomain),
			)}
			{renderField(
				pickField(fields, BUILD_SHIP_ROADMAP_FIELD_IDS.supportEmail),
			)}
			{renderField(pickField(fields, BUILD_SHIP_ROADMAP_FIELD_IDS.loggingPlan))}
			{renderField(
				pickField(fields, BUILD_SHIP_ROADMAP_FIELD_IDS.firstTesters),
			)}
		</div>
	);
}
