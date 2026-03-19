import { Check, CircleDot, Lock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
	type EnrichedBlock,
	getBlockStatusLabel,
	getBlockTone,
} from "@/features/course/mission/lib/mission-page-model";

function StepIcon({
	status,
	isCurrent,
}: {
	status: string;
	isCurrent: boolean;
}) {
	if (status === "completed") {
		return (
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
				<Check className="size-4" />
			</div>
		);
	}

	if (isCurrent || status === "active" || status === "ready") {
		return (
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary">
				<CircleDot className="size-4 text-primary" />
			</div>
		);
	}

	return (
		<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
			<Lock className="size-3.5" />
		</div>
	);
}

export function MissionSprintRouteRow({
	block,
	isCurrent,
	isLast,
}: {
	block: EnrichedBlock;
	isCurrent: boolean;
	isLast: boolean;
}) {
	const tone = getBlockTone(block.status, isCurrent);
	const isActive = tone === "now" || tone === "next";

	return (
		<div className="flex gap-4">
			<div className="flex flex-col items-center">
				<StepIcon status={block.status} isCurrent={isCurrent} />
				{!isLast && (
					<div
						className={`mt-2 w-0.5 flex-1 ${
							block.status === "completed" ? "bg-primary/40" : "bg-border"
						}`}
					/>
				)}
			</div>
			<div className={`min-w-0 flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
				<div className="flex items-center gap-2">
					<h3
						className={`text-sm font-semibold tracking-tight ${
							isActive ? "text-foreground" : "text-muted-foreground"
						}`}
					>
						{block.label}
					</h3>
					<span
						className={`font-mono text-[10px] uppercase tracking-wider ${
							isCurrent
								? "text-primary"
								: block.status === "completed"
									? "text-muted-foreground"
									: "text-muted-foreground/60"
						}`}
					>
						{getBlockStatusLabel(block.status, isCurrent)}
					</span>
				</div>
				<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
					{block.summary}
				</p>
				<div className="mt-2 flex items-center gap-3">
					<Progress value={block.pct} className="h-1.5 max-w-32" />
					<span className="text-xs tabular-nums text-muted-foreground">
						{block.completedCount}/{block.totalLessons}
					</span>
				</div>
			</div>
		</div>
	);
}
