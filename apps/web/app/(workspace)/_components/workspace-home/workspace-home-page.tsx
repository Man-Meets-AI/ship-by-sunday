import { AppShell } from "@/app/(workspace)/_components/app-shell";
import {
	buildWorkspaceHomeModel,
	type WorkspaceHomeModel,
} from "@/app/(workspace)/_lib/workspace-home-model";

import { WorkspaceHomeHero } from "./workspace-home-hero";
import { WorkspaceHomeModuleList } from "./workspace-home-module-list";
import { WorkspaceHomeNextSteps } from "./workspace-home-next-steps";
import { WorkspaceHomeSetupCards } from "./workspace-home-setup-cards";

export function WorkspaceHomePage({
	model = buildWorkspaceHomeModel(),
}: {
	model?: WorkspaceHomeModel;
}) {
	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 pt-2">
				<WorkspaceHomeHero model={model} />
				<div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
					<WorkspaceHomeModuleList modules={model.modules} />
					<WorkspaceHomeNextSteps nextSteps={model.nextSteps} />
				</div>
				<WorkspaceHomeSetupCards model={model} />
			</div>
		</AppShell>
	);
}
