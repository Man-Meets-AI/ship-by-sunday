"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { WorkbenchModeProps } from "../../types";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";

import { CODEX_MARKETING_SITE_FIELD_IDS } from "@/lib/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";
import { CodexMarketingSiteAdvancedAccordion } from "./codex-marketing-site-advanced-accordion";
import { CodexMarketingSiteBriefBlock } from "./codex-marketing-site-brief-block";
import { CodexMarketingSiteCommandsCard } from "./codex-marketing-site-commands-card";
import { CodexMarketingSiteCopyTabs } from "./codex-marketing-site-copy-tabs";
import { CodexMarketingSiteDependenciesCard } from "./codex-marketing-site-dependencies-card";
import { CodexMarketingSiteHandoffCard } from "./codex-marketing-site-handoff-card";
import { CodexMarketingSiteLessonVideo } from "./codex-marketing-site-lesson-video";
import { CodexMarketingSitePinnedSummary } from "./codex-marketing-site-pinned-summary";
import { CodexMarketingSitePlanModeAlert } from "./codex-marketing-site-plan-mode-alert";
import { CodexMarketingSitePromptCard } from "./codex-marketing-site-prompt-card";
import { CodexMarketingSiteStyleWorkflow } from "./codex-marketing-site-style-workflow";

export function CodexMarketingSiteWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	layoutMode,
	invalidFieldIds,
	fields,
}: WorkbenchModeProps) {
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const fieldsById = new Map(fields.map((f) => [f.id, f]));
	const styleField = fieldsById.get(
		CODEX_MARKETING_SITE_FIELD_IDS.styleReferenceUrl,
	);
	const workflowField = fieldsById.get(CODEX_MARKETING_SITE_FIELD_IDS.workflow);

	const inlineVideoCard = (
		<CodexMarketingSiteLessonVideo coachContent={lessonContent.coach} />
	);

	const body = (
		<div className="space-y-6">
			<Alert>
				<AlertDescription className="text-xs text-muted-foreground">
					One prompt, one conversational copy pass, optional style URL, then
					commit and push—keep scope tight.
				</AlertDescription>
			</Alert>
			<CodexMarketingSiteDependenciesCard />
			<CodexMarketingSitePinnedSummary pinnedArtifacts={pinnedArtifacts} />
			<CodexMarketingSitePlanModeAlert />
			<CodexMarketingSitePromptCard />
			<CodexMarketingSiteBriefBlock
				fieldsById={fieldsById}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
			<CodexMarketingSiteCopyTabs
				fieldsById={fieldsById}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
			<CodexMarketingSiteStyleWorkflow
				styleField={styleField}
				workflowField={workflowField}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
			/>
			<CodexMarketingSiteCommandsCard />
			<CodexMarketingSiteAdvancedAccordion />
			<CodexMarketingSiteHandoffCard />
		</div>
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					{body}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{body}
				</>
			) : (
				body
			)}
		</div>
	);
}
