"use client";

import type { MissionState } from "@/features/course/mission/lib/mission-page-model";
import { AppShell } from "@/features/course/shared/components/app-shell";

import { SettingsPageContent } from "./settings-page";

export function SettingsPageShell({
	initialMission,
}: {
	initialMission?: MissionState | null;
}) {
	if (!initialMission) {
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
			mission={initialMission}
		>
			<SettingsPageContent />
		</AppShell>
	);
}
