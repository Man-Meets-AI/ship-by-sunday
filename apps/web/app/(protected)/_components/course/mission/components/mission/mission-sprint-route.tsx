import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlockId } from "@/lib/course/lesson/model/manifest";
import { MissionSprintRouteRow } from "@/app/(protected)/_components/course/mission/components/mission/mission-sprint-route-row";
import type { EnrichedBlock } from "@/lib/course/mission/mission-page-model";

export function MissionSprintRoute({
	blocks,
	currentBlockId,
}: {
	blocks: EnrichedBlock[];
	currentBlockId: BlockId;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">All four blocks</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col">
					{blocks.map((block, index) => (
						<MissionSprintRouteRow
							key={block.id}
							block={block}
							isCurrent={block.id === currentBlockId}
							isLast={index === blocks.length - 1}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
