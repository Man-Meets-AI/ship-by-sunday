"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { getBuildStarterTemplateRepoUrl } from "@/features/course/lesson/model/resources";
import {
	getStarterRepoTemplateLockReason,
	type StarterRepoAccessStatus,
} from "@/config/starter-repo-access-copy";
import { FieldList } from "../../fields/field-list";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";
import { buildSetupInstructorCommandsBlock } from "./build-setup-launchpad-constants";
import { BuildSetupLaunchpadCommandsBlock } from "./build-setup-launchpad-commands-block";
import { BuildSetupLaunchpadDevProdAlert } from "./build-setup-launchpad-dev-prod-alert";
import { BuildSetupLaunchpadEnvDashboardsCard } from "./build-setup-launchpad-env-dashboards-card";
import { BuildSetupLaunchpadReferenceAccordion } from "./build-setup-launchpad-reference-accordion";
import { BuildSetupLaunchpadStarterTemplateCard } from "./build-setup-launchpad-starter-template-card";
import { BuildSetupLaunchpadStatusCard } from "./build-setup-launchpad-status-card";
import { BuildSetupLaunchpadStrategyCard } from "./build-setup-launchpad-strategy-card";

export function BuildSetupLaunchpadWorkbench({
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

	const canonicalRepoUrl = getBuildStarterTemplateRepoUrl();
	const commandsRepoUrl = templateRepoUrl ?? canonicalRepoUrl;
	const commandsText = buildSetupInstructorCommandsBlock(commandsRepoUrl);

	const setupFields = fields.filter((f) =>
		["build_product_folder_name", "build_setup_prereqs"].includes(f.id),
	);

	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const launchpadBody = (
		<div className="space-y-5">
			<BuildSetupLaunchpadStarterTemplateCard
				templateRepoUrl={templateRepoUrl}
				templateLockedReason={templateLockedReason}
				canonicalRepoUrl={canonicalRepoUrl}
			/>
			<FieldList
				fields={setupFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<BuildSetupLaunchpadCommandsBlock commandsText={commandsText} />
			<Separator />
			<BuildSetupLaunchpadDevProdAlert />
			<BuildSetupLaunchpadEnvDashboardsCard />
			<Separator />
			<BuildSetupLaunchpadStrategyCard pinnedArtifacts={pinnedArtifacts} />
			<BuildSetupLaunchpadStatusCard />
			<BuildSetupLaunchpadReferenceAccordion />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					{launchpadBody}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{launchpadBody}
				</>
			) : (
				launchpadBody
			)}
		</WorkbenchContainer>
	);
}
