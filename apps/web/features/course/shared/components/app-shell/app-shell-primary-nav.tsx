"use client";

import { PacketStageNav } from "@/features/packet-flow/components/packet-stage-nav";
import { WorkspacePrimaryNav } from "@/features/workspace-navigation/components/workspace-primary-nav";
import type { AppShellPrimaryNav } from "./app-shell-props";

export function AppShellPrimaryNav({
	primaryNav,
}: {
	primaryNav: AppShellPrimaryNav;
}) {
	return (
		<div className="flex min-w-max items-center gap-x-3">
			<PacketStageNav
				currentStageId={primaryNav.currentPacketStageId}
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
