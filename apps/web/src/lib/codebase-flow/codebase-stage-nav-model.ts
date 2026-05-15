import {
	codebaseStageDefinitions,
	type CodebaseStageId,
	type CodebaseStageStatus,
} from "@shipbysunday/codebase-compiler";

import { routeConfig } from "@/config/product";

export type CodebaseStageNavState =
	| "active"
	| "complete"
	| "available"
	| "locked";

export type CodebaseStageNavItem = {
	id: CodebaseStageId;
	label: string;
	route: string;
	state: CodebaseStageNavState;
};

export function getCodebaseStageRoute(stageId: CodebaseStageId) {
	switch (stageId) {
		case "codebase":
			return routeConfig.codebase;
		case "review":
			return routeConfig.review;
	}
}

export function buildCodebaseStageNavItems({
	currentStageId,
	stageStatuses,
}: {
	currentStageId?: CodebaseStageId;
	stageStatuses: CodebaseStageStatus[];
}): CodebaseStageNavItem[] {
	return codebaseStageDefinitions.map((stage) => {
		const stageStatus = stageStatuses.find((item) => item.stageId === stage.id);
		if (!stageStatus) {
			throw new Error(`Missing codebase stage status for ${stage.id}`);
		}

		const state =
			stage.id === currentStageId
				? "active"
				: !stageStatus.isUnlocked
					? "locked"
					: stageStatus.isComplete
						? "complete"
						: "available";

		return {
			id: stage.id,
			label: stage.label,
			route: getCodebaseStageRoute(stage.id),
			state,
		} satisfies CodebaseStageNavItem;
	});
}
