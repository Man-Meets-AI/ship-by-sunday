import { Card } from "@/components/ui/card";
import type { AppShellBlock } from "@/features/course/shared/utils/app-shell-navigation";
import { getAppShellBlockNavigationTarget } from "@/features/course/shared/utils/app-shell-navigation";

import type { AppShellBlockStatus } from "./app-shell-block-status";
import { AppShellMissionRailStep } from "./app-shell-mission-rail-step";

type AppShellMissionRailProps = {
	blocks: Array<AppShellBlock & { label: string }>;
	blockStatuses: Map<string, AppShellBlockStatus>;
	activeBlockId: string | undefined;
};

export function AppShellMissionRail({
	blocks,
	blockStatuses,
	activeBlockId,
}: AppShellMissionRailProps) {
	return (
		<div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
			<Card
				className="pointer-events-auto relative z-0 flex flex-row flex-wrap items-center justify-center gap-x-1 gap-y-1 rounded-full border-0 bg-muted/30 py-1.5 pr-2 pl-2.5 shadow-none ring-1 ring-border/60 dark:bg-muted/20"
				role="navigation"
				aria-label="Course blocks"
			>
				<span
					aria-hidden
					className="absolute top-1/2 right-4 left-4 -z-10 h-px -translate-y-1/2 bg-border/45"
				/>
				<div className="relative z-10 flex flex-wrap items-center justify-center gap-x-0.5">
					{blocks.map((block) => {
						const status = (blockStatuses.get(block.id) ??
							"locked") as AppShellBlockStatus;
						const target = getAppShellBlockNavigationTarget(block);

						return (
							<AppShellMissionRailStep
								key={block.id}
								block={block}
								status={status}
								target={target}
								activeBlockId={activeBlockId}
							/>
						);
					})}
				</div>
			</Card>
		</div>
	);
}
