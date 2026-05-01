"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FieldList } from "../../fields/field-list";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaPlacement } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { SkillsCategoryTabs } from "./skills-category-tabs";
import { SkillsCustomSkillsAccordion } from "./skills-custom-skills-accordion";
import { SkillsDecisionRuleCard } from "./skills-decision-rule-card";
import { SkillsHowItWorksCard } from "./skills-how-it-works-card";
import { SkillsPromptPatternCard } from "./skills-prompt-pattern-card";
import { SkillsQaBrowserAlert } from "./skills-qa-browser-alert";
import { SkillsResourcesRow } from "./skills-resources-row";
import { SkillsShippedFirstCard } from "./skills-shipped-first-card";

export function SkillsQuickstartWorkbench({
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
	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<SkillsHowItWorksCard />
			<SkillsDecisionRuleCard />
			<SkillsCategoryTabs />
			<SkillsPromptPatternCard />
			<SkillsQaBrowserAlert />
			<SkillsShippedFirstCard />
			<SkillsCustomSkillsAccordion />
			<SkillsResourcesRow />
			<Card>
				<CardHeader>
					<CardTitle>Your checklist</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldList
						fields={fields}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
						invalidFieldMessages={invalidFieldMessages}
					/>
				</CardContent>
			</Card>
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
