"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { getPromptTemplateState } from "@/features/course/lesson/model/research-prompt";
import { getBuildStarterTemplateRepoUrl } from "@/features/course/lesson/model/resources";
import {
	getStarterRepoTemplateLockReason,
	type StarterRepoAccessStatus,
} from "@/features/starter-repo/lib/starter-repo-access-copy";
import { FieldList } from "../fields/field-list";
import { ArtifactContext } from "../shared/artifact-context";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";
import { BuildKickoffProgressCard } from "./build-kickoff/build-kickoff-progress-card";
import { BuildKickoffStepCard } from "./build-kickoff/build-kickoff-step-card";
import { BuildPromptCard } from "./build-kickoff/build-prompt-card";
import {
	PathChoiceCard,
	PathChoiceValidationMessage,
} from "./build-kickoff/path-choice-card";
import { useBuildKickoffFlow } from "./build-kickoff/use-build-kickoff-flow";

export function BuildKickoffWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
}: WorkbenchModeProps) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const starterRepoAccess = useQuery(
		api.course.getStarterRepoAccess,
		isAuthenticated && !isLoading ? {} : "skip",
	) as
		| {
				status: Exclude<StarterRepoAccessStatus, "loading" | "none">;
		  }
		| null
		| undefined;
	const promptState = getPromptTemplateState(
		"build_kickoff_prompt",
		pinnedArtifacts,
		fieldValues,
	);
	const flow = useBuildKickoffFlow({ fieldValues, onFieldChange, fields });
	const starterRepoStatus: StarterRepoAccessStatus =
		starterRepoAccess === undefined
			? "loading"
			: starterRepoAccess === null
				? "none"
				: starterRepoAccess.status;
	const hasStarterRepoAccess = starterRepoStatus === "accepted";
	const templateRepoUrl = hasStarterRepoAccess
		? getBuildStarterTemplateRepoUrl()
		: null;
	const templateLockedReason = hasStarterRepoAccess
		? null
		: getStarterRepoTemplateLockReason(starterRepoStatus);
	const templatePathBlocked =
		flow.currentPath === "Use template" && !hasStarterRepoAccess;
	const effectivePrompt = templatePathBlocked ? null : promptState.prompt;
	const effectiveDisabledReason = templatePathBlocked
		? templateLockedReason
		: promptState.disabledReason;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<BuildKickoffProgressCard items={flow.progressItems} />
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
			<BuildKickoffStepCard
				step={1}
				title="Choose your starting path"
				helper="Pick one path. You can change this later."
				active={flow.activeStep === 1}
				complete={flow.hasPath}
				summary={flow.currentPath ?? undefined}
				onEdit={() => flow.setActiveStep(1)}
			>
				<PathChoiceCard
					currentPath={flow.currentPath}
					invalid={invalidFieldIds.has("build_path")}
					templateRepoUrl={templateRepoUrl}
					templateLockedReason={templateLockedReason}
					onChoosePath={(path) => {
						onFieldChange("build_path", path);
						flow.setActiveStep(2);
					}}
				/>
				<PathChoiceValidationMessage
					invalid={invalidFieldIds.has("build_path")}
				/>
			</BuildKickoffStepCard>
			<BuildKickoffStepCard
				step={2}
				title="Name the first slice"
				helper="One screen or one workflow only. Keep it small enough to ship and verify quickly."
				active={flow.activeStep === 2}
				complete={flow.hasFirstSlice}
				summary={flow.firstSliceTrimmed || undefined}
				lockedMessage="Complete Step 1 first."
				onEdit={() => flow.setActiveStep(2)}
			>
				{flow.firstSliceField ? (
					<FieldList
						fields={[flow.firstSliceField]}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
						className="space-y-2"
					/>
				) : null}
			</BuildKickoffStepCard>
			<BuildKickoffStepCard
				step={3}
				title="Define done"
				helper="Describe the visible user outcome that proves this slice is complete."
				active={flow.activeStep === 3}
				complete={flow.hasDefinitionOfDone}
				summary={flow.definitionOfDoneTrimmed || undefined}
				lockedMessage="Complete Step 2 first."
				onEdit={() => flow.setActiveStep(3)}
			>
				{flow.definitionOfDoneField ? (
					<FieldList
						fields={[flow.definitionOfDoneField]}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
						className="space-y-2"
					/>
				) : null}
			</BuildKickoffStepCard>
			<BuildPromptCard
				prompt={effectivePrompt}
				disabledReason={effectiveDisabledReason}
				readyToGenerate={flow.readyToGenerate}
				resetKey={flow.resetKey}
			/>
		</WorkbenchContainer>
	);
}
