"use client";

import type { Preloaded } from "convex/react";
import { useConvexAuth, usePreloadedQuery, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { MissionExtrasRow } from "@/features/course/mission/components/mission/mission-extras-row";
import { MissionHeroCard } from "@/features/course/mission/components/mission/mission-hero-card";
import { MissionLoading } from "@/features/course/mission/components/mission/mission-loading";
import { MissionSprintRoute } from "@/features/course/mission/components/mission/mission-sprint-route";
import { MissionUpcomingSteps } from "@/features/course/mission/components/mission/mission-upcoming-steps";
import { MissionPageIntro } from "@/features/course/mission/components/mission-page-intro";
import {
	type MissionState,
	enrichBlock,
} from "@/features/course/mission/lib/mission-page-model";
import { AppShell } from "@/features/course/shared/components/app-shell";

function MissionPageContent({ mission }: { mission: MissionState | undefined }) {
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
			title="Mission"
			subtitle="Your weekend, one step at a time"
			mission={mission}
		>
			{mission === undefined || currentBlock === null ? (
				<MissionLoading />
			) : (
				<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-10 pt-2">
					<MissionPageIntro mission={mission} />
					<MissionHeroCard block={currentBlock} />
					<MissionUpcomingSteps lessons={currentBlock.upcomingLessons} />
					<MissionSprintRoute
						blocks={blocks}
						currentBlockId={currentBlock.id}
					/>
					<MissionExtrasRow />
				</div>
			)}
		</AppShell>
	);
}

function MissionPageLive() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const mission = useQuery(
		api.course.getMissionState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as MissionState | undefined;

	return <MissionPageContent mission={mission} />;
}

function MissionPagePreloaded({
	preloadedMission,
}: {
	preloadedMission: Preloaded<typeof api.course.getMissionState>;
}) {
	return (
		<MissionPageContent mission={usePreloadedQuery(preloadedMission) as MissionState} />
	);
}

export function MissionPage({
	preloadedMission,
}: {
	preloadedMission?: Preloaded<typeof api.course.getMissionState> | null;
}) {
	return preloadedMission ? (
		<MissionPagePreloaded preloadedMission={preloadedMission} />
	) : (
		<MissionPageLive />
	);
}
