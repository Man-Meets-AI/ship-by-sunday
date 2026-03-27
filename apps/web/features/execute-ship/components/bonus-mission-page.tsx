import { AppShell } from "@/features/course/shared/components/app-shell";
import {
	buildBonusShellMission,
	getOrderedBonusBlocks,
	getRecommendedBuildLessonHref,
} from "@/features/execute-ship/lib/bonus-library-presentation";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import { BonusMissionBlockCard } from "./bonus-mission-block-card";
import { BonusMissionHeroCard } from "./bonus-mission-hero-card";

export function BonusMissionPage({
	missionState,
}: {
	missionState: BonusMissionState;
}) {
	const shellMission = buildBonusShellMission(missionState);
	const orderedBlocks = getOrderedBonusBlocks(missionState);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showMissionRail
			showSkillRail={false}
			mission={shellMission}
			currentBlockId="BUILD"
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<BonusMissionHeroCard
					exploredCount={missionState.exploredCount}
					totalLessons={missionState.totalLessons}
					recommendedLessonHref={getRecommendedBuildLessonHref(missionState)}
				/>
				<div className="grid gap-5 xl:grid-cols-2">
					{orderedBlocks.map((block) => (
						<BonusMissionBlockCard key={block.id} block={block} />
					))}
				</div>
			</div>
		</AppShell>
	);
}
