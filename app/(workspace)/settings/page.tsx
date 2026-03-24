import { api } from "@/convex/_generated/api";
import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	if (!isStarterModuleEnabled("course")) {
		return <SettingsPageShell />;
	}

	return (
		<SettingsPageShell
			initialMission={await fetchAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
