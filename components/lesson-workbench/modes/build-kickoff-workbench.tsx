import { getPromptTemplateState } from "@/lib/course/research-prompt";
import { getBuildStarterTemplateRepoUrl } from "@/lib/course/resources";

import type { WorkbenchModeProps } from "../types";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { BuildOverviewCard } from "./build-kickoff/build-overview-card";
import { BuildPromptCard } from "./build-kickoff/build-prompt-card";
import { PathChoiceCard } from "./build-kickoff/path-choice-card";

export function BuildKickoffWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const buildBoundaryFields = fields.filter((field) => field.id !== "build_path");
	const promptState = getPromptTemplateState(
		"build_kickoff_prompt",
		pinnedArtifacts,
		fieldValues as any,
	);
	const currentPath =
		typeof fieldValues.build_path === "string" ? fieldValues.build_path : null;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{pinnedArtifacts.length > 0 ? (
				<details className="rounded-none border border-product-border/70 bg-product-surface-strong/70">
					<summary className="cursor-pointer px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
						Review your context
					</summary>
					<div className="border-t border-product-border/60 px-3 py-3">
						<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
					</div>
				</details>
			) : null}
			<PathChoiceCard
				currentPath={currentPath}
				invalid={invalidFieldIds.has("build_path")}
				templateRepoUrl={getBuildStarterTemplateRepoUrl()}
				onChoosePath={(path) => onFieldChange("build_path", path)}
			/>
			<FieldList
				fields={buildBoundaryFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 md:grid-cols-2"
			/>
			<BuildPromptCard
				prompt={promptState.prompt}
				disabledReason={promptState.disabledReason}
			/>
			<BuildOverviewCard items={lessonContent.workbench.teachingPoints ?? []} />
		</WorkbenchContainer>
	);
}
