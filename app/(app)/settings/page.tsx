import { api } from "@/convex/_generated/api";
import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
import { preloadAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<SettingsPageShell
			preloadedMission={await preloadAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
