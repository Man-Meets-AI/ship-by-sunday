import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { buildBonusShellMission } from "@/lib/execute-ship/bonus-library-presentation";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";
import { LessonMapSurface } from "./lesson-map-surface";

export function BonusMissionPage({
	missionState,
}: {
	missionState: BonusMissionState;
}) {
	const shellMission = buildBonusShellMission(missionState);

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			showSkillRail={false}
			mission={shellMission}
			currentBlockId="BUILD"
		>
			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-10 pt-2">
				<LessonMapSurface missionState={missionState} />
			</div>
		</AppShell>
	);
}
