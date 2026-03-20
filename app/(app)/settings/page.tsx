import { SettingsPageContent } from "@/features/settings/components/settings-page";
import { AppShell } from "@/features/course/shared/components/app-shell";

export default async function Page() {
	return (
		<AppShell viewportMode="app" showSkillRail={false}>
			<SettingsPageContent />
		</AppShell>
	);
}
