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

export type LessonResourceContent = {
	id: string;
	label: string;
	href: string;
	kind: "download" | "internal" | "external";
};

export type LessonContent = {
	lessonId: string;
	slug: string;
	status: LessonContentStatus;
	intro: string;
	coach: {
		video?: LessonVideoContent;
		transcript?: LessonTranscriptContent;
		examples?: LessonExampleContent[];
		resources?: LessonResourceContent[];
	};
	workbench: {
		prompt?: string;
		steps?: string[];
		emptyState?: string;
		templateDownloadLabel?: string;
		templateDownloadHref?: string;
	};
	sourceRefs: string[];
};
