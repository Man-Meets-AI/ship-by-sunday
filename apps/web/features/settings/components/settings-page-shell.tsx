"use client";

import { AppShell } from "@/features/course/shared/components/app-shell";

import { SettingsPageContent } from "./settings-page";

export function SettingsPageShell() {
	return (
		<AppShell viewportMode="app" showSkillRail={false}>
			<SettingsPageContent />
		</AppShell>
	);
}
