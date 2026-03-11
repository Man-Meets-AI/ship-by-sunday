export type LessonContentStatus = "outline" | "draft" | "ready";

export type ParsedLessonBlueprint = {
	lessonId: string;
	title: string;
	runtimeLabel: string;
	goal: string;
	purpose: string;
	suggestedOpeningLines: string[];
	beatsToCover: string[];
	onScreen: string[];
	watchouts: string[];
	suggestedClose: string[];
	pausePrompt: {
		jobNow: string;
		timebox: string;
		comeBackWith: string;
	};
};

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

export type LessonResourceContent = {
	id: string;
	label: string;
	href: string;
	kind: "download" | "internal" | "external";
};

export type LessonWorkbenchSectionContent = {
	instruction?: string;
	exampleLabel?: string;
	example?: string;
};

export type LessonContent = {
	lessonId: string;
	slug: string;
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
		sections?: Record<string, LessonWorkbenchSectionContent>;
	};
	sourceRefs: string[];
};
