import { productConfig } from "@/config/product";
import { CodexConnectionCard } from "@/features/codex/components/codex-connection-card";
import { StarterRepoAccessCard } from "@/features/starter-repo/components/starter-repo-access-card";
import { isStarterModuleEnabled } from "@/config/starter-selectors";

import { SettingsAccountCard } from "../../_components/settings-account-card";

export function SettingsPageContent() {
	const starterRepoEnabled = isStarterModuleEnabled("starterRepo");
	const settingsDescription = starterRepoEnabled
		? `Manage your account, Codex connection, and Blueprint access for ${productConfig.name}.`
		: `Manage your account and Codex connection for ${productConfig.name}.`;

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 pb-10 pt-2 xl:min-h-0 xl:overflow-y-auto">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Settings</h1>
				<p className="text-sm text-muted-foreground">{settingsDescription}</p>
			</div>

			<div className="flex flex-col gap-6">
				<CodexConnectionCard />

				{starterRepoEnabled ? (
					<StarterRepoAccessCard surface="settings" />
				) : null}

				<SettingsAccountCard />
			</div>
		</div>
	);
}

export const SettingsPage = SettingsPageContent;
