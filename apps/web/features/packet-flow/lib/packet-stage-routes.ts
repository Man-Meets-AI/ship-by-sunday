import {
	getPacketStageDefinition,
	packetStageDefinitions,
	type PacketStageId,
	type PacketStageStatus,
	type PacketStepDefinition,
} from "@packet-compiler";

export type RoutedPacketStageId = Exclude<PacketStageId, "start" | "review">;

type PacketPageRoute = {
	href: string;
	stageId: PacketStageId;
	stepId?: string;
};

function getRoutedPacketStage(stageId: RoutedPacketStageId) {
	const stage = getPacketStageDefinition(stageId);
	if (stage.steps.length === 0) {
		throw new Error(`Stage ${stageId} does not define packet pages.`);
	}

	return stage;
}

export function getPacketStageStep(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	return getRoutedPacketStage(stageId).steps.find((step) => step.id === stepId);
}

export function isPacketStageStepId(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	return getPacketStageStep(stageId, stepId) !== undefined;
}

export function getPacketStageStepIndex(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	const stepIndex = getRoutedPacketStage(stageId).steps.findIndex(
		(step) => step.id === stepId,
	);
	if (stepIndex < 0) {
		throw new Error(`Unknown packet step ${stageId}/${stepId}.`);
	}

	return stepIndex;
}

export function getPacketStageStepHref(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	return `${getPacketStageDefinition(stageId).route}/${stepId}`;
}

export function getPacketStageEntryHref(
	stageId: RoutedPacketStageId,
	stageStatus: PacketStageStatus,
) {
	const stage = getRoutedPacketStage(stageId);
	const entryStep = stageStatus.isComplete
		? stage.steps[0]
		: (stage.steps[stageStatus.currentStepIndex] ?? stage.steps[0]);
	if (!entryStep) {
		throw new Error(`Stage ${stageId} has no packet entry step.`);
	}

	return getPacketStageStepHref(stageId, entryStep.id);
}

function buildPacketPageRoutes(): PacketPageRoute[] {
	return [
		{ href: "/start", stageId: "start" },
		...packetStageDefinitions.flatMap((stage) => {
			if (stage.id === "start" || stage.id === "review") {
				return [];
			}

			return stage.steps.map((step) => ({
				href: getPacketStageStepHref(stage.id, step.id),
				stageId: stage.id,
				stepId: step.id,
			}));
		}),
		{ href: "/review", stageId: "review" },
	];
}

export function getAdjacentPacketPageHrefs(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	const href = getPacketStageStepHref(stageId, stepId);
	const routes = buildPacketPageRoutes();
	const currentIndex = routes.findIndex((route) => route.href === href);
	if (currentIndex < 0) {
		throw new Error(`Missing packet page route for ${stageId}/${stepId}.`);
	}

	return {
		previousHref: routes[currentIndex - 1]?.href,
		nextHref: routes[currentIndex + 1]?.href,
	};
}

export function doesCompletingStepCompleteStage(
	stageStatus: PacketStageStatus,
	step: PacketStepDefinition,
) {
	const stepRequiredFieldKeys = new Set(
		step.requiredFieldKeys ?? step.fieldKeys,
	);
	return stageStatus.missingFactKeys.every((fieldKey) =>
		stepRequiredFieldKeys.has(fieldKey),
	);
}
