import {
	getBlueprintStageDefinition,
	blueprintStageDefinitions,
	type BlueprintStageId,
	type BlueprintStageStatus,
	type BlueprintStepDefinition,
} from "@blueprint-compiler";

export type RoutedBlueprintStageId = Exclude<
	BlueprintStageId,
	"start" | "review"
>;

type BlueprintPageRoute = {
	href: string;
	stageId: BlueprintStageId;
	stepId?: string;
};

function getRoutedBlueprintStage(stageId: RoutedBlueprintStageId) {
	const stage = getBlueprintStageDefinition(stageId);
	if (stage.steps.length === 0) {
		throw new Error(`Stage ${stageId} does not define blueprint pages.`);
	}

	return stage;
}

export function getBlueprintStageStep(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	return getRoutedBlueprintStage(stageId).steps.find(
		(step) => step.id === stepId,
	);
}

export function isBlueprintStageStepId(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	return getBlueprintStageStep(stageId, stepId) !== undefined;
}

export function getBlueprintStageStepIndex(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	const stepIndex = getRoutedBlueprintStage(stageId).steps.findIndex(
		(step) => step.id === stepId,
	);
	if (stepIndex < 0) {
		throw new Error(`Unknown blueprint step ${stageId}/${stepId}.`);
	}

	return stepIndex;
}

export function getBlueprintStageStepHref(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	return `${getBlueprintStageDefinition(stageId).route}/${stepId}`;
}

export function getBlueprintStageEntryHref(
	stageId: RoutedBlueprintStageId,
	stageStatus: BlueprintStageStatus,
) {
	const stage = getRoutedBlueprintStage(stageId);
	const entryStep = stageStatus.isComplete
		? stage.steps[0]
		: (stage.steps[stageStatus.currentStepIndex] ?? stage.steps[0]);
	if (!entryStep) {
		throw new Error(`Stage ${stageId} has no blueprint entry step.`);
	}

	return getBlueprintStageStepHref(stageId, entryStep.id);
}

function buildBlueprintPageRoutes(): BlueprintPageRoute[] {
	return [
		{ href: "/start", stageId: "start" },
		...blueprintStageDefinitions.flatMap((stage) => {
			if (stage.id === "start" || stage.id === "review") {
				return [];
			}

			return stage.steps.map((step) => ({
				href: getBlueprintStageStepHref(stage.id, step.id),
				stageId: stage.id,
				stepId: step.id,
			}));
		}),
		{ href: "/review", stageId: "review" },
	];
}

export function getAdjacentBlueprintPageHrefs(
	stageId: RoutedBlueprintStageId,
	stepId: string,
) {
	const href = getBlueprintStageStepHref(stageId, stepId);
	const routes = buildBlueprintPageRoutes();
	const currentIndex = routes.findIndex((route) => route.href === href);
	if (currentIndex < 0) {
		throw new Error(`Missing blueprint page route for ${stageId}/${stepId}.`);
	}

	return {
		previousHref: routes[currentIndex - 1]?.href,
		nextHref: routes[currentIndex + 1]?.href,
	};
}

export function doesCompletingStepCompleteStage(
	stageStatus: BlueprintStageStatus,
	step: BlueprintStepDefinition,
) {
	const stepRequiredFieldKeys = new Set(
		step.requiredFieldKeys ?? step.fieldKeys,
	);
	return stageStatus.missingFactKeys.every((fieldKey) =>
		stepRequiredFieldKeys.has(fieldKey),
	);
}
