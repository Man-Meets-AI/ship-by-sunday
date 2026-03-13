import type { ReactElement } from "react";

import type { PinnedArtifact } from "@/components/lesson-shells";
import type {
	LessonConfig,
	LessonContent,
	WorkbenchField,
	WorkbenchSection,
} from "@/lib/course/manifest";
import type {
	ArtifactPreview,
	ObjectiveTask,
	WorkbenchSectionState,
} from "@/lib/course/registry";
import type { StageUnlockSummary } from "@/lib/course/stage-unlock";

export type WorkbenchRendererProps = {
	lesson: LessonConfig;
	lessonContent: LessonContent;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds?: Set<string>;
	invalidFieldMessages?: Map<string, string>;
	fieldValuesReady?: boolean;
	resolvedArtifactPreview?: ArtifactPreview | null;
	stageUnlockSummary?: StageUnlockSummary | null;
};

type WorkbenchSharedState = {
	fields: WorkbenchField[];
	objectiveTasks: ObjectiveTask[];
	completedTaskCount: number;
	workbenchSections: WorkbenchSection[];
	sectionStates: WorkbenchSectionState[];
};

export type WorkbenchModeProps = WorkbenchRendererProps &
	WorkbenchSharedState & {
		invalidFieldIds: Set<string>;
		invalidFieldMessages: Map<string, string>;
	};

export type WorkbenchModeComponent = (
	props: WorkbenchModeProps,
) => ReactElement;

export type FieldControlProps = {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	showLabel?: boolean;
};
