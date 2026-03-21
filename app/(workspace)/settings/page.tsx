import { api } from "@/convex/_generated/api";
import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	return (
		<SettingsPageShell
			initialMission={await fetchAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
