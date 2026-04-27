import { CodexConnectionCard } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card";
import { SettingsAccountCard } from "@/app/(workspace)/_components/settings-account-card";
import { StarterRepoAccessCard } from "@/app/(workspace)/_components/starter-repo-access/starter-repo-access-card";
import type { WorkspaceHomeModel } from "@/app/(workspace)/_lib/workspace-home-model";

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
