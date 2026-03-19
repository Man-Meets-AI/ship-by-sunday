import type { ReactElement } from "react";
import type {
	LessonConfig,
	LessonContent,
	LessonLayoutMode,
	WorkbenchField,
	WorkbenchSection,
} from "@/features/course/lesson/model/manifest";
import type {
	ArtifactPreview,
	ObjectiveTask,
	WorkbenchSectionState,
} from "@/features/course/lesson/model/registry";
import type { StageUnlockSummary } from "@/features/course/lesson/model/stage-unlock";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

export type WorkbenchRendererProps = {
	lesson: LessonConfig;
	lessonContent: LessonContent;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	layoutMode: LessonLayoutMode;
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
	invalid?: boolean;
};
