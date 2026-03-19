import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { getServerViewerAccess } from "@/features/course/access/server/course-access";
import { SettingsPageContent } from "@/features/settings/components/settings-page";
import { AppShell } from "@/features/course/shared/components/app-shell";

export default async function Page() {
	const access = await getServerViewerAccess();

	if (!access.hasAccess) {
		redirect(routeConfig.accessRequired);
	}

	return (
		<AppShell viewportMode="app" showSkillRail={false}>
			<SettingsPageContent />
		</AppShell>
	);
}
