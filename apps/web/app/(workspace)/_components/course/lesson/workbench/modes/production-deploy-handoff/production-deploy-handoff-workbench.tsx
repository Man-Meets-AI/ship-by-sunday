"use client";

import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaPlacement } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { ProductionDeployHandoffBeforeDeployCard } from "./production-deploy-handoff-before-deploy-card";
import { ProductionDeployHandoffChecklistCard } from "./production-deploy-handoff-checklist-card";
import { ProductionDeployHandoffContextFieldsCard } from "./production-deploy-handoff-context-fields-card";
import { ProductionDeployHandoffDeployAlerts } from "./production-deploy-handoff-deploy-alerts";
import {
	DEPLOY_DOMAIN_FIELD_ID,
	DEPLOY_PRODUCT_NAME_FIELD_ID,
	DEPLOY_STEPS_FIELD_ID,
	DEPLOY_SUCCESS_FIELD_ID,
} from "@/lib/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-constants";
import { ProductionDeployHandoffProviderAccordion } from "./production-deploy-handoff-provider-accordion";
import { ProductionDeployHandoffReadmePromptCard } from "./production-deploy-handoff-readme-prompt-card";
import { ProductionDeployHandoffSecretsPanel } from "./production-deploy-handoff-secrets-panel";
import { ProductionDeployHandoffSuccessCard } from "./production-deploy-handoff-success-card";

function stringField(value: unknown) {
	return typeof value === "string" ? value : "";
}

export function ProductionDeployHandoffWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	layoutMode,
}: WorkbenchModeProps) {
	const stepsField = fields.find((field) => field.id === DEPLOY_STEPS_FIELD_ID);
	const productField = fields.find(
		(field) => field.id === DEPLOY_PRODUCT_NAME_FIELD_ID,
	);
	const domainField = fields.find(
		(field) => field.id === DEPLOY_DOMAIN_FIELD_ID,
	);
	const successField = fields.find(
		(field) => field.id === DEPLOY_SUCCESS_FIELD_ID,
	);

	const productName = stringField(fieldValues[DEPLOY_PRODUCT_NAME_FIELD_ID]);
	const domain = stringField(fieldValues[DEPLOY_DOMAIN_FIELD_ID]);

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<ProductionDeployHandoffBeforeDeployCard />
			<ProductionDeployHandoffDeployAlerts />
			{stepsField ? (
				<ProductionDeployHandoffChecklistCard
					field={stepsField}
					fieldValue={fieldValues[stepsField.id]}
					onFieldChange={onFieldChange}
					invalid={invalidFieldIds.has(stepsField.id)}
					invalidMessage={invalidFieldMessages.get(stepsField.id)}
				/>
			) : (
				<p className="text-sm text-muted-foreground">
					Deployment steps checklist is not configured for this lesson.
				</p>
			)}
			<ProductionDeployHandoffProviderAccordion />
			<ProductionDeployHandoffReadmePromptCard
				productName={productName}
				domain={domain}
			/>
			<Separator />
			{productField && domainField ? (
				<ProductionDeployHandoffContextFieldsCard
					productField={productField}
					domainField={domainField}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			) : null}
			<ProductionDeployHandoffSecretsPanel
				productName={productName}
				domain={domain}
			/>
			<ProductionDeployHandoffSuccessCard
				field={successField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			<WorkbenchMediaPlacement
				lesson={lesson}
				layoutMode={layoutMode}
				media={inlineVideoCard}
			>
				{mainColumn}
			</WorkbenchMediaPlacement>
		</WorkbenchContainer>
	);
}
