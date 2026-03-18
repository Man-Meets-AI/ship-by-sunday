import type { StageUnlockBridge } from "@/features/course/lesson/model/stage-unlock";

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
						className="font-display text-[1.35rem] uppercase leading-[0.94] tracking-[0.04em] text-product-text sm:text-[1.55rem]"
						style={{ textWrap: "balance" }}
					>
						{bridge.title}
					</p>
					<p className="max-w-2xl text-[13px] leading-6 text-product-muted">
						{bridge.body}
					</p>
				</div>
				<div className="flex flex-wrap gap-2.5 lg:justify-end">
					{bridge.highlights.map((highlight) => (
						<span
							key={highlight}
							className="inline-flex border border-product-accent/22 bg-product-surface/82 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-product-accent shadow-[inset_0_0_0_1px_rgba(var(--product-accent),0.05)]"
						>
							{highlight}
						</span>
					))}
				</div>
			</div>
		</WorkbenchCard>
	);
}
