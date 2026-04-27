import type { LessonVideoContent } from "@/lib/course/lesson/model/contracts";
import type { BlueprintPageSectionId } from "@/lib/blueprint-flow/blueprint-page-sections";

const PACKET_BUNNY_LIBRARY_ID = 619172;

function buildBlueprintBunnyVideo(
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

export type BlueprintPageMedia =
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

type BlueprintVideoInventoryEntry = {
	key: string;
	title: string;
	video: LessonVideoContent;
};

const blueprintSectionMedia: Record<
	BlueprintPageSectionId,
	BlueprintPageMedia
> = {
	foundation: {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Name the thing clearly",
		description:
			"Lock the name, one-liner, and primary user before the rest of Product.",
		video: buildBlueprintBunnyVideo(
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
		body: "Capture the problem statement, the exact moment it hits, and how painful it is so the next blueprint page lands on a sharp problem definition.",
	},
	outcome: {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Define success and the flow",
		description:
			"Turn the outcome into a concrete success state, then list the numbered steps the user moves through.",
		video: buildBlueprintBunnyVideo(
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
		video: buildBlueprintBunnyVideo(
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
		body: "The preview is generated from the saved blueprint facts and reviewed from the downstream packet surfaces.",
	},
};

const blueprintStartPageMedia: BlueprintPageMedia = {
	kind: "video",
	eyebrow: "Watch first",
	badge: "Welcome",
	title: "Welcome video",
	description:
		"Build the folder, not just the app, before you jump into Product.",
	video: buildBlueprintBunnyVideo(
		"Welcome Video",
		"9b219f52-c2ed-450b-ab3f-3ef9ab3a870f",
	),
};

const blueprintReviewPageMedia: BlueprintPageMedia = {
	kind: "video",
	eyebrow: "Final pass",
	badge: "Review",
	title: "Review video",
	description:
		"Resolve the last blockers, then download the blueprint and blueprint.",
	video: buildBlueprintBunnyVideo(
		"Review Video",
		"61a62066-fb78-46e0-b788-6965eab8218b",
	),
};

export function getBlueprintPageSectionMedia(
	sectionId: BlueprintPageSectionId,
) {
	return blueprintSectionMedia[sectionId] ?? null;
}

export function getBlueprintStartPageMedia() {
	return blueprintStartPageMedia;
}

export function getBlueprintReviewPageMedia() {
	return blueprintReviewPageMedia;
}

export function getBlueprintVideoInventory() {
	const stageEntries = Object.entries(blueprintSectionMedia).flatMap(
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

	const startEntry: BlueprintVideoInventoryEntry | null =
		blueprintStartPageMedia.kind === "video"
			? {
					key: "start",
					title: blueprintStartPageMedia.title,
					video: blueprintStartPageMedia.video,
				}
			: null;

	const reviewEntry: BlueprintVideoInventoryEntry | null =
		blueprintReviewPageMedia.kind === "video"
			? {
					key: "review",
					title: blueprintReviewPageMedia.title,
					video: blueprintReviewPageMedia.video,
				}
			: null;

	return [startEntry, ...stageEntries, reviewEntry].filter(
		(entry): entry is BlueprintVideoInventoryEntry => entry !== null,
	);
}
