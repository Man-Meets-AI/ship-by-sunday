import { isStarterModuleEnabled } from "@/config/starter-selectors";

import { SettingsPageShell } from "./_components/settings-page-shell";

export default async function Page() {
	if (!isStarterModuleEnabled("course")) {
		return <SettingsPageShell />;
	}

	return <SettingsPageShell />;
}
