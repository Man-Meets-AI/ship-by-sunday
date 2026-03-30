import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";

export default async function Page() {
	if (!isStarterModuleEnabled("course")) {
		return <SettingsPageShell />;
	}

	return <SettingsPageShell />;
}
