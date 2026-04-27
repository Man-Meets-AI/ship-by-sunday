"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";

import { FieldList } from "../../fields/field-list";

import {
	CHECKOUT_QA_BROWSER_FIELD_ID,
	CHECKOUT_QA_CURRENT_STEP_FIELD_ID,
	CHECKOUT_QA_LAST_ISSUE_FIELD_ID,
	CHECKOUT_QA_PREFLIGHT_FIELD_ID,
	CHECKOUT_QA_PROMPT_FIELD_ID,
	CHECKOUT_QA_REPORT_FIELD_ID,
	CHECKOUT_QA_SCENARIO_FIELD_ID,
} from "@/lib/course/lesson/workbench/modes/checkout-qa-loop/checkout-qa-loop-constants";
import { CheckoutQaLoopGoalCard } from "./checkout-qa-loop-goal-card";
import { CheckoutQaLoopIssueLogCard } from "./checkout-qa-loop-issue-log-card";
import { CheckoutQaLoopPromptPanel } from "./checkout-qa-loop-prompt-panel";
import { CheckoutQaLoopResourcesCard } from "./checkout-qa-loop-resources-card";
import { CheckoutQaLoopScenarioToggle } from "./checkout-qa-loop-scenario-toggle";
import { CheckoutQaLoopStaticPanels } from "./checkout-qa-loop-static-panels";
import { CheckoutQaLoopStatusRow } from "./checkout-qa-loop-status-row";
import { CheckoutQaLoopSteerCard } from "./checkout-qa-loop-steer-card";

function str(value: unknown) {
	return typeof value === "string" ? value : "";
}

export function CheckoutQaLoopTabPanels({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
}: {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
}) {
	const preflightField = fields.find(
		(field) => field.id === CHECKOUT_QA_PREFLIGHT_FIELD_ID,
	);
	const reportField = fields.find(
		(field) => field.id === CHECKOUT_QA_REPORT_FIELD_ID,
	);
	const browserOn = Boolean(fieldValues[CHECKOUT_QA_BROWSER_FIELD_ID]);

	return (
		<Tabs defaultValue="prompt" className="w-full gap-4">
			<TabsList>
				<TabsTrigger value="prompt">Prompt</TabsTrigger>
				<TabsTrigger value="issues">Issues</TabsTrigger>
				<TabsTrigger value="resources">Resources</TabsTrigger>
			</TabsList>
			<TabsContent value="prompt" className="space-y-5">
				<CheckoutQaLoopGoalCard />
				<CheckoutQaLoopScenarioToggle
					value={fieldValues[CHECKOUT_QA_SCENARIO_FIELD_ID]}
					onChange={(value) =>
						onFieldChange(CHECKOUT_QA_SCENARIO_FIELD_ID, value)
					}
				/>
				{preflightField ? (
					<FieldList
						fields={[preflightField]}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
						invalidFieldMessages={invalidFieldMessages}
					/>
				) : null}
				<CheckoutQaLoopPromptPanel
					value={fieldValues[CHECKOUT_QA_PROMPT_FIELD_ID]}
					onChange={(value) =>
						onFieldChange(CHECKOUT_QA_PROMPT_FIELD_ID, value)
					}
				/>
				<CheckoutQaLoopStatusRow
					browserOn={browserOn}
					onBrowserChange={(value) =>
						onFieldChange(CHECKOUT_QA_BROWSER_FIELD_ID, value)
					}
					currentStep={str(fieldValues[CHECKOUT_QA_CURRENT_STEP_FIELD_ID])}
					lastIssue={str(fieldValues[CHECKOUT_QA_LAST_ISSUE_FIELD_ID])}
					onCurrentStepChange={(value) =>
						onFieldChange(CHECKOUT_QA_CURRENT_STEP_FIELD_ID, value)
					}
					onLastIssueChange={(value) =>
						onFieldChange(CHECKOUT_QA_LAST_ISSUE_FIELD_ID, value)
					}
				/>
				<CheckoutQaLoopStaticPanels />
			</TabsContent>
			<TabsContent value="issues" className="space-y-5">
				<CheckoutQaLoopIssueLogCard />
				<CheckoutQaLoopSteerCard />
				{reportField ? (
					<FieldList
						fields={[reportField]}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
						invalidFieldMessages={invalidFieldMessages}
					/>
				) : null}
			</TabsContent>
			<TabsContent value="resources" className="space-y-5">
				<CheckoutQaLoopResourcesCard />
			</TabsContent>
		</Tabs>
	);
}
