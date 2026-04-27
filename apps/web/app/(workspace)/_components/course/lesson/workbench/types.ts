import type { ReactElement, ReactNode } from "react";
import type {
	LessonConfig,
	LessonContent,
	LessonLayoutMode,
	WorkbenchField,
	WorkbenchSection,
} from "@/lib/course/lesson/model/manifest";
import type {
	ArtifactPreview,
	ObjectiveTask,
	WorkbenchSectionState,
} from "@/lib/course/lesson/model/registry";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells";
import type { WorkbenchStageUnlockSummary } from "./stage-unlock-summary";

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
	stageUnlockSummary?: WorkbenchStageUnlockSummary | null;
	/** Duplicate footer completion control (e.g. lesson 1.1 welcome panel). */
	workbenchCompletionSlot?: ReactNode;
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
