import type { LessonConfig } from "@/features/course/lesson/model/manifest";
import {
	buildStageUnlockSummary,
	type StageUnlockBridge,
	type StageUnlockPinnedArtifact,
	type StageUnlockSection,
	type StageUnlockSummary,
} from "@/features/course/lesson/model/stage-unlock";
import { getLessonHref } from "@/features/course/lesson/routing/lesson-routes";

export type { StageUnlockBridge };

export type WorkbenchStageUnlockSectionAction = {
	label: string;
	href: string;
};

export type WorkbenchStageUnlockSection = Omit<StageUnlockSection, "action"> & {
	action?: WorkbenchStageUnlockSectionAction;
};

export type WorkbenchStageUnlockSummary = Omit<
	StageUnlockSummary,
	"sections"
> & {
	sections: WorkbenchStageUnlockSection[];
};

function toWorkbenchSection(
	section: StageUnlockSection,
): WorkbenchStageUnlockSection {
	const { action, ...sectionWithoutAction } = section;
	if (!action) {
		return sectionWithoutAction;
	}

	return {
		...sectionWithoutAction,
		action: {
			label: action.label,
			href: getLessonHref(action.lessonKey),
		},
	};
}

export function buildWorkbenchStageUnlockSummary(
	lesson: LessonConfig,
	pinnedArtifacts: StageUnlockPinnedArtifact[] = [],
): WorkbenchStageUnlockSummary | null {
	const summary = buildStageUnlockSummary(lesson, pinnedArtifacts);
	if (!summary) {
		return null;
	}

	return {
		...summary,
		sections: summary.sections.map(toWorkbenchSection),
	};
}
