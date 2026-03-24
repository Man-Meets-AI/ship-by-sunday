import { CodexConnectionCard } from "@/features/codex/components/codex-connection-card";
import { SettingsAccountCard } from "@/features/settings/components/settings-account-card";
import { StarterRepoAccessCard } from "@/features/starter-repo/components/starter-repo-access-card";
import type { WorkspaceHomeModel } from "@/features/workspace-home/lib/workspace-home-model";

export function WorkspaceHomeSetupCards({
	model,
}: {
	model: Pick<WorkspaceHomeModel, "showCodexCard" | "showStarterRepoCard">;
}) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{model.showCodexCard ? <CodexConnectionCard /> : null}
			{model.showStarterRepoCard ? (
				<StarterRepoAccessCard surface="settings" />
			) : null}
			<SettingsAccountCard />
		</div>
	);
}
