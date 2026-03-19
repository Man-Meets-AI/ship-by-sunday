import type { StageUnlockBridge } from "@/features/course/lesson/model/stage-unlock";

import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";

import { WorkbenchCard } from "../../shared/workbench-card";

export function StageUnlockBridgeCard({
	bridge,
}: {
	bridge: StageUnlockBridge;
}) {
	return (
		<WorkbenchCard label={bridge.eyebrow}>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.9fr)] lg:items-start">
				<div className="space-y-2">
					<p
						className="max-w-3xl text-[1.15rem] font-semibold leading-6 text-foreground sm:text-[1.35rem]"
						style={{ textWrap: "balance" }}
					>
						{bridge.title}
					</p>
					<CardDescription className="max-w-prose text-sm leading-relaxed">
						{bridge.body}
					</CardDescription>
				</div>
				<div className="flex flex-wrap gap-2.5 lg:justify-end">
					{bridge.highlights.map((highlight) => (
						<Badge
							key={highlight}
							variant="outline"
							className="text-xs font-medium"
						>
							{highlight}
						</Badge>
					))}
				</div>
			</div>
		</WorkbenchCard>
	);
}
