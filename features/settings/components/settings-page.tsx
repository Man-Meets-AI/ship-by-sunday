import { productConfig } from "@/config/product";
import { StarterRepoAccessCard } from "@/features/starter-repo/components/starter-repo-access-card";
import { CodexConnectionCard } from "../../codex/components/codex-connection-card";

import { SettingsAccountCard } from "./settings-account-card";

export function SettingsPageContent() {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 pb-10 pt-2 xl:min-h-0 xl:overflow-y-auto">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your account, Codex connection, and starter repository for{" "}
					{productConfig.name}.
				</p>
			</div>

			<div className="flex flex-col gap-6">
				<CodexConnectionCard />

				<StarterRepoAccessCard surface="settings" />

				<SettingsAccountCard />
			</div>
		</div>
	);
}

export const SettingsPage = SettingsPageContent;
