export type BlockId = "CEO" | "DESIGN" | "BUILD" | "SHIP";

export type ShellType = "split" | "focus" | "mission";

export type WorkbenchType =
	| "guided_form"
	| "score_table"
	| "collector_board"
	| "capture_upload"
	| "scope_split"
	| "brief_assembler"
	| "console_checklist"
	| "roadmap_overview"
	| "tracker_log"
	| "external_workspace";

export type CoachMode = "docked" | "pip";

export type ExternalTool = "figma" | "code" | "deploy" | "recording";

export type UploadFieldValue = {
	kind: "upload";
	status: "empty" | "selected" | "stored";
	fileName?: string;
	mimeType?: string;
	size?: number;
	storageId?: string;
	url?: string;
	previewUrl?: string;
};

export type ChecklistItemValue = {
	label: string;
	checked: boolean;
};

export type PanelDefaultState = {
	coach: "docked" | "minimized" | "pip";
	transcript: "open" | "collapsed";
	examples: "open" | "collapsed";
	resources: "open" | "collapsed";
};

export type ArtifactType =
	| "text"
	| "table"
	| "board"
	| "image"
	| "images"
	| "video"
	| "checklist"
	| "brief"
	| "link"
	| "mixed";

export type ArtifactContract = {
	key: string;
	label: string;
	contextTitle?: string;
	type: ArtifactType;
	required: boolean;
	sourceLessonId?: string;
	dependsOn?: string[];
};

export type WorkbenchSectionLayout = "stack" | "split" | "compact";

export type WorkbenchSection = {
	id: string;
	title: string;
	eyebrow?: string;
	instruction?: string;
	layout?: WorkbenchSectionLayout;
	fieldIds: string[];
	completionLabel?: string;
	blockedByFieldIds?: string[];
};

export type ObjectiveMode = "generated" | "manual";

export type ObjectiveTaskDefinition = {
	id?: string;
	label: string;
};

export type LessonUnlockTargets = {
	lessons?: string[];
	blocks?: BlockId[];
};

export type CandidateProblemHandoffOption = {
	index: number;
	ownerSourceFieldId: string;
	statementSourceFieldId: string;
};

export type CandidateProblemPersistedField = {
	targetFieldId: string;
	source: "owner" | "statement";
	previewLabel: string;
};

export type TableColumnConfig = {
	id: string;
	label: string;
	kind: "text" | "select";
	placeholder?: string;
	options?: string[];
	width?: "compact" | "default" | "wide";
};

export type LessonHandoff = {
	mode: "select_candidate_problem";
	sourceArtifactKey: string;
	selectionFieldId: string;
	options: CandidateProblemHandoffOption[];
	persistedFields?: CandidateProblemPersistedField[];
};

export type WorkbenchField = {
	id: string;
	label: string;
	kind:
		| "text"
		| "textarea"
		| "url"
		| "number"
		| "toggle"
		| "select"
		| "image_upload"
		| "video_upload"
		| "table"
		| "board"
		| "checklist"
		| "readonly";
	required?: boolean;
	placeholder?: string;
	helpText?: string;
	options?: string[];
	rows?: number;
	inputWidth?: "compact" | "default" | "wide";
	columns?: TableColumnConfig[];
	artifactPreviewLabel?: string;
	taskLabel?: string;
	linkedArtifactKey?: string;
};

export type LessonContentStatus = "outline" | "draft" | "ready";

export type LessonVideoContent = {
	status: "pending" | "ready";
	provider?: "mux" | "vimeo" | "loom" | "youtube" | "file";
	url?: string;
	title?: string;
	posterUrl?: string;
	durationLabel?: string;
};

export type LessonTranscriptContent = {
	status: "empty" | "ready";
	body?: string;
};

export type LessonExampleContent = {
	id: string;
	title: string;
	body: string;
};

export type LessonPromptTemplateId = "competitor_research";

export type LessonLinkResourceContent = {
	id: string;
	label: string;
	href: string;
	kind: "download" | "internal" | "external";
};

export type LessonPromptResourceContent = {
	id: string;
	label: string;
	kind: "copy_prompt";
	body?: string;
	promptTemplateId: LessonPromptTemplateId;
};

export type LessonPromptImport = {
	promptTemplateId: LessonPromptTemplateId;
	tableFieldId: string;
	summaryFieldId: string;
};

export type LessonResourceContent =
	| LessonLinkResourceContent
	| LessonPromptResourceContent;

export type LessonTemplateResource = {
	templateDownloadLabel: string;
	templateDownloadHref: string;
};

export type LessonContent = {
	status: LessonContentStatus;
	intro: string;
	lessonMeta: {
		runtimeLabel?: string;
		goal: string;
		purpose: string;
	};
	actionCard: {
		jobNow: string;
		timebox: string;
		comeBackWith: string;
	};
	coach: {
		video?: LessonVideoContent;
		transcript?: LessonTranscriptContent;
		examples?: LessonExampleContent[];
		resources?: LessonResourceContent[];
	};
	workbench: {
		prompt?: string;
		teachingPoints?: string[];
		emptyState?: string;
		templateDownloadLabel?: string;
		templateDownloadHref?: string;
	};
};

export type LessonCoachContent = LessonContent["coach"];

export type LessonConfig = {
	id: string;
	slug: string;
	order: number;
	block: BlockId;
	title: string;
	shortTitle: string;
	shell: ShellType;
	workbench: WorkbenchType;
	artifact: ArtifactContract;
	nextLessonId?: string;
	prevLessonId?: string;
	unlocks?: LessonUnlockTargets;
	coachMode: CoachMode;
	externalTool?: ExternalTool;
	objectiveTitle: string;
	checklist: string[];
	objectiveMode?: ObjectiveMode;
	objectiveTasks?: ObjectiveTaskDefinition[];
	handoff?: LessonHandoff;
	helperText?: string;
	winCondition: string;
	panelDefaults: PanelDefaultState;
	pinnedArtifacts?: string[];
	fieldShapeVersion?: number;
	workbenchFields?: WorkbenchField[];
	workbenchSections?: WorkbenchSection[];
	promptImport?: LessonPromptImport;
	notes?: string[];
	content: LessonContent;
};

export type BlockConfig = {
	id: BlockId;
	label: string;
	level: number;
	summary: string;
	order: number;
	startsLocked: boolean;
};

export const splitPanelDefaults: PanelDefaultState = {
	coach: "docked",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};

export const focusPanelDefaults: PanelDefaultState = {
	coach: "pip",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};

export const missionPanelDefaults: PanelDefaultState = {
	coach: "minimized",
	transcript: "collapsed",
	examples: "collapsed",
	resources: "collapsed",
};
