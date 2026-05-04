import type { LessonVideoContent } from "@/lib/course/lesson/model/contracts";
import type { CodebasePageSectionId } from "@/lib/codebase-flow/codebase-page-sections";

const PACKET_BUNNY_LIBRARY_ID = 619172;

function buildCodebaseBunnyVideo(
	title: string,
	videoId: string,
): LessonVideoContent {
	return {
		status: "ready",
		provider: "bunny",
		libraryId: PACKET_BUNNY_LIBRARY_ID,
		videoId,
		title,
	};
}

export type CodebasePageMedia =
	| {
			kind: "video";
			eyebrow: string;
			badge: string;
			title: string;
			description: string;
			video: LessonVideoContent;
	  }
	| {
			kind: "orientation";
			eyebrow: string;
			badge: string;
			title: string;
			description: string;
			body: string;
	  };

type CodebaseVideoInventoryEntry = {
	key: string;
	title: string;
	video: LessonVideoContent;
};

const codebaseSectionMedia: Record<CodebasePageSectionId, CodebasePageMedia> = {
	foundation: {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Name the thing clearly",
		description:
			"Lock the name, one-liner, and primary user before the rest of Product.",
		video: buildCodebaseBunnyVideo(
			"Product Foundation Video",
			"45709ba2-9bd2-4c9d-92e4-ea839b677408",
		),
	},
	problem: {
		kind: "orientation",
		eyebrow: "Read first",
		badge: "Product",
		title: "Problem checkpoint",
		description:
			"This page is intentionally text-first until the L2 recording is uploaded.",
		body: "Capture the problem statement, the exact moment it hits, and how painful it is so the next codebase page lands on a sharp problem definition.",
	},
	outcome: {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Define success and the flow",
		description:
			"Turn the outcome into a concrete success state, then list the numbered steps the user moves through.",
		video: buildCodebaseBunnyVideo(
			"Product Outcome Video",
			"0d7bff45-2dbb-4722-9a1d-de22a8348629",
		),
	},
	design: {
		kind: "orientation",
		eyebrow: "Read first",
		badge: "Design",
		title: "Pick the visual anchor",
		description:
			"Use the default theme color if it already feels right, or paste a hex from a shadcn preset.",
		body: "This page should stay lightweight. You are choosing the anchor color, not writing a whole visual strategy document.",
	},
	pricing: {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Build Plan",
		title: "Set the price",
		description:
			"Choose the one-time USD price the buyer sees. The compiler handles the downstream price formatting.",
		video: buildCodebaseBunnyVideo(
			"Build Plan Delivery Video",
			"b8d44210-c8c5-46a0-9d20-1998f3128aef",
		),
	},
	setup: {
		kind: "orientation",
		eyebrow: "Optional",
		badge: "Build Plan",
		title: "Refine the handoff",
		description:
			"Review the generated scope defaults, then add domain or contact details only if they matter right now.",
		body: "The generator can infer a first pass from the core flow. Only touch these fields if you want to steer the output.",
	},
	"generated-preview": {
		kind: "orientation",
		eyebrow: "Preview",
		badge: "Generated",
		title: "Inspect the generated preview",
		description:
			"Use this anchor for generated packet references and post-review lesson links.",
		body: "The preview is generated from the saved codebase facts and reviewed from the downstream packet surfaces.",
	},
};

const codebaseStartPageMedia: CodebasePageMedia = {
	kind: "video",
	eyebrow: "Watch first",
	badge: "Welcome",
	title: "Welcome video",
	description:
		"Build the folder, not just the app, before you jump into Product.",
	video: buildCodebaseBunnyVideo(
		"Welcome Video",
		"9b219f52-c2ed-450b-ab3f-3ef9ab3a870f",
	),
};

const codebaseReviewPageMedia: CodebasePageMedia = {
	kind: "video",
	eyebrow: "Final pass",
	badge: "Review",
	title: "Review video",
	description:
		"Resolve the last blockers, then download the codebase and codebase.",
	video: buildCodebaseBunnyVideo(
		"Review Video",
		"61a62066-fb78-46e0-b788-6965eab8218b",
	),
};

export function getCodebasePageSectionMedia(sectionId: CodebasePageSectionId) {
	return codebaseSectionMedia[sectionId] ?? null;
}

export function getCodebaseStartPageMedia() {
	return codebaseStartPageMedia;
}

export function getCodebaseReviewPageMedia() {
	return codebaseReviewPageMedia;
}

export function getCodebaseVideoInventory() {
	const stageEntries = Object.entries(codebaseSectionMedia).flatMap(
		([pageKey, media]) => {
			if (media.kind !== "video") {
				return [];
			}

			return [
				{
					key: pageKey,
					title: media.title,
					video: media.video,
				},
			];
		},
	);

	const startEntry: CodebaseVideoInventoryEntry | null =
		codebaseStartPageMedia.kind === "video"
			? {
					key: "start",
					title: codebaseStartPageMedia.title,
					video: codebaseStartPageMedia.video,
				}
			: null;

	const reviewEntry: CodebaseVideoInventoryEntry | null =
		codebaseReviewPageMedia.kind === "video"
			? {
					key: "review",
					title: codebaseReviewPageMedia.title,
					video: codebaseReviewPageMedia.video,
				}
			: null;

	return [startEntry, ...stageEntries, reviewEntry].filter(
		(entry): entry is CodebaseVideoInventoryEntry => entry !== null,
	);
}
