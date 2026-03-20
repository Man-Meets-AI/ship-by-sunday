"use client";

import { Badge } from "@/components/ui/badge";

import type { RoadmapTaskBadge } from "./build-ship-roadmap-constants";

const LABELS: Record<RoadmapTaskBadge, string> = {
	required: "Required",
	later: "Later",
	optional: "Optional",
};

const VARIANTS: Record<
	RoadmapTaskBadge,
	"default" | "secondary" | "outline"
> = {
	required: "default",
	later: "secondary",
	optional: "outline",
};

export function BuildShipRoadmapTaskBadge({ kind }: { kind: RoadmapTaskBadge }) {
	return <Badge variant={VARIANTS[kind]}>{LABELS[kind]}</Badge>;
}

export function BuildShipRoadmapBadgeLegend() {
	return (
		<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
			<span className="font-medium text-foreground">Legend:</span>
			<span className="inline-flex items-center gap-1.5">
				<BuildShipRoadmapTaskBadge kind="required" />
				<span>core path</span>
			</span>
			<span className="inline-flex items-center gap-1.5">
				<BuildShipRoadmapTaskBadge kind="later" />
				<span>after core ship</span>
			</span>
			<span className="inline-flex items-center gap-1.5">
				<BuildShipRoadmapTaskBadge kind="optional" />
				<span>nice-to-have</span>
			</span>
		</div>
	);
}
