import {
	ProtectedRouteDescription,
	ProtectedRouteHeader,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import type { MissionState } from "@/lib/course/mission/mission-page-model";

export function MissionPageIntro({ mission }: { mission: MissionState }) {
	return (
		<ProtectedRouteHeader
			actions={
				<p className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
					<span className="font-number font-medium text-foreground">
						{mission.progressCount}
					</span>{" "}
					of {mission.totalLessons} lessons complete
				</p>
			}
		>
			<ProtectedRouteTitle>Your weekend roadmap</ProtectedRouteTitle>
			<ProtectedRouteDescription>
				{mission.progressCount} of {mission.totalLessons} lessons complete
			</ProtectedRouteDescription>
		</ProtectedRouteHeader>
	);
}
