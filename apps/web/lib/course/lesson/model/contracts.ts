import type { Id } from "@/convex/_generated/dataModel";

export type LessonStorageId = Id<"_storage">;
export type LessonKey = string;
export type VideoAssetId = string;

export type BlockId = "CEO" | "DESIGN" | "BUILD" | "SHIP";

export type ShellType = "split" | "focus" | "watch" | "mission";
export type LessonLayoutMode = "split" | "focus";

export type WorkbenchType =
	| "guided_form"
	| "score_table"
	| "collector_board"
	| "reference_gallery"
	| "capture_upload"
	| "paper_photo_upload"
	| "sketch_upload"
	| "core_flow_sketch"
	| "brief_assembler"
	| "console_checklist"
	| "roadmap_overview"
	| "tracker_log"
	| "external_workspace"
	| "build_setup_launchpad"
	| "visual_direction"
	| "competitor_research_light"
	| "repo_map_orientation"
	| "production_deploy_handoff"
	| "build_product_iteration"
	| "brand_kit_workbench"
	| "codex_marketing_site"
	| "checkout_qa_loop"
	| "build_setting_up_slices"
	| "fresh_template_plan"
	| "core_ux_plan_flow"
	| "core_ux_build"
	| "skills_quickstart"
	| "build_ship_roadmap"
	| "route_access_orientation";

export type CoachMode = "docked" | "pip";
export type CoachVideoPlacement = "coach" | "workbench";
export type WorkbenchMediaLayout = "stack" | "split";

export type ExternalTool = "figma" | "code" | "deploy" | "recording";

export type UploadFieldValue = {
	kind: "upload";
	status: "empty" | "selected" | "stored";
	fileName?: string;
	mimeType?: string;
	size?: number;
	storageId?: LessonStorageId;
	url?: string;
	previewUrl?: string;
};

export type ReferenceGalleryItem = {
	id: string;
	source: "upload" | "remote_url";
	url?: string;
	previewUrl?: string;
	fileName?: string;
	mimeType?: string;
	size?: number;
	storageId?: LessonStorageId;
};

export type ReferenceGalleryValue = {
	kind: "reference_gallery";
	items: ReferenceGalleryItem[];
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
		| "radio_group"
		| "toggle"
		| "select"
		| "image_upload"
		| "image_uploads"
		| "video_upload"
		| "table"
		| "board"
		| "reference_gallery"
		| "checklist"
		| "readonly";
	required?: boolean;
	minItems?: number;
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
	provider?: "mux" | "vimeo" | "loom" | "youtube" | "file" | "bunny";
	url?: string;
	libraryId?: number;
	videoId?: string;
	title?: string;
	posterUrl?: string;
	thumbnailFileName?: string;
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
	imageSrc?: string;
	imageAlt?: string;
	imageCaption?: string;
};

export type LessonPromptTemplateId =
	| "competitor_research"
	| "scope_boundary"
	| "visual_direction_guide";

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
	copySuccessToastMessage?: string;
};

export type LessonPromptImport =
	| {
			promptTemplateId: "competitor_research";
			tableFieldId: string;
			summaryFieldId: string;
	  }
	| {
			promptTemplateId: "scope_boundary";
			inScopeFieldId: string;
			outOfScopeFieldId: string;
			rationaleFieldId: string;
	  }
	| {
			promptTemplateId: "visual_direction_guide";
			markdownFieldId: string;
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

export type StageUnlockPreset = "ceo" | "design" | "build";

export type BriefAssemblerConfig =
	| {
			variant?: "default";
	  }
	| {
			variant: "stage_unlock";
			preset: StageUnlockPreset;
			leadVideo?: boolean;
			heroEyebrow: string;
			heroTitle: string;
			heroBody: string;
			nextStepLabel: string;
			skills: string[];
			artifactReadyCopy?: string;
			readyStateCopy?: string;
			completionCtaLabel?: string;
			celebrationEyebrow?: string;
			celebrationTitle?: string;
	  };

export type LessonConfig = {
	id: string;
	lessonKey: LessonKey;
	displayLabel: string;
	routeSegment: string;
	slug: string;
	order: number;
	block: BlockId;
	title: string;
	shortTitle: string;
	videoAssetId?: VideoAssetId | null;
	shell: ShellType;
	availableLayoutModes?: LessonLayoutMode[];
	workbench: WorkbenchType;
	artifact: ArtifactContract;
	nextLessonId?: string;
	prevLessonId?: string;
	nextLessonKey?: LessonKey;
	prevLessonKey?: LessonKey;
	unlocks?: LessonUnlockTargets;
	coachMode: CoachMode;
	coachVideoPlacement?: CoachVideoPlacement;
	workbenchMediaLayout?: WorkbenchMediaLayout;
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
	briefAssembler?: BriefAssemblerConfig;
	requireReadyVideoForCompletion?: boolean;
	nextStepLabel?: string;
	notes?: string[];
	content: LessonContent;
};

export type LessonSourceConfig = Omit<
	LessonConfig,
	| "lessonKey"
	| "displayLabel"
	| "routeSegment"
	| "videoAssetId"
	| "nextLessonKey"
	| "prevLessonKey"
>;

export type BlockConfig = {
	id: BlockId;
	label: string;
	level: number;
	summary: string;
	order: number;
	startsLocked: boolean;
};

export type VideoAssetDefinition = LessonVideoContent & {
	id: VideoAssetId;
};

export type CurriculumBlockDefinition = BlockConfig;

export type CurriculumLessonDefinition = {
	sourceId: string;
	lessonKey: LessonKey;
	displayLabel: string;
	routeSegment: string;
	blockId: BlockId;
	videoAssetId?: VideoAssetId | null;
};

export type CurriculumManifest = {
	version: number;
	blocks: CurriculumBlockDefinition[];
	lessons: CurriculumLessonDefinition[];
	legacyRouteAliases?: Record<string, string>;
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
