"use client";

import { PacketStageNav } from "@/features/packet-flow/components/packet-stage-nav";
import { WorkspacePrimaryNav } from "@/features/workspace-navigation/components/workspace-primary-nav";
import type { AppShellPrimaryNav } from "./app-shell-props";

export function AppShellPrimaryNav({ primaryNav }: { primaryNav: AppShellPrimaryNav }) {
	if (primaryNav.kind === "packet") {
		return (
			<PacketStageNav
				currentStageId={primaryNav.currentStageId}
				activeStepId={primaryNav.activeStepId}
				stageStatuses={primaryNav.stageStatuses}
				onLinkNavigate={primaryNav.onLinkNavigate}
				onNavigate={primaryNav.onNavigate}
			/>
		);
	}

	return (
		<WorkspacePrimaryNav
			items={primaryNav.items}
			onLinkNavigate={primaryNav.onLinkNavigate}
			onNavigate={primaryNav.onNavigate}
			onAction={primaryNav.onAction}
		/>
	);
}
