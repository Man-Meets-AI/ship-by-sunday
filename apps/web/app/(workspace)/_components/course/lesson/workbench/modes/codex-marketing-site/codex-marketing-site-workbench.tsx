"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { WorkbenchModeProps } from "../../types";

import { CODEX_MARKETING_SITE_FIELD_IDS } from "@/lib/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";
import { CodexMarketingSiteAdvancedAccordion } from "./codex-marketing-site-advanced-accordion";
import { CodexMarketingSiteBriefBlock } from "./codex-marketing-site-brief-block";
import { CodexMarketingSiteCommandsCard } from "./codex-marketing-site-commands-card";
import { CodexMarketingSiteCopyTabs } from "./codex-marketing-site-copy-tabs";
import { CodexMarketingSiteDependenciesCard } from "./codex-marketing-site-dependencies-card";
import { CodexMarketingSiteHandoffCard } from "./codex-marketing-site-handoff-card";
import { CodexMarketingSiteLessonVideo } from "./codex-marketing-site-lesson-video";
import { CodexMarketingSitePageHeader } from "./codex-marketing-site-page-header";
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
			<CodexMarketingSitePageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
					<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
						{inlineVideoCard}
					</div>
					<div className="min-w-0">{body}</div>
				</div>
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
