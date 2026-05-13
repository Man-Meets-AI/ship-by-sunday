"use client";

import { CodebaseStageNav } from "@/app/(protected)/_components/codebase-flow/codebase-stage-nav";
import { WorkspacePrimaryNav } from "@/app/(protected)/_components/workspace-navigation/workspace-primary-nav";
import type { AppShellPrimaryNav } from "./app-shell-props";

export function AppShellPrimaryNav({
	primaryNav,
}: {
	primaryNav: AppShellPrimaryNav;
}) {
	return (
		<div className="flex min-w-max items-center gap-x-3">
			<CodebaseStageNav
				currentStageId={primaryNav.currentCodebaseStageId}
				stageStatuses={primaryNav.stageStatuses}
				onLinkNavigate={primaryNav.onLinkNavigate}
				onNavigate={primaryNav.onNavigate}
			/>
			<WorkspacePrimaryNav
				items={primaryNav.postReviewItems}
				onLinkNavigate={primaryNav.onLinkNavigate}
				onNavigate={primaryNav.onNavigate}
				onAction={primaryNav.onAction}
			/>
		</div>
	);
}
