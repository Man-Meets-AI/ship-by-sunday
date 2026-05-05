import { CodexConnectionCard } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card";
import { SettingsAccountCard } from "@/app/(workspace)/_components/settings-account-card";
import type { WorkspaceHomeModel } from "@/app/(workspace)/_lib/workspace-home-model";

export function WorkspaceHomeSetupCards({
	model,
}: {
	model: Pick<WorkspaceHomeModel, "showCodexCard">;
}) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{model.showCodexCard ? <CodexConnectionCard /> : null}
			<SettingsAccountCard />
		</div>
	);
}
