"use client";

import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { MissionState } from "@/features/course/mission/lib/mission-page-model";
import { AppShell } from "@/features/course/shared/components/app-shell";

import { SettingsPageContent } from "./settings-page";

export function SettingsPageShell({
	preloadedMission,
}: {
	preloadedMission?: Preloaded<typeof api.course.getMissionState> | null;
}) {
	if (!preloadedMission) {
		return (
			<AppShell viewportMode="app" showSkillRail={false}>
				<SettingsPageContent />
			</AppShell>
		);
	}

	return (
		<AppShell
			viewportMode="app"
			showSkillRail={false}
			mission={usePreloadedQuery(preloadedMission) as MissionState}
		>
			<SettingsPageContent />
		</AppShell>
	);
}
