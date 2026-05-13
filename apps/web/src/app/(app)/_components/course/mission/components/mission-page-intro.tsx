import type { MissionState } from "@/lib/course/mission/mission-page-model";

export function MissionPageIntro({ mission }: { mission: MissionState }) {
	return (
		<div className="space-y-1">
			<h1 className="font-heading-serif text-2xl font-normal sm:text-3xl">
				Your weekend roadmap
			</h1>
			<p className="text-sm text-muted-foreground">
				{mission.progressCount} of {mission.totalLessons} lessons complete
			</p>
		</div>
	);
}
