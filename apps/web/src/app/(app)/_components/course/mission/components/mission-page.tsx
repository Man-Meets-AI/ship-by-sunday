"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { MissionExtrasRow } from "@/app/(app)/_components/course/mission/components/mission/mission-extras-row";
import { MissionHeroCard } from "@/app/(app)/_components/course/mission/components/mission/mission-hero-card";
import { MissionLoading } from "@/app/(app)/_components/course/mission/components/mission/mission-loading";
import { MissionSprintRoute } from "@/app/(app)/_components/course/mission/components/mission/mission-sprint-route";
import { MissionUpcomingSteps } from "@/app/(app)/_components/course/mission/components/mission/mission-upcoming-steps";
import { MissionPageIntro } from "@/app/(app)/_components/course/mission/components/mission-page-intro";
import {
	type MissionState,
	enrichBlock,
} from "@/lib/course/mission/mission-page-model";
import { AppShell } from "@/app/(app)/_components/app-shell";
import { ProtectedRoutePage } from "@/components/app/protected-route-surface";

function MissionPageContent({
	mission,
}: {
	mission: MissionState | undefined;
}) {
	const blocks = mission?.blocks.map(enrichBlock) ?? [];
	const currentBlock =
		blocks.find(
			(block) => block.status === "active" || block.status === "ready",
		) ??
		blocks[blocks.length - 1] ??
		null;

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			currentBlockId={currentBlock?.id}
			mission={mission}
		>
			{mission === undefined || currentBlock === null ? (
				<MissionLoading />
			) : (
				<ProtectedRoutePage className="max-w-4xl gap-5">
					<MissionPageIntro mission={mission} />
					<MissionHeroCard block={currentBlock} />
					<MissionUpcomingSteps lessons={currentBlock.upcomingLessons} />
					<MissionSprintRoute
						blocks={blocks}
						currentBlockId={currentBlock.id}
					/>
					<MissionExtrasRow />
				</ProtectedRoutePage>
			)}
		</AppShell>
	);
}

export function MissionPage({
	initialMission,
}: {
	initialMission?: MissionState | null;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveMission = useQuery(
		api.course.getMissionState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as MissionState | undefined;
	const mission = liveMission ?? initialMission ?? undefined;

	return <MissionPageContent mission={mission} />;
}
