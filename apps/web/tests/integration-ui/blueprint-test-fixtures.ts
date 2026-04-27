import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@shipbysunday/blueprint-compiler";

import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";
import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";

type BlueprintWorkspaceFixtureOptions = {
	executeShipUnlockedAt?: number;
	factOverrides?: Record<string, unknown>;
};

export function createBlueprintWorkspaceState(
	options: BlueprintWorkspaceFixtureOptions = {},
): BlueprintWorkspaceState {
	const baseFacts = createCompleteProjectDefinition().facts;
	const facts = Object.fromEntries(
		Object.entries({
			...baseFacts,
			...options.factOverrides,
		}).filter(([, value]) => value !== undefined),
	);
	const projectDefinition = createCanonicalProjectDefinitionDraft({
		clerkUserId: "user_123",
		productKey: "ship-by-sunday",
		facts,
	});
	const stageStatus = deriveStageStatus(projectDefinition.facts);
	const executeShipUnlockedAt =
		typeof options.executeShipUnlockedAt === "number"
			? options.executeShipUnlockedAt
			: null;

	return {
		projectDefinition,
		workflowState:
			executeShipUnlockedAt !== null
				? {
						clerkUserId: "user_123",
						productKey: "ship-by-sunday",
						executeShipUnlockedAt,
						createdAt: executeShipUnlockedAt,
						updatedAt: executeShipUnlockedAt,
					}
				: null,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as BlueprintWorkspaceState;
}

export function createBlueprintBonusMissionState(): BonusMissionState {
	return {
		exploredCount: 1,
		totalLessons: 4,
		blocks: [
			{
				id: "CEO" as const,
				order: 1,
				lessons: [],
			},
			{
				id: "DESIGN" as const,
				order: 2,
				lessons: [],
			},
			{
				id: "BUILD" as const,
				order: 3,
				lessons: [
					{
						lessonKey: "iterate-the-product-with-ai",
						routeSegment: "iterate-the-product-with-ai",
						id: "3.1",
						displayLabel: "3.1",
						title: "Iterate the product with AI",
						shortTitle: "Iterate",
						block: "BUILD" as const,
						order: 1,
						status: "opened" as const,
						isImplemented: true,
						artifactLabel: "Build notes",
					},
				],
			},
			{
				id: "SHIP" as const,
				order: 4,
				lessons: [],
			},
		],
	} as BonusMissionState;
}

export function createBlueprintPostReviewTargets(): PostReviewNavigationTargets {
	return {
		reviewDestination: "/review",
		buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
		launchLessonsDestination: "/lesson/product-review",
		lessonMapDestination: "/review?showLessonMap=1",
		latestLessonDestination: "/lesson/iterate-the-product-with-ai",
	};
}
